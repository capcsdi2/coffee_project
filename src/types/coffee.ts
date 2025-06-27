export interface CoffeeEntry {
  id: number;
  date: string;
  time: string;
  type: CoffeeType;
  size: CoffeeSize;
  brewingMethod: BrewingMethod;
  caffeine: number;
  notes?: string;
}

export type CoffeeType = 'Espresso' | 'Americano' | 'Latte' | 'Cappuccino' | 'Macchiato' | 'Mocha' | 'Cold Brew' | 'Drip Coffee';
export type CoffeeSize = 'Small' | 'Medium' | 'Large' | 'Extra Large';
export type BrewingMethod = 'Espresso Machine' | 'French Press' | 'Pour Over' | 'Cold Brew' | 'Drip' | 'Aeropress';

export interface DailyStats {
  date: string;
  totalCups: number;
  totalCaffeine: number;
  avgCupSize: string;
  mostCommonType: string;
}