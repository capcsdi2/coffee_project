import React, { useState } from 'react';
import { CoffeeEntry } from '../types/coffee';
import { Coffee, Clock, Trash2, StickyNote } from 'lucide-react';

interface CoffeeHistoryProps {
  entries: CoffeeEntry[];
  onDeleteEntry: (id: number) => void;
}

export const CoffeeHistory: React.FC<CoffeeHistoryProps> = ({ entries, onDeleteEntry }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredEntries = entries.filter(entry => entry.date === selectedDate);
  const uniqueDates = [...new Set(entries.map(entry => entry.date))].sort((a, b) => b.localeCompare(a));

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCoffeeIcon = (type: string) => {
    return <Coffee className="w-5 h-5" />;
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Small': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-green-100 text-green-800';
      case 'Large': return 'bg-orange-100 text-orange-800';
      case 'Extra Large': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Coffee History</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            {uniqueDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Coffee className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No coffee records for this date</p>
          <p className="text-gray-400 text-sm mt-1">Add your first coffee entry to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} on {formatDate(selectedDate)}
          </div>
          
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    {getCoffeeIcon(entry.type)}
                    <Coffee className="w-5 h-5 text-amber-700" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{entry.type}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(entry.size)}`}>
                        {entry.size}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {entry.caffeine}mg
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(entry.time)}
                      </div>
                      <div>
                        {entry.brewingMethod}
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-gray-50 rounded-lg">
                        <StickyNote className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => onDeleteEntry(entry.id!)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};