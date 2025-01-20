import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Teacher } from "@db/schema";

type TeacherStatsProps = {
  teachers: Teacher[];
};

export default function TeacherStats({ teachers }: TeacherStatsProps) {
  // Calculate statistics
  const totalTeachers = teachers.length;
  
  const teachersByLGA = teachers.reduce((acc: Record<string, number>, teacher) => {
    acc[teacher.lga] = (acc[teacher.lga] || 0) + 1;
    return acc;
  }, {});

  const lgaData = Object.entries(teachersByLGA).map(([lga, count]) => ({
    lga,
    count,
  }));

  const subjectCounts = teachers.reduce((acc: Record<string, number>, teacher) => {
    const subjects = teacher.subjectsTaught.split(",");
    subjects.forEach((subject) => {
      const trimmed = subject.trim();
      acc[trimmed] = (acc[trimmed] || 0) + 1;
    });
    return acc;
  }, {});

  const subjectData = Object.entries(subjectCounts)
    .map(([subject, count]) => ({
      subject,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Total Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalTeachers}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teachers by LGA</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lgaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lga" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Subjects</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
