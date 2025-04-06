import React, { useState, useEffect } from 'react';
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
import { getPreviousSchedules, Schedule as ScheduleData } from '@/lib/firebase/schedule';
import Cookies from 'js-cookie';
import { toast } from "sonner";

// Define a type for chart display data
interface ChartSchedule {
  id: string;
  meetingId: string;
  quantity: number;
  duration: number;
  countryCode: string;
  country: string;
  status: string;
  date: string;
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

const DashboardGraphs: React.FC = () => {
  const [schedules, setSchedules] = useState<ChartSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch schedules from Firebase
  useEffect(() => {
    const fetchSchedules = async () => {
      const userId = Cookies.get('session');
      if (!userId) {
        toast.error("Please log in to view dashboard data");
        setLoading(false);
        return;
      }

      try {
        const fetchedSchedules = await getPreviousSchedules(userId);
        
        // Process the data to match the expected format for chart display
        const processedSchedules: ChartSchedule[] = fetchedSchedules.map(schedule => {
          // Convert timestamp to date string for chart display
          let dateString = 'N/A';
          if (schedule.createdAt) {
            // Firebase timestamps have toDate() method
            const date = schedule.createdAt.toDate ? 
              schedule.createdAt.toDate() : 
              new Date(schedule.createdAt);
            dateString = date.toISOString().split('T')[0];
          }
          
          return {
            id: schedule.id,
            meetingId: schedule.meetingId,
            quantity: schedule.quantity || 0, // Default to 0 if undefined
            duration: schedule.duration || 0,
            countryCode: schedule.countryCode,
            country: schedule.countryCode, // We'll use country codes for now
            status: schedule.status,
            date: dateString
          };
        });
        
        setSchedules(processedSchedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

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
        dateMap[schedule.date] += schedule.quantity;
      } else {
        dateMap[schedule.date] = schedule.quantity;
      }
    });
    
    // Convert to array format for recharts
    return Object.keys(dateMap).map(date => ({
      date,
      bots: dateMap[date]
    }));
  }, [schedules]);
  
  // Colors for the pie chart - enhanced with better contrast
  // Explicitly add red for failed status
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF0000'];
  
  // Total meetings count
  const totalMeetings = schedules.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Loading Dashboard Data...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Meeting Status Distribution */}
      <Card className="dark:bg-slate-800 dark:border-slate-700 relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <LucidePieChart className="h-5 w-5" />
            Meeting Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No meeting data available
            </div>
          ) : (
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
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name.toLowerCase() === 'failed' || entry.name.toLowerCase() === 'cancelled'
                            ? '#FF0000'  // Bright red for failed/cancelled status
                            : entry.name.toLowerCase() === 'completed'
                            ? '#00C49F'  // Green for completed
                            : COLORS[index % COLORS.length]
                        } 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} meetings`, 'Count']} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Total Meetings Badge */}
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full px-3 py-1 text-xs">
            Total: {totalMeetings}
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
          {schedules.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No country data available
            </div>
          ) : (
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
                  <Bar dataKey="count" fill="#1b09d9" name="Meetings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
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
          {schedules.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No bot usage data available
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardGraphs;