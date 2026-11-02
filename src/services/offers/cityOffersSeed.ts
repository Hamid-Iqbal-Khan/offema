/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Offer } from '../../domain/models/Offer';

/**
 * City sample catalogue: 100 offers in Bengaluru + 100 in Hyderabad, spread over
 * 25 real neighbourhoods per city (approximate locality centre coordinates) and
 * all 8 categories.
 *
 * IMPORTANT: merchant names, discounts and promo codes are FICTIONAL sample data
 * for testing discovery, distance and map features. Every generated offer carries
 * `isSample: true` and the UI labels it as a sample. Do not replace the invented
 * shop names with real businesses unless the offer is actually provided by them.
 *
 * Generation is deterministic (seeded PRNG) so IDs, names and values are stable
 * between page loads; only validity windows are anchored to the load time so
 * countdowns stay live.
 */

export type CityId = 'BLR' | 'HYD';

interface Locality {
  name: string;
  lat: number;
  lng: number;
  pin: string;
}

export const CITY_INFO: Record<CityId, { name: string; state: string; centre: { latitude: number; longitude: number } }> = {
  BLR: { name: 'Bengaluru', state: 'Karnataka', centre: { latitude: 12.9716, longitude: 77.5946 } },
  HYD: { name: 'Hyderabad', state: 'Telangana', centre: { latitude: 17.385, longitude: 78.4867 } },
};

