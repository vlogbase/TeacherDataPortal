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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { Teacher } from "@db/schema";

type TeacherStatsProps = {
  teachers: Teacher[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function TeacherStats({ teachers }: TeacherStatsProps) {
  // Calculate statistics
  const totalTeachers = teachers.length;

  // Calculate teachers by LGA
  const teachersByLGA = teachers.reduce((acc: Record<string, number>, teacher) => {
    acc[teacher.lga] = (acc[teacher.lga] || 0) + 1;
    return acc;
  }, {});

  const lgaData = Object.entries(teachersByLGA).map(([lga, count]) => ({
    lga,
    count,
    percentage: (count / totalTeachers * 100).toFixed(1),
  }));

  // Calculate subject distribution
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
      percentage: (count / totalTeachers * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate qualification distribution
  const qualificationCounts = teachers.reduce((acc: Record<string, number>, teacher) => {
    const quals = teacher.qualifications.split(",");
    quals.forEach((qual) => {
      const trimmed = qual.trim();
      acc[trimmed] = (acc[trimmed] || 0) + 1;
    });
    return acc;
  }, {});

  const qualificationData = Object.entries(qualificationCounts)
    .map(([qualification, count]) => ({
      qualification,
      count,
      percentage: (count / totalTeachers * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTeachers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teachers by LGA</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lgaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lga" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} teachers`, name]}
                  labelFormatter={(label) => `LGA: ${label}`}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Subjects Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData}
                  dataKey="count"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ subject, percentage }) => `${subject} (${percentage}%)`}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Qualification Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualificationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="qualification" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} teachers`, name]}
                  labelFormatter={(label) => `Qualification: ${label}`}
                />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}