/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Utensils,
  ShoppingBag,
  Shirt,
  Laptop,
  Sparkles,
  Dumbbell,
  Film,
  Wrench,
  Tag,
  LucideIcon,
} from 'lucide-react';

export interface CategoryTheme {
  icon: LucideIcon;
  /** Short label for compact chips */
  short: string;
  /** Tailwind classes for the small icon bubble */
  bubble: string;
}

const THEMES: Record<string, CategoryTheme> = {
  'food-dining': { icon: Utensils, short: 'Food', bubble: 'bg-amber-100 text-amber-700' },
  grocery: { icon: ShoppingBag, short: 'Grocery', bubble: 'bg-emerald-100 text-emerald-700' },
  fashion: { icon: Shirt, short: 'Fashion', bubble: 'bg-violet-100 text-violet-700' },
  electronics: { icon: Laptop, short: 'Tech', bubble: 'bg-slate-200 text-slate-700' },
  'beauty-wellness': { icon: Sparkles, short: 'Beauty', bubble: 'bg-rose-100 text-rose-700' },
  'health-fitness': { icon: Dumbbell, short: 'Fitness', bubble: 'bg-teal-100 text-teal-700' },
  entertainment: { icon: Film, short: 'Fun', bubble: 'bg-fuchsia-100 text-fuchsia-700' },
  services: { icon: Wrench, short: 'Services', bubble: 'bg-sky-100 text-sky-700' },
};

export const getCategoryTheme = (categoryId: string, fallbackName = 'Other'): CategoryTheme =>
  THEMES[categoryId] || { icon: Tag, short: fallbackName.split(' ')[0], bubble: 'bg-slate-100 text-slate-700' };
