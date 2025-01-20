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
  Sector,
} from "recharts";
import type { Teacher } from "@db/schema";

type TeacherStatsProps = {
  teachers: Teacher[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const RADIAN = Math.PI / 180;

// Custom tooltip for bar charts
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-medium text-sm mb-1">{label}</p>
      <p className="text-sm text-gray-600">
        Teachers: <span className="font-medium">{payload[0].value}</span>
      </p>
      <p className="text-sm text-gray-600">
        Percentage: <span className="font-medium">
          {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
        </span>
      </p>
    </div>
  );
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-medium text-sm mb-1">{data.subject}</p>
      <p className="text-sm text-gray-600">
        Teachers: <span className="font-medium">{data.count}</span>
      </p>
      <p className="text-sm text-gray-600">
        Percentage: <span className="font-medium">{data.percentage}%</span>
      </p>
    </div>
  );
};

// Custom label component for bar charts with smart positioning
const CustomBarLabel = ({ x, y, width, value, viewBox }: any) => {
  // Calculate position to avoid overlaps
  const xPos = x + width / 2;
  const yPos = y - 10; // Adjust based on value size
  const textAnchor = "middle";

  // Only show label if there's enough space
  if (width < 20) return null;

  return (
    <text
      x={xPos}
      y={yPos}
      fill="#666"
      textAnchor={textAnchor}
      fontSize={12}
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
};

// Custom label component for pie chart with dynamic positioning
const CustomPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
  name,
}: any) => {
  const radius = outerRadius * 1.4; // Increase label distance from pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Calculate text anchor based on position to prevent overlapping
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <g>
      {/* Draw connecting line */}
      <path
        d={`M${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${
          cy + outerRadius * Math.sin(-midAngle * RADIAN)
        }L${x},${y}`}
        stroke="#666"
        fill="none"
      />
      {/* Draw label text */}
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill="#666"
        fontSize={12}
        dominantBaseline="middle"
      >
        {`${name} (${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
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
    total: totalTeachers,
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
      total: totalTeachers,
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
      qualification: qualification.length > 25 ? qualification.substring(0, 25) + "..." : qualification,
      count,
      total: totalTeachers,
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
              <BarChart 
                data={lgaData}
                margin={{ top: 30, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="lga" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  content={<CustomBarTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#8884d8"
                  label={<CustomBarLabel />}
                  minPointSize={2}
                />
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
              <PieChart margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
                <Pie
                  data={subjectData}
                  dataKey="count"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={CustomPieLabel}
                  labelLine={false}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomPieTooltip />}
                />
                <Legend 
                  layout="vertical" 
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ 
                    fontSize: '12px',
                    paddingLeft: '20px',
                  }}
                />
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
              <BarChart 
                data={qualificationData}
                margin={{ top: 30, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="qualification" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  content={<CustomBarTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#82ca9d"
                  label={<CustomBarLabel />}
                  minPointSize={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}