// lib/dataUtils.ts
import { previousSchedules } from '@/app/data/constants';

export interface Schedule {
  id: string;
  meetingId: string;
  bots: number;
  duration: number;
  country: string;
  status: string;
  date: string;
}

/**
 * Transforms previous schedules data for use in charts and graphs
 */
export function prepareScheduleDataForCharts() {
  // Monthly meeting count data
  const monthlyMeetingCounts = getMonthlyMeetingCounts();
  
  // Distribution data for pie chart
  const distributionData = getDistributionData();
  
  return {
    monthlyMeetingCounts,
    distributionData
  };
}

/**
 * Get monthly meeting counts for bar chart
 */
function getMonthlyMeetingCounts() {
  const monthCounts: Record<string, number> = {};
  
  // Initialize all months from Jun 2024 to Mar 2025
  const months = ['2024-Jun', '2024-Jul', '2024-Aug', '2024-Sep', '2024-Oct', 
                 '2024-Nov', '2024-Dec', '2025-Jan', '2025-Feb', '2025-Mar'];
  
  months.forEach(month => {
    monthCounts[month] = 0;
  });
  
  // Count meetings by month
  previousSchedules.forEach(schedule => {
    // Extract month from date (format: "Mar 15, 2025")
    const dateParts = schedule.date.split(", ");
    const year = dateParts[1];
    const month = dateParts[0].split(" ")[0];
    const key = `${year}-${month}`;
    
    if (monthCounts[key] !== undefined) {
      monthCounts[key] += 1;
    }
  });
  
  // Convert to array format for recharts
  return months.map(month => ({
    name: month,
    'Gate Pass Count': monthCounts[month]
  }));
}

/**
 * Get distribution data for pie chart
 */
function getDistributionData() {
  // Count schedules by status and other metrics
  const counts = {
    Customers: previousSchedules.length,
    Users: previousSchedules.reduce((sum, s) => sum + s.bots, 0),
    Roles: Math.round(previousSchedules.length * 0.3), // Simulated data
    Groups: Math.round(previousSchedules.length * 0.2), // Simulated data
    Features: Math.round(previousSchedules.length * 0.1), // Simulated data
    'Gate Passes': previousSchedules.length,
    Items: Math.round(previousSchedules.length * 0.05) // Simulated data
  };
  
  // Convert to array format for recharts
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value
  }));
}

/**
 * Get meeting data by status
 */
export function getMeetingsByStatus() {
  const statusCounts: Record<string, number> = {
    'Completed': 0,
    'Failed': 0,
    'Active': 0
  };
  
  previousSchedules.forEach(schedule => {
    statusCounts[schedule.status] = (statusCounts[schedule.status] || 0) + 1;
  });
  
  return Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  }));
}