export const CITY_LOCALITIES: Record<CityId, Locality[]> = {
  BLR: [
    { name: 'Koramangala', lat: 12.9352, lng: 77.6245, pin: '560034' },
    { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, pin: '560038' },
    { name: 'HSR Layout', lat: 12.9116, lng: 77.6474, pin: '560102' },
    { name: 'Whitefield', lat: 12.9698, lng: 77.75, pin: '560066' },
    { name: 'Jayanagar', lat: 12.925, lng: 77.5938, pin: '560041' },
    { name: 'JP Nagar', lat: 12.9077, lng: 77.5851, pin: '560078' },
    { name: 'Malleshwaram', lat: 13.0035, lng: 77.571, pin: '560003' },
    { name: 'Rajajinagar', lat: 12.991, lng: 77.552, pin: '560010' },
    { name: 'MG Road', lat: 12.9756, lng: 77.6066, pin: '560001' },
    { name: 'Brigade Road', lat: 12.9719, lng: 77.607, pin: '560025' },
    { name: 'Electronic City', lat: 12.8452, lng: 77.6602, pin: '560100' },
    { name: 'Marathahalli', lat: 12.9569, lng: 77.7011, pin: '560037' },
    { name: 'Bellandur', lat: 12.926, lng: 77.6762, pin: '560103' },
    { name: 'BTM Layout', lat: 12.9166, lng: 77.6101, pin: '560076' },
    { name: 'Banashankari', lat: 12.9255, lng: 77.5468, pin: '560070' },
    { name: 'Basavanagudi', lat: 12.9422, lng: 77.5738, pin: '560004' },
    { name: 'Hebbal', lat: 13.0358, lng: 77.597, pin: '560024' },
    { name: 'Yelahanka', lat: 13.1007, lng: 77.5963, pin: '560064' },
    { name: 'Sadashivanagar', lat: 13.0068, lng: 77.5813, pin: '560080' },
    { name: 'Frazer Town', lat: 12.9971, lng: 77.6136, pin: '560005' },
    { name: 'Sarjapur Road', lat: 12.901, lng: 77.686, pin: '560035' },
    { name: 'Bannerghatta Road', lat: 12.888, lng: 77.597, pin: '560076' },
    { name: 'Kalyan Nagar', lat: 13.0221, lng: 77.6403, pin: '560043' },
    { name: 'RT Nagar', lat: 13.0213, lng: 77.5951, pin: '560032' },
    { name: 'Ulsoor', lat: 12.9817, lng: 77.62, pin: '560008' },
  ],
  HYD: [
    { name: 'Banjara Hills', lat: 17.4156, lng: 78.435, pin: '500034' },
    { name: 'Jubilee Hills', lat: 17.4325, lng: 78.407, pin: '500033' },
    { name: 'Madhapur', lat: 17.4483, lng: 78.3915, pin: '500081' },
    { name: 'HITEC City', lat: 17.4435, lng: 78.3772, pin: '500081' },
    { name: 'Gachibowli', lat: 17.4401, lng: 78.3489, pin: '500032' },
    { name: 'Kondapur', lat: 17.4698, lng: 78.3578, pin: '500084' },
    { name: 'Kukatpally', lat: 17.4948, lng: 78.3996, pin: '500072' },
    { name: 'Ameerpet', lat: 17.4375, lng: 78.4482, pin: '500016' },
    { name: 'Begumpet', lat: 17.4447, lng: 78.4664, pin: '500016' },
    { name: 'Somajiguda', lat: 17.4239, lng: 78.4594, pin: '500082' },
    { name: 'Punjagutta', lat: 17.426, lng: 78.451, pin: '500082' },
    { name: 'Himayatnagar', lat: 17.4022, lng: 78.4855, pin: '500029' },
    { name: 'Abids', lat: 17.3913, lng: 78.4747, pin: '500001' },
    { name: 'Secunderabad', lat: 17.4399, lng: 78.4983, pin: '500003' },
    { name: 'Charminar', lat: 17.3616, lng: 78.4747, pin: '500002' },
    { name: 'Mehdipatnam', lat: 17.395, lng: 78.4386, pin: '500028' },
    { name: 'Tolichowki', lat: 17.3986, lng: 78.4126, pin: '500008' },
    { name: 'Manikonda', lat: 17.4045, lng: 78.387, pin: '500089' },
    { name: 'Kothapet', lat: 17.3681, lng: 78.5446, pin: '500035' },
    { name: 'Dilsukhnagar', lat: 17.3688, lng: 78.5247, pin: '500060' },
    { name: 'Uppal', lat: 17.4058, lng: 78.5591, pin: '500039' },
    { name: 'Miyapur', lat: 17.4968, lng: 78.3614, pin: '500049' },
    { name: 'Masab Tank', lat: 17.4, lng: 78.453, pin: '500028' },
    { name: 'Film Nagar', lat: 17.414, lng: 78.409, pin: '500096' },
    { name: 'Nallagandla', lat: 17.4711, lng: 78.3105, pin: '500019' },
  ],
};

interface OfferTemplate {
  title: (v: string) => string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  min: number;
  max: number;
  step: number;
  terms: string[];
  /** Fictional merchants that plausibly run this kind of offer */
  merchants: string[];
}

interface CategorySpec {
  id: string;
  name: string;
  templates: OfferTemplate[];
}

