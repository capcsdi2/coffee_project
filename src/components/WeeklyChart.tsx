import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Coffee, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface WeeklyChartProps {
  entries: Array<{
    date: string;
    type: string;
    size: string;
    caffeine: number;
  }>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ entries }) => {
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  const weekData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (selectedWeekOffset * 7));
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    return weekDays.map(date => {
      const dayEntries = entries.filter(entry => entry.date === date);
      return {
        date,
        cups: dayEntries.length,
        caffeine: dayEntries.reduce((sum, entry) => sum + entry.caffeine, 0)
      };
    });
  }, [entries, selectedWeekOffset]);

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getWeekRange = () => {
    const firstDay = weekData[0]?.date;
    const lastDay = weekData[6]?.date;
    if (!firstDay || !lastDay) return '';
    
    const start = new Date(`${firstDay}T00:00:00`);
    const end = new Date(`${lastDay}T00:00:00`);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const chartData = weekData.map(day => ({
    ...day,
    day: formatDate(day.date)
  }));

  const totalWeeklyCups = weekData.reduce((sum, day) => sum + day.cups, 0);
  const totalWeeklyCaffeine = weekData.reduce((sum, day) => sum + day.caffeine, 0);
  const avgDailyCups = totalWeeklyCups / 7;

  const canGoBack = () => {
    // Allow going back up to 12 weeks
    return selectedWeekOffset > -12;
  };

  const canGoForward = () => {
    // Don't allow going into future weeks
    return selectedWeekOffset < 0;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{label}</p>
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
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Weekly Overview</h2>
            <p className="text-gray-600">{getWeekRange()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              {avgDailyCups.toFixed(1)} cups/day avg
            </span>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setSelectedWeekOffset(prev => prev - 1)}
              disabled={!canGoBack()}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                {selectedWeekOffset === 0 ? 'This Week' : 
                 selectedWeekOffset === -1 ? 'Last Week' : 
                 `${Math.abs(selectedWeekOffset)} weeks ago`}
              </span>
            </div>
            
            <button
              onClick={() => setSelectedWeekOffset(prev => prev + 1)}
              disabled={!canGoForward()}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white text-center">
          <p className="text-blue-100 text-xs">Total Cups</p>
          <p className="text-xl font-bold">{totalWeeklyCups}</p>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-3 text-white text-center">
          <p className="text-emerald-100 text-xs">Caffeine</p>
          <p className="text-xl font-bold">{totalWeeklyCaffeine}mg</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white text-center">
          <p className="text-purple-100 text-xs">Daily Avg</p>
          <p className="text-xl font-bold">{avgDailyCups.toFixed(1)}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              yAxisId="cups"
              orientation="left"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              yAxisId="caffeine"
              orientation="right"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              yAxisId="cups"
              dataKey="cups" 
              fill="url(#cupsGradient)" 
              radius={[4, 4, 0, 0]}
              name="Cups"
            />
            <Line 
              yAxisId="caffeine"
              type="monotone" 
              dataKey="caffeine" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Caffeine"
            />
            <defs>
              <linearGradient id="cupsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};