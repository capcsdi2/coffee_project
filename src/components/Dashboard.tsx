import React, { useState, useMemo, useEffect } from 'react';
import { CoffeeEntry as CoffeeEntryType, DailyStats } from '../types/coffee';
import { CoffeeEntry, databaseService } from '../services/database';
import { StatsOverview } from './StatsOverview';
import { AddCoffeeForm } from './AddCoffeeForm';
import { CoffeeHistory } from './CoffeeHistory';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyOverview } from './MonthlyOverview';
import { PasscodeModal } from './PasscodeModal';
import { AdminPanel } from './AdminPanel';
import { Coffee, TrendingUp, Shield } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [entries, setEntries] = useState<CoffeeEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [passcodeAction, setPasscodeAction] = useState<'add' | 'admin'>('add');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await databaseService.init();
      await loadEntries();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      const dbEntries = await databaseService.getAllEntries();
      setEntries(dbEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(entry => entry.date === today);
    
    return {
      totalCups: todayEntries.length,
      totalCaffeine: todayEntries.reduce((sum, entry) => sum + entry.caffeine, 0),
      avgCupSize: todayEntries.length > 0 ? 'Medium' : 'N/A',
      mostCommonType: todayEntries.length > 0 ? todayEntries[0].type : 'N/A'
    };
  }, [entries]);

  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayEntries = entries.filter(entry => entry.date === date);
      return {
        date,
        cups: dayEntries.length,
        caffeine: dayEntries.reduce((sum, entry) => sum + entry.caffeine, 0)
      };
    });
  }, [entries]);

  const handleAddEntryClick = () => {
    setPasscodeAction('add');
    setShowPasscodeModal(true);
  };

  const handleAdminClick = () => {
    setPasscodeAction('admin');
    setShowPasscodeModal(true);
  };

  const handlePasscodeSuccess = () => {
    if (passcodeAction === 'add') {
      setShowAddForm(true);
    } else {
      setShowAdminPanel(true);
    }
  };

  const addEntry = async (entry: Omit<CoffeeEntryType, 'id'>) => {
    try {
      await databaseService.addEntry({
        date: entry.date,
        time: entry.time,
        type: entry.type,
        size: entry.size,
        brewingMethod: entry.brewingMethod,
        caffeine: entry.caffeine,
        notes: entry.notes
      });
      await loadEntries();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add entry:', error);
    }
  };

  const deleteEntry = async (id: string | number) => {
    try {
      await databaseService.deleteEntry(Number(id));
      await loadEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const updateEntry = async (id: number, entry: Partial<CoffeeEntry>) => {
    try {
      await databaseService.updateEntry(id, entry);
      await loadEntries();
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  };

  // Convert database entries to component format
  const convertedEntries = entries.map(entry => ({
    ...entry,
    id: entry.id?.toString() || ''
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coffee tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Coffee className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Daily Coffee Tracker</h1>
              <p className="text-gray-600">Monitor your daily caffeine intake and brewing habits</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleAddEntryClick}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Coffee className="w-5 h-5" />
              Add Coffee Entry
            </button>
            <button
              onClick={handleAdminClick}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Admin Panel
            </button>
            <div className="flex items-center gap-2 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {todayStats.totalCups} cups today
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview 
          todayStats={todayStats}
          totalEntries={entries.length}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <WeeklyChart data={weeklyData} />
          <MonthlyOverview entries={entries} />
        </div>

        {/* Coffee History */}
        <CoffeeHistory 
          entries={convertedEntries}
          onDeleteEntry={deleteEntry}
        />

        {/* Passcode Modal */}
        <PasscodeModal
          isOpen={showPasscodeModal}
          onClose={() => setShowPasscodeModal(false)}
          onSuccess={handlePasscodeSuccess}
          title={passcodeAction === 'add' ? 'Add Coffee Entry' : 'Admin Access'}
          description={passcodeAction === 'add' ? 'Enter passcode to add a new coffee entry' : 'Enter admin passcode to access management panel'}
        />

        {/* Add Coffee Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <AddCoffeeForm
                onAddEntry={addEntry}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {showAdminPanel && (
          <AdminPanel
            entries={entries}
            onDeleteEntry={(id) => deleteEntry(id)}
            onUpdateEntry={updateEntry}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </div>
    </div>
  );
};