const CATEGORY_SPECS: CategorySpec[] = [
  {
    id: 'food-dining',
    name: 'Food & Dining',
    templates: [
      { title: (v) => `${v} Off on Dinner Buffet`, description: 'Unlimited live counters, slow-cooked curries, fresh breads and a dessert bar every evening.', type: 'PERCENTAGE', min: 15, max: 40, step: 5, terms: ['Valid for dine-in only, 7 PM – 11 PM.', 'Not valid on public holidays.', 'Maximum 6 guests per booking.'], merchants: ['Saffron Courtyard Kitchen', 'Golden Tandoor Table', 'Coastal Curry Co.', 'Nawabi Dastarkhwan'] },
      { title: (v) => `Flat ${v} Off on Orders Above ₹999`, description: 'Family-size biryani handis, kebab platters and combo meals for takeaway or dine-in.', type: 'FIXED_AMOUNT', min: 150, max: 300, step: 50, terms: ['Minimum bill ₹999 before taxes.', 'One redemption per table.'], merchants: ['Copper Pot Biryani House', 'Masala Junction Express', 'Smoke & Spice Grill', 'Kebab Katha'] },
      { title: (v) => `${v} Off on Coffee & Bakes`, description: 'Hand-brewed filter coffee, cold brews and fresh-from-the-oven croissants and cookies.', type: 'PERCENTAGE', min: 10, max: 30, step: 5, terms: ['Valid before 12 noon on weekdays.', 'Applicable on beverages and bakery items only.'], merchants: ['Bean Theory Coffee Lab', 'Little Lantern Café', 'Cinnamon Crumb Bakery', 'Mango Tree Bistro'] },
      { title: (v) => `${v} Off South Indian Breakfast Combos`, description: 'Crispy dosas, idli-vada platters and pongal served with three chutneys and sambar.', type: 'PERCENTAGE', min: 15, max: 25, step: 5, terms: ['Valid 7 AM – 11 AM.', 'Dine-in and takeaway.'], merchants: ['Tamarind Leaf Tiffins', 'Dosa Doodle Diner', 'Udupi Morning Mess'] },
    ],
  },
  {
    id: 'grocery',
    name: 'Grocery & Essentials',
    templates: [
      { title: (v) => `Flat ${v} Off on Monthly Groceries`, description: 'Staples, pulses, cooking oils and household essentials, delivered free within 3 km.', type: 'FIXED_AMOUNT', min: 100, max: 400, step: 50, terms: ['Minimum purchase ₹2,000.', 'Excludes baby food and tobacco products.'], merchants: ['DailyNeeds Super Store', 'Pantry Pal Supermarket', 'Kirana Corner Plus', 'Spice Route Provisions'] },
      { title: (v) => `${v} Off on Fresh Fruits & Vegetables`, description: 'Farm-fresh seasonal produce sourced every morning from local growers.', type: 'PERCENTAGE', min: 10, max: 25, step: 5, terms: ['Valid on loose produce only.', 'While stocks last.'], merchants: ['FreshBasket Neighbourhood Mart', 'Harvest Lane Grocers', 'Farm2Shelf Market'] },
      { title: (v) => `${v} Off on Organic Range`, description: 'Certified organic millets, cold-pressed oils, jaggery and dry fruits.', type: 'PERCENTAGE', min: 10, max: 30, step: 5, terms: ['Applicable on store-labelled organic SKUs.', 'Cannot be combined with member pricing.'], merchants: ['Green Aisle Organics', 'Millet Mantra Store', 'Farm2Shelf Market'] },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    templates: [
      { title: (v) => `${v} Off on New Season Collection`, description: 'Fresh arrivals in breathable cottons, linen shirts and everyday ethnic wear.', type: 'PERCENTAGE', min: 20, max: 50, step: 10, terms: ['Valid on full-priced merchandise.', 'Exchange within 7 days with bill.'], merchants: ['Loom & Thread Studio', 'StreetStyle Collective', 'Denim District', 'Little Steps Kidswear'] },
      { title: (v) => `Flat ${v} Off on Purchases Above ₹3,000`, description: 'Festive kurtas, handloom sarees and occasion wear for the whole family.', type: 'FIXED_AMOUNT', min: 300, max: 1000, step: 100, terms: ['Minimum bill ₹3,000.', 'Not valid on alterations.'], merchants: ['Urban Kurta Co.', 'Silk Story Handlooms', 'Weave Heritage Sarees'] },
      { title: (v) => `Buy 2, Get ${v} Off on Footwear`, description: 'Sneakers, sandals and formal shoes from in-house and partner labels.', type: 'PERCENTAGE', min: 20, max: 40, step: 10, terms: ['Discount applies to the lower-priced pair.', 'Valid in-store only.'], merchants: ['Sole Mates Footwear', 'Stride Right Shoe Co.', 'Kolhapuri Corner'] },
    ],
  },
  {
    id: 'electronics',
    name: 'Electronics & Tech',
    templates: [
      { title: (v) => `Flat ${v} Off on Laptops`, description: 'Thin-and-light, gaming and student laptops with free setup and data transfer.', type: 'FIXED_AMOUNT', min: 1000, max: 3000, step: 500, terms: ['Valid on select models.', 'Bank EMI offers can be combined.'], merchants: ['TechNest Laptop Store', 'Circuit Corner Electronics', 'Byte Bazaar Computers'] },
      { title: (v) => `${v} Off on Headphones & Speakers`, description: 'Wireless earbuds, studio headphones and party speakers with in-store demo booths.', type: 'PERCENTAGE', min: 10, max: 35, step: 5, terms: ['Applicable on audio accessories only.', '1-year store warranty.'], merchants: ['SoundWave Audio Lounge', 'GadgetHub Express', 'Volt & Wire Appliances'] },
      { title: (v) => `${v} Off on Phone Screen Repair`, description: 'Same-day screen and battery replacement with quality parts and 6-month warranty.', type: 'PERCENTAGE', min: 15, max: 30, step: 5, terms: ['Diagnosis is free.', 'Subject to part availability.'], merchants: ['FixIt Phone Care', 'Pixel Point Mobiles', 'ScreenSaver Repair Hub'] },
    ],
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    templates: [
      { title: (v) => `${v} Off on Full Body Massage`, description: 'Deep tissue, Swedish and Ayurvedic abhyanga therapies by certified therapists.', type: 'PERCENTAGE', min: 20, max: 40, step: 5, terms: ['Prior appointment required.', 'Valid Monday – Thursday.'], merchants: ['Lotus Calm Spa', 'Serene Sutra Spa', 'Ayur Bloom Wellness'] },
      { title: (v) => `Flat ${v} Off on Hair Spa & Colour`, description: 'Keratin, global colour and nourishing hair spa with premium salon products.', type: 'FIXED_AMOUNT', min: 300, max: 800, step: 100, terms: ['Minimum service value ₹1,500.', 'Patch test recommended for colour.'], merchants: ['Mane Street Hair Studio', 'Glow Ritual Salon', 'Velvet Touch Unisex Salon', 'Bridal Bliss Makeovers'] },
      { title: (v) => `${v} Off on Manicure & Pedicure`, description: 'Classic and spa mani-pedi packages with gel polish add-ons.', type: 'PERCENTAGE', min: 15, max: 30, step: 5, terms: ['Valid for walk-ins and bookings.', 'Not valid with membership discounts.'], merchants: ['Polished Nail Bar', 'Glow Ritual Salon', 'Velvet Touch Unisex Salon'] },
    ],
  },
  {
    id: 'health-fitness',
    name: 'Health & Fitness',
    templates: [
      { title: (v) => `${v} Off on 3-Month Membership`, description: 'Full gym floor access, group classes, locker and a free body-composition scan.', type: 'PERCENTAGE', min: 20, max: 50, step: 5, terms: ['Valid for new members.', 'Non-transferable.'], merchants: ['IronPulse Fitness Club', 'CoreFit Functional Gym', 'PowerHouse CrossFit Box', 'Kick & Punch MMA'] },
      { title: (v) => `Flat ${v} Off on Yoga Packs`, description: 'Hatha, vinyasa and power yoga sessions for all levels, mornings and evenings.', type: 'FIXED_AMOUNT', min: 300, max: 1200, step: 100, terms: ['Valid on 12-class packs and above.', 'Classes valid for 60 days.'], merchants: ['Flow State Yoga Studio', 'Zen Mat Pilates', 'Sunrise Asana Shala'] },
      { title: (v) => `${v} Off on Physiotherapy Sessions`, description: 'Sports injury rehab, posture correction and pain management by licensed physios.', type: 'PERCENTAGE', min: 15, max: 25, step: 5, terms: ['First consultation required.', 'Prescription advised for chronic cases.'], merchants: ['Stride Physio Clinic', 'Align Spine Physio Centre', 'MoveWell Rehab'] },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    templates: [
      { title: (v) => `${v} Off on Weekday Bowling`, description: 'Ten-pin lanes with shoe rental, plus snacks combos for groups.', type: 'PERCENTAGE', min: 20, max: 40, step: 5, terms: ['Valid Monday – Thursday.', 'Lane booking subject to availability.'], merchants: ['Strike Zone Bowling', 'Pin Drop Bowling Lounge'] },
      { title: (v) => `Flat ${v} Off on Escape Room for 4`, description: 'Themed 60-minute puzzle rooms for friends, families and team outings.', type: 'FIXED_AMOUNT', min: 200, max: 600, step: 100, terms: ['Minimum 4 players.', 'Book at least 2 hours in advance.'], merchants: ['Escape Hatch Puzzle Rooms', 'Locked In Adventures'] },
      { title: (v) => `${v} Off on Arcade Game Cards`, description: 'VR rides, racing simulators and classic arcade games under one roof.', type: 'PERCENTAGE', min: 15, max: 30, step: 5, terms: ['Valid on recharges of ₹500 and above.', 'Card balance valid 90 days.'], merchants: ['GameOn Arcade', 'TrampoLand Fun Park', 'Pixel Playzone'] },
      { title: (v) => `Flat ${v} Off on Group Bookings`, description: 'Plan a night out with friends: group packages with snacks and reserved seating.', type: 'FIXED_AMOUNT', min: 200, max: 500, step: 100, terms: ['Minimum 4 guests.', 'Advance booking required on weekends.'], merchants: ['Karaoke Kingdom', 'Laugh Riot Comedy Club', 'Paint & Sip Studio', 'Reel Lounge Cinemas'] },
    ],
  },
  {
    id: 'services',
    name: 'Home & Professional Services',
    templates: [
      { title: (v) => `${v} Off on Full Home Deep Cleaning`, description: 'Kitchen degreasing, bathroom descaling and sofa shampooing by trained crews.', type: 'PERCENTAGE', min: 15, max: 35, step: 5, terms: ['Valid for 2BHK and above.', 'Book 24 hours in advance.'], merchants: ['SparkleNest Home Cleaning', 'Shine Squad Cleaners'] },
      { title: (v) => `Flat ${v} Off on AC Servicing`, description: 'Jet-pump wet servicing, gas top-up check and cooling performance report.', type: 'FIXED_AMOUNT', min: 100, max: 400, step: 50, terms: ['Per AC unit.', 'Gas refill charged separately.'], merchants: ['CoolBreeze AC Care', 'QuickFix Plumbing & Electricals'] },
      { title: (v) => `${v} Off on Laundry & Dry Cleaning`, description: 'Free pickup and drop, steam ironing and premium dry cleaning for delicates.', type: 'PERCENTAGE', min: 15, max: 30, step: 5, terms: ['Minimum order ₹499.', 'Turnaround 48 hours.'], merchants: ['Fresh Fold Laundry', 'Press & Pleat Dry Cleaners'] },
      { title: (v) => `${v} Off on Car Spa & Detailing`, description: 'Foam wash, interior vacuuming and ceramic polish at our service bay.', type: 'PERCENTAGE', min: 15, max: 30, step: 5, terms: ['Valid for hatchbacks and sedans.', 'SUVs charged extra.'], merchants: ['ShineOn Car Spa', 'Gleam Garage Detailing'] },
    ],
  },
];

/** Small deterministic PRNG (mulberry32) so the catalogue is identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROADS = ['Main Road', '1st Cross', '2nd Main', '4th Cross', '80 Feet Road', '100 Feet Road', 'Service Road', 'Market Street'];
const UNITS = ['Shop', 'Unit', 'Ground Floor, No.', 'Plot', '#'];

const MS_PER_HOUR = 3600 * 1000;

export interface CityOfferOptions {
  /** Offers per city (default 100). */
  perCity?: number;
  /** Time anchor for validity windows (default: now). */
  now?: number;
}

export function generateCitySampleOffers(city: CityId, options: CityOfferOptions = {}): Offer[] {
  const perCity = options.perCity ?? 100;
  const now = options.now ?? Date.now();
  const rand = mulberry32(city === 'BLR' ? 560001 : 500001);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const localities = CITY_LOCALITIES[city];
  const info = CITY_INFO[city];
  const usedMerchantAtLocality = new Set<string>();

  const offers: Offer[] = [];
  for (let i = 0; i < perCity; i++) {
    const locality = localities[i % localities.length];
    const spec = CATEGORY_SPECS[i % CATEGORY_SPECS.length];
    const template = spec.templates[Math.floor(i / CATEGORY_SPECS.length) % spec.templates.length];

    // Unique merchant per locality
    let merchant = pick(template.merchants);
    for (let tries = 0; usedMerchantAtLocality.has(`${merchant}@${locality.name}`) && tries < 10; tries++) {
      merchant = pick(template.merchants);
    }
    usedMerchantAtLocality.add(`${merchant}@${locality.name}`);

    const steps = Math.floor((template.max - template.min) / template.step) + 1;
    const value = template.min + Math.floor(rand() * steps) * template.step;
    const valueLabel = template.type === 'PERCENTAGE' ? `${value}%` : `₹${value.toLocaleString('en-IN')}`;

    // Spread points within ~600 m of the locality centre
    const lat = +(locality.lat + (rand() - 0.5) * 0.011).toFixed(5);
    const lng = +(locality.lng + (rand() - 0.5) * 0.011).toFixed(5);

    // Validity: ~15% end within 24h, ~20% within 1–3 days, rest 3–30 days
    const r = rand();
    const hoursLeft = r < 0.15 ? 2 + rand() * 20 : r < 0.35 ? 24 + rand() * 48 : 72 + rand() * 24 * 27;
    const startedDaysAgo = 1 + Math.floor(rand() * 10);

    const road = pick(ROADS);
    const unit = `${pick(UNITS)} ${1 + Math.floor(rand() * 220)}`;
    const code = `${merchant.replace(/[^A-Za-z]/g, '').slice(0, 5).toUpperCase()}${value >= 100 ? Math.round(value / 10) : value}`;
    const idx = String(i + 1).padStart(3, '0');

    offers.push({
      id: `sample-${city.toLowerCase()}-${idx}`,
      title: template.title(valueLabel),
      providerId: `sample-prov-${city.toLowerCase()}-${idx}`,
      providerName: merchant,
      description: template.description,
      categoryId: spec.id,
      categoryName: spec.name,
      valueType: template.type,
      value,
      currency: 'INR',
      scope: 'LOCAL',
      location: {
        label: `${road}, ${locality.name}`,
        address: `${unit}, ${road}, ${locality.name}, ${info.name}, ${info.state} ${locality.pin}`,
        latitude: lat,
        longitude: lng,
        city: info.name,
      },
      validFrom: new Date(now - startedDaysAgo * 24 * MS_PER_HOUR).toISOString(),
      validUntil: new Date(now + hoursLeft * MS_PER_HOUR).toISOString(),
      termsAndConditions: [...template.terms, 'Sample offer for demonstration — not a real promotion.'],
      imageUrls: [],
      isActive: true,
      rankingScore: template.type === 'PERCENTAGE' ? value : Math.min(95, Math.round(value / 25)),
      promoCode: code,
      isSample: true,
    });
  }
  return offers;
}

export const CITY_SAMPLE_OFFERS: Offer[] = [
  ...generateCitySampleOffers('BLR'),
  ...generateCitySampleOffers('HYD'),
];
