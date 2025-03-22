import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  Pie,
  Cell, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { PieChart as LucidePieChart, BarChart3, LineChart as LucideLineChart } from "lucide-react";

// Define the schedule type based on the data structure in page.tsx
interface Schedule {
  id: string;
  meetingId: string;
  bots: number;
  duration: number;
  country: string;
  status: string;
  date: string;
}

interface DashboardGraphsProps {
  schedules: Schedule[];
}

// Custom Label Component for Pie Chart
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value } = props;
  
  // Calculate the position for the label
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.1; // Position slightly outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Only render label if the segment is large enough (prevents cluttering)
  if (percent < 0.05) return null;
  
  // Determine text anchor based on position relative to center
  const textAnchor = x > cx ? 'start' : 'end';
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="#666"
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize="12"
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const DashboardGraphs: React.FC<DashboardGraphsProps> = ({ schedules }) => {
  // Process data for status distribution chart (Pie chart)
  const statusData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {};
    
    schedules.forEach(schedule => {
      if (statusCounts[schedule.status]) {
        statusCounts[schedule.status] += 1;
      } else {
        statusCounts[schedule.status] = 1;
      }
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
  }, [schedules]);
  
  // Process data for country distribution (Bar chart)
  const countryData = React.useMemo(() => {
    const countryCounts: Record<string, number> = {};
    
    schedules.forEach(schedule => {
      if (countryCounts[schedule.country]) {
        countryCounts[schedule.country] += 1;
      } else {
        countryCounts[schedule.country] = 1;
      }
    });
    
    return Object.keys(countryCounts).map(country => ({
      name: country,
      count: countryCounts[country]
    }));
  }, [schedules]);
  
  // Process data for bot usage over time (Line chart)
  const botUsageData = React.useMemo(() => {
    // Create a map of dates to total bots
    const dateMap: Record<string, number> = {};
    
    // Sort schedules by date
    const sortedSchedules = [...schedules].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedSchedules.forEach(schedule => {
      if (dateMap[schedule.date]) {
        dateMap[schedule.date] += schedule.bots;
      } else {
        dateMap[schedule.date] = schedule.bots;
      }
    });
    
    // Convert to array format for recharts
    return Object.keys(dateMap).map(date => ({
      date,
      bots: dateMap[date]
    }));
  }, [schedules]);
  
  // Colors for the pie chart - enhanced with better contrast
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Meeting Status Distribution */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <LucidePieChart className="h-5 w-5" />
            Meeting Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedLabel}
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} meetings`, 'Count']} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Country Distribution */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <BarChart3 className="h-5 w-5" />
            Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={countryData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Meetings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Bot Usage Over Time */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <LucideLineChart className="h-5 w-5" />
            Bot Usage Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={botUsageData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bots" stroke="#8884d8" activeDot={{ r: 8 }} name="Bots" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardGraphs;