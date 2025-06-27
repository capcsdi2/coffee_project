import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Calendar, Coffee, TrendingUp, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyOverviewProps {
  entries: Array<{
    date: string;
    type: string;
    size: string;
    caffeine: number;
  }>;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({ entries }) => {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.

  const monthData = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + selectedMonthOffset, 1);
    const targetMonth = targetDate.toISOString().slice(0, 7);
    
    const monthlyEntries = entries.filter(entry => entry.date.startsWith(targetMonth));
    
    const totalCups = monthlyEntries.length;
    const totalCaffeine = monthlyEntries.reduce((sum, entry) => sum + entry.caffeine, 0);
    const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    const avgDailyCups = totalCups / daysInMonth;
    
    // Coffee type distribution for pie chart
    const typeCount = monthlyEntries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const pieData = Object.entries(typeCount).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: totalCups > 0 ? ((count / totalCups) * 100).toFixed(1) : '0'
    }));

    // Daily consumption for area chart
    const dailyData = [];
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    const today = new Date();
    const maxDate = targetDate.getMonth() === today.getMonth() && targetDate.getFullYear() === today.getFullYear() ? today : endOfMonth;
    
    for (let d = new Date(startOfMonth); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = monthlyEntries.filter(entry => entry.date === dateStr);
      dailyData.push({
        date: d.getDate(),
        cups: dayEntries.length,
        caffeine: dayEntries.reduce((sum, entry) => sum + entry.caffeine, 0)
      });
    }

    return {
      monthlyEntries,
      totalCups,
      totalCaffeine,
      avgDailyCups,
      pieData,
      dailyData,
      targetDate,
      monthName: targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [entries, selectedMonthOffset]);

  const canGoBack = () => {
    // Allow going back up to 12 months
    return selectedMonthOffset > -12;
  };

  const canGoForward = () => {
    // Don't allow going into future months
    return selectedMonthOffset < 0;
  };

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316', '#06b6d4', '#84cc16'];

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-indigo-600">
            <span className="font-medium">Count:</span> {data.value} cups
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Percentage:</span> {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">Day {label}</p>
          <p className="text-amber-600">
            <span className="font-medium">Cups:</span> {payload[0].value}
          </p>
          <p className="text-emerald-600">
            <span className="font-medium">Caffeine:</span> {payload[1]?.value || 0}mg
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Calendar className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Monthly Overview</h2>
            <p className="text-gray-600">{monthData.monthName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              {monthData.avgDailyCups.toFixed(1)} cups/day
            </span>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setSelectedMonthOffset(prev => prev - 1)}
              disabled={!canGoBack()}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
                {selectedMonthOffset === 0 ? 'This Month' : 
                 selectedMonthOffset === -1 ? 'Last Month' : 
                 `${Math.abs(selectedMonthOffset)} months ago`}
              </span>
            </div>
            
            <button
              onClick={() => setSelectedMonthOffset(prev => prev + 1)}
              disabled={!canGoForward()}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Cups</p>
              <p className="text-2xl font-bold">{monthData.totalCups}</p>
            </div>
            <Coffee className="w-6 h-6 text-indigo-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Caffeine</p>
              <p className="text-2xl font-bold">{monthData.totalCaffeine}mg</p>
            </div>
            <Zap className="w-6 h-6 text-emerald-200" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coffee Type Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Coffee Types</h3>
          {monthData.pieData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monthData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {monthData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-1 mt-2">
                {monthData.pieData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600 truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No coffee data for this month</p>
              </div>
            </div>
          )}
        </div>

        {/* Daily Consumption Trend */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Daily Trend</h3>
          {monthData.dailyData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthData.dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="cups" 
                    stroke="#6366f1" 
                    fill="url(#monthlyGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No trend data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};