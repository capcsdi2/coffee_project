import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Coffee } from 'lucide-react';

interface WeeklyChartProps {
  data: Array<{
    date: string;
    cups: number;
    caffeine: number;
  }>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const chartData = data.map(day => ({
    ...day,
    day: formatDate(day.date)
  }));

  const totalWeeklyCups = data.reduce((sum, day) => sum + day.cups, 0);
  const totalWeeklyCaffeine = data.reduce((sum, day) => sum + day.caffeine, 0);
  const avgDailyCups = totalWeeklyCups / 7;

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
            <p className="text-gray-600">Last 7 days consumption</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              {avgDailyCups.toFixed(1)} cups/day avg
            </span>
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