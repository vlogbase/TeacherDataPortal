import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/navigation";
import TeacherStats from "@/components/analytics/teacher-stats";
import TeacherTable from "@/components/tables/teacher-table";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { Teacher } from "@db/schema";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lga.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
          <Button onClick={() => navigate("/add-teacher")}>
            Add New Teacher
          </Button>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
          <TeacherStats teachers={teachers} />
        </div>

        <div className="bg-white rounded-lg shadow">
          <TeacherTable 
            teachers={filteredTeachers}
            isLoading={isLoading}
            onSearch={setSearchTerm}
          />
        </div>
      </main>
    </div>
  );
}
