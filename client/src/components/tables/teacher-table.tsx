import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Pencil, Trash2 } from "lucide-react";
import type { Teacher } from "@db/schema";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type TeacherTableProps = {
  teachers: Teacher[];
  isLoading: boolean;
  onSearch: (term: string) => void;
};

export default function TeacherTable({
  teachers,
  isLoading,
  onSearch,
}: TeacherTableProps) {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteTeacher = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete teacher");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete teacher",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="p-4">
        <Input
          placeholder="Search teachers..."
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>School</TableHead>
            <TableHead>LGA</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Qualifications</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.school}</TableCell>
              <TableCell>{teacher.lga}</TableCell>
              <TableCell>{teacher.subjectsTaught}</TableCell>
              <TableCell>{teacher.qualifications}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/edit-teacher/${teacher.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {user?.isAdmin && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteTeacher.mutate(teacher.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
