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
  Brush,
  ReferenceArea,
} from "recharts";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { Teacher } from "@db/schema";
import { useEffect, useState, useCallback } from "react";
import { useResizeObserver } from "@/hooks/use-resize";

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

// Custom label component for bar charts
const CustomBarLabel = ({ x, y, width, value }: any) => {
  if (width < 30) return null; // Don't show labels if bars are too narrow

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#666"
      textAnchor="middle"
      fontSize={11}
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
};

// Active shape component for pie chart hover effect
const ActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontSize={12}
      >{`${payload.subject}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#666"
        fontSize={11}
      >
        {`${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

// Responsive chart container component
const ResponsiveChartContainer = ({ children, minHeight = 300 }: { children: React.ReactNode, minHeight?: number }) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const dimensions = useResizeObserver(ref);

  return (
    <div ref={setRef} className="w-full" style={{ minHeight }}>
      {dimensions && (
        <div style={{ width: dimensions.width, height: Math.max(minHeight, dimensions.height) }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default function TeacherStats({ teachers }: TeacherStatsProps) {
  // Chart state
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>();
  const [lgaChartState, setLgaChartState] = useState({
    leftIndex: 0,
    rightIndex: 0,
    refAreaLeft: '',
    refAreaRight: '',
    isZooming: false
  });
  const [qualChartState, setQualChartState] = useState({
    leftIndex: 0,
    rightIndex: 0,
    refAreaLeft: '',
    refAreaRight: '',
    isZooming: false
  });

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
      qualification: qualification.length > 30 ? qualification.substring(0, 30) + "..." : qualification,
      count,
      total: totalTeachers,
      percentage: (count / totalTeachers * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);

  // Chart zoom handlers
  const handleBarChartMouseDown = (e: any, chartState: any, setChartState: any) => {
    if (!e) return;
    setChartState({
      ...chartState,
      refAreaLeft: e.activeLabel,
      isZooming: true
    });
  };

  const handleBarChartMouseMove = (e: any, chartState: any, setChartState: any) => {
    if (!chartState.isZooming) return;
    setChartState({
      ...chartState,
      refAreaRight: e.activeLabel
    });
  };

  const handleBarChartMouseUp = (chartState: any, setChartState: any) => {
    if (!chartState.isZooming) return;

    let leftIndex = chartState.refAreaLeft;
    let rightIndex = chartState.refAreaRight;

    if (leftIndex > rightIndex) {
      [leftIndex, rightIndex] = [rightIndex, leftIndex];
    }

    setChartState({
      leftIndex,
      rightIndex,
      refAreaLeft: '',
      refAreaRight: '',
      isZooming: false
    });
  };

  const resetZoom = (setChartState: any) => {
    setChartState({
      leftIndex: 0,
      rightIndex: 0,
      refAreaLeft: '',
      refAreaRight: '',
      isZooming: false
    });
  };

  return (
    <div className="space-y-6">
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* LGA Distribution */}
        <Card className="col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base sm:text-lg">Teachers by LGA</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Distribution of teachers across Local Government Areas
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => resetZoom(setLgaChartState)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ResponsiveChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={lgaData}
                  margin={{ top: 30, right: 30, left: 20, bottom: 90 }}
                  onMouseDown={(e) => handleBarChartMouseDown(e, lgaChartState, setLgaChartState)}
                  onMouseMove={(e) => handleBarChartMouseMove(e, lgaChartState, setLgaChartState)}
                  onMouseUp={() => handleBarChartMouseUp(lgaChartState, setLgaChartState)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="lga" 
                    angle={-45}
                    textAnchor="end"
                    height={90}
                    interval={0}
                    tick={{ fontSize: 12 }}
                    domain={[lgaChartState.leftIndex, lgaChartState.rightIndex]}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Number of Teachers', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip 
                    content={<CustomBarTooltip />}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#8884d8"
                    minPointSize={2}
                    label={<CustomBarLabel />}
                  />
                  {lgaChartState.refAreaLeft && lgaChartState.refAreaRight ? (
                    <ReferenceArea
                      x1={lgaChartState.refAreaLeft}
                      x2={lgaChartState.refAreaRight}
                      strokeOpacity={0.3}
                    />
                  ) : null}
                  <Brush 
                    dataKey="lga" 
                    height={30} 
                    stroke="#8884d8"
                    travellerWidth={10}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ResponsiveChartContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card className="col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg">Subject Distribution</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Top subjects taught across all schools
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ResponsiveChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 100, left: 20, bottom: 20 }}>
                  <Pie
                    data={subjectData}
                    dataKey="count"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    activeIndex={activePieIndex}
                    activeShape={ActiveShape}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(undefined)}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
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
            </ResponsiveChartContainer>
          </CardContent>
        </Card>

        {/* Qualification Distribution */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base sm:text-lg">Qualification Distribution</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Teacher qualifications across the system
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => resetZoom(setQualChartState)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ResponsiveChartContainer minHeight={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={qualificationData}
                  margin={{ top: 30, right: 30, left: 40, bottom: 90 }}
                  onMouseDown={(e) => handleBarChartMouseDown(e, qualChartState, setQualChartState)}
                  onMouseMove={(e) => handleBarChartMouseMove(e, qualChartState, setQualChartState)}
                  onMouseUp={() => handleBarChartMouseUp(qualChartState, setQualChartState)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="qualification" 
                    angle={-45}
                    textAnchor="end"
                    height={90}
                    interval={0}
                    tick={{ fontSize: 12 }}
                    domain={[qualChartState.leftIndex, qualChartState.rightIndex]}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Number of Teachers', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip 
                    content={<CustomBarTooltip />}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#82ca9d"
                    minPointSize={2}
                    label={<CustomBarLabel />}
                  />
                  {qualChartState.refAreaLeft && qualChartState.refAreaRight ? (
                    <ReferenceArea
                      x1={qualChartState.refAreaLeft}
                      x2={qualChartState.refAreaRight}
                      strokeOpacity={0.3}
                    />
                  ) : null}
                  <Brush 
                    dataKey="qualification" 
                    height={30} 
                    stroke="#82ca9d"
                    travellerWidth={10}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ResponsiveChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}