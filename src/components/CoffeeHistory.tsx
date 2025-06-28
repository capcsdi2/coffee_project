import React, { useState } from 'react';
import { CoffeeEntry } from '../types/coffee';
import { Coffee, Clock, Trash2, StickyNote, Calendar } from 'lucide-react';

interface CoffeeHistoryProps {
  entries: CoffeeEntry[];
  onDeleteEntry: (id: number) => void;
}

export const CoffeeHistory: React.FC<CoffeeHistoryProps> = ({ entries, onDeleteEntry }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredEntries = entries.filter(entry => entry.date === selectedDate);
  
  // Get the date range for the calendar input
  const getDateRange = () => {
    if (entries.length === 0) return { min: '', max: '' };
    
    const dates = entries.map(entry => entry.date).sort();
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    return { min: minDate, max: maxDate };
  };

  const { min: minDate, max: maxDate } = getDateRange();

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

  const formatDateShort = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  // Check if selected date has entries
  const hasEntriesForDate = (date: string) => {
    return entries.some(entry => entry.date === date);
  };

  // Navigate to previous/next date with entries
  const navigateToDate = (direction: 'prev' | 'next') => {
    const sortedDates = [...new Set(entries.map(entry => entry.date))].sort();
    const currentIndex = sortedDates.indexOf(selectedDate);
    
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDate(sortedDates[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < sortedDates.length - 1) {
      setSelectedDate(sortedDates[currentIndex + 1]);
    }
  };

  const canNavigatePrev = () => {
    const sortedDates = [...new Set(entries.map(entry => entry.date))].sort();
    const currentIndex = sortedDates.indexOf(selectedDate);
    return currentIndex > 0;
  };

  const canNavigateNext = () => {
    const sortedDates = [...new Set(entries.map(entry => entry.date))].sort();
    const currentIndex = sortedDates.indexOf(selectedDate);
    return currentIndex < sortedDates.length - 1 && currentIndex !== -1;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Coffee History</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToDate('prev')}
              disabled={!canNavigatePrev()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous date with entries"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => navigateToDate('next')}
              disabled={!canNavigateNext()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next date with entries"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Date Picker */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 px-3 py-2 shadow-sm hover:border-amber-500 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-opacity-20 transition-all">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate || new Date().toISOString().split('T')[0]}
                className="border-none outline-none bg-transparent text-sm font-medium text-gray-700 cursor-pointer"
              />
            </div>
            
            {/* Date indicator */}
            <div className="mt-1 text-xs text-center">
              {hasEntriesForDate(selectedDate) ? (
                <span className="text-green-600 font-medium">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                </span>
              ) : (
                <span className="text-gray-400">No entries</span>
              )}
            </div>
          </div>

          {/* Quick date buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Yesterday
            </button>
          </div>
        </div>
      </div>

      {/* Selected date display */}
      <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">{formatDate(selectedDate)}</h3>
            <p className="text-sm text-gray-600">
              {filteredEntries.length === 0 
                ? 'No coffee records for this date' 
                : `${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'} found`
              }
            </p>
          </div>
          {filteredEntries.length > 0 && (
            <div className="text-right">
              <div className="text-lg font-bold text-amber-700">
                {filteredEntries.reduce((sum, entry) => sum + entry.caffeine, 0)}mg
              </div>
              <div className="text-xs text-amber-600">Total Caffeine</div>
            </div>
          )}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Coffee className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No coffee records for {formatDateShort(selectedDate)}</p>
          <p className="text-gray-400 text-sm mt-1">
            {entries.length === 0 
              ? 'Add your first coffee entry to get started!' 
              : 'Try selecting a different date or add a new entry for this date.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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