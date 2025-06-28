import React, { useState, useEffect } from 'react';
import { CoffeeEntry, CoffeeType, CoffeeSize, BrewingMethod } from '../types/coffee';
import { databaseService } from '../services/database';
import { X, Coffee } from 'lucide-react';

interface AddCoffeeFormProps {
  onAddEntry: (entry: Omit<CoffeeEntry, 'id'>) => void;
  onCancel: () => void;
}

const defaultCoffeeTypes: CoffeeType[] = ['Espresso', 'Americano', 'Latte', 'Cappuccino', 'Macchiato', 'Mocha', 'Cold Brew', 'Drip Coffee'];
const coffeeSizes: CoffeeSize[] = ['Small', 'Medium', 'Large', 'Extra Large'];
const defaultBrewingMethods: BrewingMethod[] = ['Espresso Machine', 'French Press', 'Pour Over', 'Cold Brew', 'Drip', 'Aeropress'];

const defaultCaffeineContent: Record<CoffeeType, Record<CoffeeSize, number>> = {
  'Espresso': { 'Small': 63, 'Medium': 94, 'Large': 125, 'Extra Large': 156 },
  'Americano': { 'Small': 77, 'Medium': 154, 'Large': 231, 'Extra Large': 308 },
  'Latte': { 'Small': 64, 'Medium': 128, 'Large': 192, 'Extra Large': 256 },
  'Cappuccino': { 'Small': 64, 'Medium': 128, 'Large': 192, 'Extra Large': 256 },
  'Macchiato': { 'Small': 64, 'Medium': 128, 'Large': 192, 'Extra Large': 256 },
  'Mocha': { 'Small': 95, 'Medium': 175, 'Large': 255, 'Extra Large': 335 },
  'Cold Brew': { 'Small': 103, 'Medium': 205, 'Large': 308, 'Extra Large': 410 },
  'Drip Coffee': { 'Small': 95, 'Medium': 190, 'Large': 285, 'Extra Large': 380 }
};

export const AddCoffeeForm: React.FC<AddCoffeeFormProps> = ({ onAddEntry, onCancel }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'Americano' as CoffeeType,
    size: 'Medium' as CoffeeSize,
    brewingMethod: 'Espresso Machine' as BrewingMethod,
    notes: ''
  });

  const [coffeeTypes, setCoffeeTypes] = useState<string[]>(defaultCoffeeTypes);
  const [brewingMethods, setBrewingMethods] = useState<string[]>(defaultBrewingMethods);
  const [caffeineContent, setCaffeineContent] = useState(defaultCaffeineContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    try {
      setIsLoading(true);
      
      // Load coffee types and brewing methods from database
      const [dbCoffeeTypes, dbBrewingMethods] = await Promise.all([
        databaseService.getCoffeeTypes(),
        databaseService.getBrewingMethods()
      ]);

      if (dbCoffeeTypes.length > 0) {
        const types = dbCoffeeTypes.map(type => type.name);
        setCoffeeTypes(types);
        
        // Build caffeine content mapping from database
        const caffeineMap: Record<string, Record<string, number>> = {};
        dbCoffeeTypes.forEach(type => {
          caffeineMap[type.name] = type.caffeine;
        });
        setCaffeineContent(caffeineMap as any);
      }

      if (dbBrewingMethods.length > 0) {
        setBrewingMethods(dbBrewingMethods);
      }
    } catch (error) {
      console.error('Error loading database data:', error);
      // Fall back to default values if database fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const caffeine = caffeineContent[formData.type]?.[formData.size] || 0;
    
    onAddEntry({
      ...formData,
      caffeine,
      notes: formData.notes || undefined
    });
  };

  const estimatedCaffeine = caffeineContent[formData.type]?.[formData.size] || 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-3 text-gray-600">Loading form data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Coffee className="w-5 h-5 text-amber-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Add Coffee Entry</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coffee Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CoffeeType }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            required
          >
            {coffeeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value as CoffeeSize }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              required
            >
              {coffeeSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brewing Method
            </label>
            <select
              value={formData.brewingMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, brewingMethod: e.target.value as BrewingMethod }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              required
            >
              {brewingMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800">
              Estimated Caffeine
            </span>
            <span className="text-lg font-bold text-amber-900">
              {estimatedCaffeine}mg
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            rows={3}
            placeholder="Any notes about this coffee..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add Entry
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};