import React, { useState, useEffect } from 'react';
import { CoffeeEntry, databaseService } from '../services/database';
import { Settings, Trash2, Edit3, Save, X, Shield, Coffee, Database, Key } from 'lucide-react';

interface AdminPanelProps {
  entries: CoffeeEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, entry: Partial<CoffeeEntry>) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  entries,
  onDeleteEntry,
  onUpdateEntry,
  onClose
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CoffeeEntry>>({});
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');

  const handleEdit = (entry: CoffeeEntry) => {
    setEditingId(entry.id!);
    setEditForm(entry);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      onUpdateEntry(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handlePasscodeChange = async () => {
    setPasscodeError('');
    setPasscodeSuccess('');

    if (!newPasscode) {
      setPasscodeError('Passcode cannot be empty');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setPasscodeError('Passcodes do not match');
      return;
    }

    if (newPasscode.length < 4) {
      setPasscodeError('Passcode must be at least 4 characters');
      return;
    }

    try {
      await databaseService.setSetting('admin_passcode', newPasscode);
      setPasscodeSuccess('Passcode updated successfully');
      setNewPasscode('');
      setConfirmPasscode('');
    } catch (error) {
      setPasscodeError('Failed to update passcode. Please try again.');
    }
  };

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
                <p className="text-gray-600">Manage coffee records and system settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-800">Database Stats</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-gray-800">Today's Entries</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {entries.filter(e => e.date === new Date().toISOString().split('T')[0]).length}
                </div>
                <div className="text-sm text-gray-600">Records Today</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Passcode Management */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Change Passcode</h3>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Passcode
                      </label>
                      <input
                        type="password"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter new passcode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Passcode
                      </label>
                      <input
                        type="password"
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Confirm new passcode"
                      />
                    </div>
                  </div>
                  {passcodeError && (
                    <p className="text-red-500 text-sm mb-2">{passcodeError}</p>
                  )}
                  {passcodeSuccess && (
                    <p className="text-green-500 text-sm mb-2">{passcodeSuccess}</p>
                  )}
                  <button
                    onClick={handlePasscodeChange}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Update Passcode
                  </button>
                </div>
              </div>

              {/* Records Management */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Manage Records</h3>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caffeine</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            {editingId === entry.id ? (
                              <>
                                <td className="px-4 py-3">
                                  <input
                                    type="date"
                                    value={editForm.date || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="time"
                                    value={editForm.time || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={editForm.type || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="Espresso">Espresso</option>
                                    <option value="Americano">Americano</option>
                                    <option value="Latte">Latte</option>
                                    <option value="Cappuccino">Cappuccino</option>
                                    <option value="Macchiato">Macchiato</option>
                                    <option value="Mocha">Mocha</option>
                                    <option value="Cold Brew">Cold Brew</option>
                                    <option value="Drip Coffee">Drip Coffee</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={editForm.size || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, size: e.target.value }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                    <option value="Extra Large">Extra Large</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    value={editForm.caffeine || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, caffeine: parseInt(e.target.value) }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    value={editForm.notes || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Notes..."
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={handleSave}
                                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={handleCancel}
                                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatDate(entry.date)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatTime(entry.time)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{entry.type}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{entry.size}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{entry.caffeine}mg</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{entry.notes || '-'}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEdit(entry)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => entry.id && onDeleteEntry(entry.id)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};