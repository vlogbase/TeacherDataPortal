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
import { Button } from "@/components/ui/button";
import type { Teacher } from "@db/schema";

type TeacherStatsProps = {
  teachers: Teacher[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Custom tooltip for bar charts
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-medium text-sm mb-1">{label}</p>
      <p className="text-sm text-gray-600">
        Teachers: <span className="font-medium">{payload[0].value}</span>
      </p>
    </div>
  );
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-medium text-sm mb-1">{payload[0].name}</p>
      <p className="text-sm text-gray-600">
        Teachers: <span className="font-medium">{payload[0].value}</span>
      </p>
    </div>
  );
};

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
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
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
      qualification: qualification.length > 30 ? qualification.substring(0, 30) + "..." : qualification,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-background">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-2xl sm:text-3xl font-bold">{totalTeachers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* LGA Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Teachers by LGA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={lgaData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 40,
                    bottom: 60
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="lga"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{
                      value: 'Number of Teachers',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -20
                    }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" fill="#2D6A4F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Qualification Distribution */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Qualification Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={qualificationData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 40,
                    bottom: 60
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="qualification"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{
                      value: 'Number of Teachers',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -20
                    }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}