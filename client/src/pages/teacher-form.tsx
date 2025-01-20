import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/navigation";
import type { Teacher } from "@db/schema";

// Omit the auto-generated fields and userId from the form data
type TeacherFormData = Omit<Teacher, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

export default function TeacherForm() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Extract teacher ID from URL if editing
  const teacherId = location.includes("/edit-teacher/") 
    ? parseInt(location.split("/edit-teacher/")[1])
    : null;

  const isEditing = !!teacherId;

  const form = useForm<TeacherFormData>({
    defaultValues: {
      name: "",
      email: "",
      qualifications: "",
      subjectsTaught: "",
      school: "",
      lga: "",
      employmentDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch teacher data if editing
  const { data: teacher } = useQuery<Teacher>({
    queryKey: [`/api/teachers/${teacherId}`],
    enabled: isEditing,
  });

  // Populate form with teacher data when available
  useEffect(() => {
    if (teacher) {
      form.reset({
        ...teacher,
        employmentDate: new Date(teacher.employmentDate).toISOString().split('T')[0],
      });
    }
  }, [teacher, form]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      const response = await fetch(
        isEditing ? `/api/teachers/${teacherId}` : "/api/teachers",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            employmentDate: new Date(data.employmentDate),
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Success",
        description: `Teacher ${isEditing ? "updated" : "added"} successfully`,
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: TeacherFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Teacher" : "Add New Teacher"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...form.register("name", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input
                    id="qualifications"
                    {...form.register("qualifications", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects Taught</Label>
                  <Input
                    id="subjects"
                    placeholder="Separate subjects with commas"
                    {...form.register("subjectsTaught", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    {...form.register("school", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lga">LGA</Label>
                  <Input
                    id="lga"
                    {...form.register("lga", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentDate">Employment Date</Label>
                  <Input
                    id="employmentDate"
                    type="date"
                    {...form.register("employmentDate", { required: true })}
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Teacher" : "Add Teacher"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}