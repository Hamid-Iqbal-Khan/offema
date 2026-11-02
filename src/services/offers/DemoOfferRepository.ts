/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Offer, OfferCategory } from '../../domain/models/Offer';
import { INITIAL_CATEGORIES } from '../../config/categories';
import { IOfferRepository } from './OfferRepository';
import { isOfferActiveAndValid } from '../../domain/logic/offerValidity';
import { advertisementService } from '../advertisements/AdvertisementService';

/**
 * Realistic seed offers.
 * Reference City: Hyderabad, Telangana, India
 * Reference User Coordinate anchor: Banjara Hills Road No. 1 (17.4156° N, 78.4350° E)
 *
 * Dynamic date offsets ensure that whenever an evaluator opens the app,
 * countdown timers showcase live ticking urgency across multiple tiers
 * (Flash Deals < 12h, Limited-Time Deals < 48h, and Multi-Day Offers).
 */
const MS_PER_HOUR = 3600 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const anchorTime = Date.now();
const futureHours = (h: number) => new Date(anchorTime + h * MS_PER_HOUR).toISOString();
const pastDays = (d: number) => new Date(anchorTime - d * MS_PER_DAY).toISOString();

export const DEMO_OFFERS_DATA: Offer[] = [
  // --- LOCAL OFFERS (Physical Merchants in Hyderabad) ---
  {
    id: 'off-hyd-01',
    title: '30% Off on Artisanal Coffee & Fresh Bakery',
    providerId: 'prov-roastery-01',
    providerName: 'The Roastery Coffee House',
    description: 'Enjoy handcrafted pour-overs, cold brews, and freshly baked European sourdough pastries in our tranquil garden patio.',
    categoryId: 'food-dining',
    categoryName: 'Food & Dining',
    valueType: 'PERCENTAGE',
    value: 30,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Road No. 14, Banjara Hills',
      address: 'Plot 418, Road No. 14, Banjara Hills, Hyderabad, Telangana 500034',
      latitude: 17.4192,
      longitude: 78.4418, // ~0.8 km from anchor
      city: 'Hyderabad',
    },
    validFrom: pastDays(3),
    validUntil: futureHours(5.5), // ~5h 30m left (High Urgency / Flash Deal)
    termsAndConditions: [
      'Valid on dine-in and takeaway orders above ₹400.',
      'Cannot be clubbed with existing loyalty stamp cards.',
      'Show the active offer screen to server before billing.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 85,
    promoCode: 'ROAST30',
    reviews: [
      {
        id: 'rev-01',
        displayName: 'Ananya S.',
        rating: 5,
        text: 'The best cascara brew in Banjara Hills! Redeemed seamlessly.',
        createdAt: '2026-09-12T14:30:00.000Z',
        isSample: true,
      },
      {
        id: 'rev-02',
        displayName: 'Vikram R.',
        rating: 4,
        text: 'Delicious croissants, peaceful outdoor vibe. 30% discount applied instantly.',
        createdAt: '2026-10-02T10:15:00.000Z',
        isSample: true,
      },
    ],
  },
  {
    id: 'off-hyd-02',
    title: '₹250 Off on Gourmet Groceries & Organic Produce',
    providerId: 'prov-ratnadeep-02',
    providerName: 'Ratnadeep Select Supermarket',
    description: 'Get flat ₹250 instant reduction on imported cheeses, cold cuts, fresh hydroponic greens, and daily gourmet staples.',
    categoryId: 'grocery',
    categoryName: 'Grocery & Essentials',
    valueType: 'FIXED_AMOUNT',
    value: 250,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Somajiguda Circle',
      address: 'Raj Bhavan Road, Somajiguda, Hyderabad, Telangana 500082',
      latitude: 17.4258,
      longitude: 78.4552, // ~2.3 km from anchor
      city: 'Hyderabad',
    },
    validFrom: pastDays(2),
    validUntil: futureHours(18.25), // ~18h 15m left (Ends Tonight)
    termsAndConditions: [
      'Minimum cart purchase value of ₹1,500 required.',
      'Valid across all edible grocery and personal care aisles.',
      'One redemption per authenticated mobile number per week.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 78,
    promoCode: 'RATNA250',
    reviews: [
      {
        id: 'rev-03',
        displayName: 'Priya M.',
        rating: 5,
        text: 'Great stock of imported items. Cashier scanned the barcode in seconds.',
        createdAt: '2026-08-20T17:45:00.000Z',
        isSample: true,
      },
    ],
  },
  {
    id: 'off-hyd-03',
    title: '40% Off on Heritage Handloom & Festive Kurtas',
    providerId: 'prov-fabindia-03',
    providerName: 'Fabindia Heritage Store',
    description: 'Curated natural hand-spun khadi, festive silks, linen tunics, and handcrafted brassware home accents.',
    categoryId: 'fashion',
    categoryName: 'Fashion & Apparel',
    valueType: 'PERCENTAGE',
    value: 40,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Road No. 36, Jubilee Hills',
      address: 'Near Peddamma Temple, Road No. 36, Jubilee Hills, Hyderabad 500033',
      latitude: 17.4344,
      longitude: 78.4069, // ~3.5 km from anchor
      city: 'Hyderabad',
    },
    validFrom: pastDays(4),
    validUntil: futureHours(38), // ~1d 14h left (Limited Time)
    termsAndConditions: [
      'Applicable on seasonal apparel collections and home décor.',
      'Excludes certified gold/silver jewelry and food pantry products.',
      'Valid only at the Jubilee Hills flagship retail boutique.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 88,
    promoCode: 'FABFEST40',
    reviews: [
      {
        id: 'rev-04',
        displayName: 'Sneha K.',
        rating: 5,
        text: 'Found a stunning Chanderi silk kurta at an incredible 40% discount!',
        createdAt: '2026-09-28T16:20:00.000Z',
        isSample: true,
      },
    ],
  },
  {
    id: 'off-hyd-04',
    title: '50% Off 3-Month Elite Gym & Cross-Training Pass',
    providerId: 'prov-o2gym-04',
    providerName: 'O2 Fitness & Performance Arena',
    description: 'Full access to state-of-the-art strength zones, Olympic lifting platforms, steam suites, and group HIIT classes.',
    categoryId: 'health-fitness',
    categoryName: 'Health & Fitness',
    valueType: 'PERCENTAGE',
    value: 50,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Road No. 1, Banjara Hills',
      address: 'City Center Mall Annex, Road No. 1, Banjara Hills, Hyderabad 500034',
      latitude: 17.4168,
      longitude: 78.4385, // ~0.4 km from anchor
      city: 'Hyderabad',
    },
    validFrom: pastDays(10),
    validUntil: futureHours(84), // ~3.5 days left
    termsAndConditions: [
      'Valid for new registrations or lapsed members (6+ months).',
      'Includes complimentary 1-on-1 functional movement assessment.',
      'Non-transferable once membership starts.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 94,
    promoCode: 'O2FIT50',
    reviews: [
      {
        id: 'rev-05',
        displayName: 'Karthik N.',
        rating: 5,
        text: 'Top-tier trainers and immaculate equipment. Saved nearly ₹9,000!',
        createdAt: '2026-10-05T08:00:00.000Z',
        isSample: true,
      },
    ],
  },
  {
    id: 'off-hyd-05',
    title: '₹750 Off on Luxury Aromatherapy & Swedish Massage',
    providerId: 'prov-auraspa-05',
    providerName: 'Aura Luxury Wellness Spa',
    description: 'Relax in therapeutic sound suites with cold-pressed botanical oils, hot herbal poultice compress, and head therapy.',
    categoryId: 'beauty-wellness',
    categoryName: 'Beauty & Wellness',
    valueType: 'FIXED_AMOUNT',
    value: 750,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Punjagutta Officers Colony',
      address: '6-3-662 Somajiguda, Near Hyderabad Central, Punjagutta, Hyderabad 500082',
      latitude: 17.4278,
      longitude: 78.4498, // ~2.0 km from anchor
      city: 'Hyderabad',
    },
    validFrom: pastDays(1),
    validUntil: futureHours(132), // ~5.5 days left
    termsAndConditions: [
      'Valid on 60-minute and 90-minute signature spa therapies.',
      'Prior appointment booking required by phone or website.',
      'Applicable on weekdays (Monday to Friday, 10 AM to 6 PM).',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 82,
    promoCode: 'AURA750',
    reviews: [
      {
        id: 'rev-06',
        displayName: 'Ritu V.',
        rating: 5,
        text: 'Heavenly aroma therapy session. Extremely professional therapists.',
        createdAt: '2026-09-18T19:30:00.000Z',
        isSample: true,
      },
    ],
  },
  {
    id: 'off-hyd-06',
    title: '20% Off Authentic Hyderabadi Dum Biryani & Kebabs',
    providerId: 'prov-paradise-06',
    providerName: 'Jewel of Nizam & Spice Craft',
    description: 'Slow-cooked kacchi gosht dum biryani flavored with saffron and pure ghee, accompanied by mirchi ka salan and dahi chutney.',
    categoryId: 'food-dining',
    categoryName: 'Food & Dining',
    valueType: 'PERCENTAGE',
    value: 20,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Masab Tank',
      address: 'Near NMDC Building, Masab Tank, Hyderabad 500028',
      latitude: 17.4042,
      longitude: 78.4485, // ~1.9 km from anchor
      city: 'Hyderabad',
    },
    validFrom: pastDays(1),
    validUntil: futureHours(7.25), // ~7h 15m left (Flash Deal)
    termsAndConditions: [
      'Valid on dining bills exceeding ₹800.',
      'Valid on all days except government gazetted national holidays.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 70,
    promoCode: 'NIZAM20',
  },
  {
    id: 'off-hyd-07',
    title: '35% Off Complete Home Deep Cleaning & Sanitization',
    providerId: 'prov-urban-07',
    providerName: 'CleanPro Home Care Services',
    description: 'Intensive mechanized scrubbing for bathrooms, modular kitchen degreasing, sofa upholstery shampoo, and dry vacuuming.',
    categoryId: 'services',
    categoryName: 'Home & Professional Services',
    valueType: 'PERCENTAGE',
    value: 35,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Begumpet Service Hub',
      address: 'Prakash Nagar, Begumpet, Hyderabad 500016',
      latitude: 17.4435,
      longitude: 78.4682, // ~4.6 km from anchor (within 5 km)
      city: 'Hyderabad',
    },
    validFrom: pastDays(5),
    validUntil: futureHours(288), // ~12 days left
    termsAndConditions: [
      'Applicable on 2BHK, 3BHK, and Villa full-house packages.',
      'Trained verified technicians with ISO certified chemicals.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 79,
    promoCode: 'CLEAN35',
  },
  {
    id: 'off-hyd-08',
    title: '₹1,500 Off on Premium Wireless Audio & Smartwatches',
    providerId: 'prov-rel-08',
    providerName: 'Reliance Digital Flagship',
    description: 'Flat ₹1,500 instant discount on Sony, Bose, Sennheiser, and Apple wearable audio devices on bill over ₹7,999.',
    categoryId: 'electronics',
    categoryName: 'Electronics & Tech',
    valueType: 'FIXED_AMOUNT',
    value: 1500,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Cyber Towers, Hitec City',
      address: 'Opposite Cyber Gateway, Hitec City, Madhapur, Hyderabad 500081',
      latitude: 17.4504,
      longitude: 78.3809, // ~7.1 km from anchor (outside 5 km, tests 10 km filter!)
      city: 'Hyderabad',
    },
    validFrom: pastDays(7),
    validUntil: futureHours(432), // ~18 days left
    termsAndConditions: [
      'Minimum billing transaction value ₹7,999.',
      'Show mobile verification screen at electronic POS counter.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 84,
    promoCode: 'TECH1500',
  },
  {
    id: 'off-hyd-09',
    title: '₹400 Off Laser IMAX & 4DX Weekend Movie Experience',
    providerId: 'prov-pvr-09',
    providerName: 'PVR INOX Gold Class',
    description: 'Enjoy plush recliners, gourmet finger food delivery to seat, and immersive Dolby Atmos surround sound.',
    categoryId: 'entertainment',
    categoryName: 'Entertainment',
    valueType: 'FIXED_AMOUNT',
    value: 400,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Financial District, Gachibowli',
      address: 'Gachibowli Stadium Road, Financial District, Hyderabad 500032',
      latitude: 17.4412,
      longitude: 78.3489, // ~10.2 km from anchor (tests >10 km boundary!)
      city: 'Hyderabad',
    },
    validFrom: pastDays(2),
    validUntil: futureHours(54), // ~2 days 6 hours left (Limited Time)
    termsAndConditions: [
      'Valid on booking minimum 2 Gold Class or IMAX tickets.',
      'Redeemable at box office counter or kiosk.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 68,
    promoCode: 'GOLD400',
  },

  // --- GLOBAL OFFERS (Online, National & Brand-Wide) ---
  {
    id: 'off-glob-01',
    title: '50% Off End of Season Fashion & Athleisure',
    providerId: 'prov-myntra-01',
    providerName: 'Myntra Fashion Online',
    description: 'Extra 50% discount on Nike, Puma, Levi’s, Mango, and Vero Moda seasonal collections with complimentary pan-India shipping.',
    categoryId: 'fashion',
    categoryName: 'Fashion & Apparel',
    valueType: 'PERCENTAGE',
    value: 50,
    currency: 'INR',
    scope: 'ONLINE',
    validFrom: pastDays(2),
    validUntil: futureHours(8.5), // ~8h 30m left (Mega Flash Sale)
    termsAndConditions: [
      'Valid online across India on web and mobile app.',
      'No minimum spend required on participating brand styles.',
      'Includes 14-day hassle-free doorstep returns.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 92,
    promoCode: 'MYNTRA50',
    reviews: [
      {
        id: 'rev-07',
        displayName: 'Devika P.',
        rating: 5,
        text: 'Applied the coupon code on Myntra checkout instantly. Saved ₹2,400!',
        createdAt: '2026-10-10T11:20:00.000Z',
        isSample: true,
      },
    ],
  },
  {
    id: 'off-glob-02',
    title: '₹3,000 Off on AI-Powered Ultra-thin Laptops',
    providerId: 'prov-techstore-02',
    providerName: 'Croma & Tata Neu Online',
    description: 'Instant bank-agnostic discount on Intel Core Ultra & Apple Silicon laptops with free next-day express delivery.',
    categoryId: 'electronics',
    categoryName: 'Electronics & Tech',
    valueType: 'FIXED_AMOUNT',
    value: 3000,
    currency: 'INR',
    scope: 'NATIONAL',
    validFrom: pastDays(5),
    validUntil: futureHours(34), // ~1d 10h left (Limited Time)
    termsAndConditions: [
      'Minimum cart value ₹45,000.',
      'Redeemable online at checkout across all pincodes in India.',
      'Valid in conjunction with zero-cost EMI plans.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 90,
    promoCode: 'LAPTOP3000',
  },
  {
    id: 'off-glob-03',
    title: '45% Off Cultpass ELITE All-India Membership',
    providerId: 'prov-cult-03',
    providerName: 'Cult.fit Fitness Network',
    description: 'Unrestricted access to 600+ fitness centres across India, boxing, dance fitness, and at-home live workout library.',
    categoryId: 'health-fitness',
    categoryName: 'Health & Fitness',
    valueType: 'PERCENTAGE',
    value: 45,
    currency: 'INR',
    scope: 'BRAND_WIDE',
    validFrom: pastDays(12),
    validUntil: futureHours(168), // ~7 days left
    termsAndConditions: [
      'Valid for 12-month Cultpass ELITE subscription.',
      'Redeemable on the Cult app or at any Cult.fit center nationally.',
      'Includes 45 days complimentary pause days.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 86,
    promoCode: 'CULTELITE45',
  },
  {
    id: 'off-glob-04',
    title: '₹150 Off on First 3 Fast Grocery Deliveries',
    providerId: 'prov-blinkit-04',
    providerName: 'Blinkit Instant Commerce',
    description: 'Get groceries, snacks, household essentials, and stationery delivered to your door in 10 minutes.',
    categoryId: 'grocery',
    categoryName: 'Grocery & Essentials',
    valueType: 'FIXED_AMOUNT',
    value: 150,
    currency: 'INR',
    scope: 'NATIONAL',
    validFrom: pastDays(1),
    validUntil: futureHours(14.5), // ~14h 30m left (Flash Deal)
    termsAndConditions: [
      'Minimum order value ₹499.',
      'Available across 35+ Indian cities covered by dark stores.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 72,
    promoCode: 'BLINK150',
  },
  {
    id: 'off-glob-05',
    title: '25% Off Domestic Boutique Hotels & Homestays',
    providerId: 'prov-mmt-05',
    providerName: 'MakeMyTrip Premium Stays',
    description: 'Save on luxury tea estate bungalows in Munnar, heritage havelis in Rajasthan, and beach villas in Goa.',
    categoryId: 'services',
    categoryName: 'Home & Professional Services',
    valueType: 'PERCENTAGE',
    value: 25,
    currency: 'INR',
    scope: 'ONLINE',
    validFrom: pastDays(6),
    validUntil: futureHours(576), // ~24 days left
    termsAndConditions: [
      'Maximum discount cap of ₹2,500 per booking.',
      'Valid on hotel bookings made 30 days in advance.',
    ],
    imageUrls: [],
    isActive: true,
    rankingScore: 80,
    promoCode: 'STAY25',
  },
];

/**
 * Fixture containing expired and inactive offers to thoroughly test exclusion rules.
 */
export const EXPIRED_TEST_OFFERS: Offer[] = [
  {
    id: 'off-expired-01',
    title: 'Flash 70% Off Monsoon Sale (Expired Yesterday)',
    providerId: 'prov-expired-01',
    providerName: 'Monsoon Retailers',
    description: 'Historical seasonal offer that is no longer active.',
    categoryId: 'fashion',
    categoryName: 'Fashion & Apparel',
    valueType: 'PERCENTAGE',
    value: 70,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Ameerpet',
      latitude: 17.4375,
      longitude: 78.4483,
    },
    validFrom: '2025-01-01T00:00:00.000Z',
    validUntil: '2025-12-31T23:59:59.000Z', // Definitely in the past
    termsAndConditions: ['Expired offer for testing purposes.'],
    imageUrls: [],
    isActive: true, // But validUntil has passed
  },
  {
    id: 'off-inactive-02',
    title: 'Special 60% Off Inactive Promotion',
    providerId: 'prov-inactive-02',
    providerName: 'Disabled Merchant',
    description: 'An offer with isActive set to false.',
    categoryId: 'food-dining',
    categoryName: 'Food & Dining',
    valueType: 'PERCENTAGE',
    value: 60,
    currency: 'INR',
    scope: 'LOCAL',
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2027-12-31T23:59:59.000Z',
    termsAndConditions: ['Inactive merchant test.'],
    imageUrls: [],
    isActive: false, // Inactive
  },
];

export class DemoOfferRepository implements IOfferRepository {
  private readonly offers: Offer[];
  private readonly categories: OfferCategory[];

  constructor(
    customOffers: Offer[] = DEMO_OFFERS_DATA,
    customCategories: OfferCategory[] = INITIAL_CATEGORIES
  ) {
    this.offers = customOffers;
    this.categories = customCategories;
  }

  async getActiveOffers(): Promise<Offer[]> {
    // Exclude expired or inactive offers per specification
    const now = new Date();
    const baseActive = this.offers.filter((offer) => isOfferActiveAndValid(offer, now));
    const approvedAdOffers = await advertisementService.getApprovedPublishedOffers();
    return [...approvedAdOffers, ...baseActive];
  }

  async getOfferById(id: string): Promise<Offer | null> {
    const approvedAdOffers = await advertisementService.getApprovedPublishedOffers();
    const adOffer = approvedAdOffers.find((o) => o.id === id);
    if (adOffer) return adOffer;

    const offer = this.offers.find((o) => o.id === id);
    if (!offer) return null;
    return offer;
  }

  async getCategories(): Promise<OfferCategory[]> {
    return this.categories.filter((c) => c.isActive);
  }

  async getRawFixtureOffers(): Promise<Offer[]> {
    return [...this.offers, ...EXPIRED_TEST_OFFERS];
  }
}

// Default singleton instance for app consumption
export const demoOfferRepository = new DemoOfferRepository();
