import React from 'react';
import { Coffee, Zap, Target, Calendar } from 'lucide-react';

interface StatsOverviewProps {
  todayStats: {
    totalCups: number;
    totalCaffeine: number;
    avgCupSize: string;
    mostCommonType: string;
  };
  totalEntries: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ todayStats, totalEntries }) => {
  const stats = [
    {
      label: "Today's Cups",
      value: todayStats.totalCups,
      icon: Coffee,
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      textColor: 'text-white'
    },
    {
      label: "Caffeine (mg)",
      value: todayStats.totalCaffeine,
      icon: Zap,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      textColor: 'text-white'
    },
    {
      label: "Avg Cup Size",
      value: todayStats.avgCupSize,
      icon: Target,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      textColor: 'text-white'
    },
    {
      label: "Total Records",
      value: totalEntries,
      icon: Calendar,
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`${stat.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-white/20 rounded-xl backdrop-blur-sm`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${stat.textColor}`}>
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </div>
              <div className={`text-sm ${stat.textColor} opacity-90`}>
                {stat.label}
              </div>
            </div>
          </div>
          
          {/* Progress bar for caffeine */}
          {stat.label === "Caffeine (mg)" && (
            <div className="mt-4">
              <div className="bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min((todayStats.totalCaffeine / 400) * 100, 100)}%` }}
                />
              </div>
              <div className={`text-xs ${stat.textColor} opacity-75 mt-1`}>
                Daily limit: 400mg
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};