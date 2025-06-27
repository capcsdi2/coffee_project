import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, X } from 'lucide-react';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [savePasscode, setSavePasscode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved passcode preference and passcode on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('save_passcode_preference');
    const savedPasscode = localStorage.getItem('saved_passcode');
    
    if (savedPreference === 'true') {
      setSavePasscode(true);
      if (savedPasscode) {
        setPasscode(savedPasscode);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would be an API call
      // For now, we'll simulate the check
      const storedPasscode = localStorage.getItem('admin_passcode') || 'coffee123';
      
      if (passcode === storedPasscode) {
        // Handle passcode saving preference
        if (savePasscode) {
          localStorage.setItem('save_passcode_preference', 'true');
          localStorage.setItem('saved_passcode', passcode);
        } else {
          localStorage.removeItem('save_passcode_preference');
          localStorage.removeItem('saved_passcode');
        }

        onSuccess();
        setPasscode('');
        onClose();
      } else {
        setError('Invalid passcode. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPasscode('');
    setError('');
    onClose();
  };

  const handleSavePasscodeChange = (checked: boolean) => {
    setSavePasscode(checked);
    if (!checked) {
      // If unchecking, remove saved passcode immediately
      localStorage.removeItem('save_passcode_preference');
      localStorage.removeItem('saved_passcode');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Enter your passcode"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            {/* Save Passcode Checkbox */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="savePasscode"
                checked={savePasscode}
                onChange={(e) => handleSavePasscodeChange(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
              />
              <label htmlFor="savePasscode" className="text-sm text-gray-700 cursor-pointer">
                Remember passcode in this browser
              </label>
            </div>

            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
              <strong>Security Note:</strong> Only enable this on your personal device. The passcode will be stored locally in your browser.
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? 'Verifying...' : 'Unlock'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};