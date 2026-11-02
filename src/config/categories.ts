/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OfferCategory } from '../domain/models/Offer';

export const INITIAL_CATEGORIES: OfferCategory[] = [
  {
    id: 'food-dining',
    name: 'Food & Dining',
    isActive: true,
    displayOrder: 1,
    iconName: 'Utensils',
  },
  {
    id: 'grocery',
    name: 'Grocery & Essentials',
    isActive: true,
    displayOrder: 2,
    iconName: 'ShoppingBag',
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    isActive: true,
    displayOrder: 3,
    iconName: 'Shirt',
  },
  {
    id: 'electronics',
    name: 'Electronics & Tech',
    isActive: true,
    displayOrder: 4,
    iconName: 'Laptop',
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    isActive: true,
    displayOrder: 5,
    iconName: 'Sparkles',
  },
  {
    id: 'health-fitness',
    name: 'Health & Fitness',
    isActive: true,
    displayOrder: 6,
    iconName: 'Dumbbell',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    isActive: true,
    displayOrder: 7,
    iconName: 'Film',
  },
  {
    id: 'services',
    name: 'Home & Professional Services',
    isActive: true,
    displayOrder: 8,
    iconName: 'Wrench',
  },
];
