/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AuthUser,
  Offer,
  OfferWithDistance,
  OfferCategory,
  FilterCriteria,
  SortOption,
} from '../domain/models/Offer';
import { IOfferRepository } from '../services/offers/OfferRepository';
import { ILocationService, LocationResult } from '../services/location/LocationService';
import { favoritesService } from '../services/favorites/FavoritesService';
import { calculateHaversineDistanceKm, formatDistance } from '../domain/logic/distance';
import { filterOffers } from '../domain/logic/filterOffers';
import { sortOffers } from '../domain/logic/sortOffers';
import { AppHeader } from '../components/AppHeader';
import { LocationBanner } from '../components/LocationBanner';
import { TabBar } from '../components/TabBar';
import { SearchBar } from '../components/SearchBar';
import { SortSelect } from '../components/SortSelect';
import { OfferCard } from '../components/OfferCard';
import { FilterDrawer } from '../components/FilterDrawer';
import { OfferDetailsModal } from '../components/OfferDetailsModal';
import { LocationModal } from '../components/LocationModal';
import { DemoInfoModal } from '../components/DemoInfoModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NearbyOffersMap } from '../components/NearbyOffersMap';
import { ProfileModal } from '../components/ProfileModal';
import { AdvertisementSubmissionModal } from '../components/AdvertisementSubmissionModal';
import { AdvertizerNotificationsModal } from '../components/AdvertizerNotificationsModal';
import { advertisementService } from '../services/advertisements/AdvertisementService';
import { AdvertisementNotification, AdvertisementSubmissionPayload } from '../domain/models/Advertisement';
import { HomeHero } from '../components/HomeHero';
import { CategoryChips } from '../components/CategoryChips';
import { DealRail } from '../components/DealRail';
import { MobileBottomNav } from '../components/MobileBottomNav';
import {
  addRecentlyViewed,
  getRecentlyViewedIds,
  clearRecentlyViewed,
} from '../services/history/RecentlyViewedService';
import { getTimeRemaining, isOfferActiveAndValid } from '../domain/logic/offerValidity';
import { RotateCcw, LayoutGrid, Map as MapIcon, Flame, History } from 'lucide-react';

const DEFAULT_RADIUS_KM = 5;

interface HomePageProps {
  user: AuthUser | null;
  onLogout: () => void;
  offerRepository: IOfferRepository;
  locationService: ILocationService;
  onOpenDemoInfo: () => void;
  isDemoInfoOpen: boolean;
  onCloseDemoInfo: () => void;
  onSwitchRole?: (targetRole: 'USER' | 'ADVERTIZER') => Promise<void>;
  onOpenAdvertizerDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  onLogout,
  offerRepository,
  locationService,
  onOpenDemoInfo,
  isDemoInfoOpen,
  onCloseDemoInfo,
  onSwitchRole,
  onOpenAdvertizerDashboard,
  onOpenAdminDashboard,
}) => {
  // Data state
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<OfferCategory[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);

  // Favorites state (backed by localStorage with Firestore-ready interface)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    favoritesService.getFavoriteIds(user?.uid)
  );

  useEffect(() => {
    setFavoriteIds(favoritesService.getFavoriteIds(user?.uid));
    const unsubscribe = favoritesService.subscribe((updated) => {
      setFavoriteIds(updated);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleToggleFavorite = useCallback(
    (offerId: string) => {
      favoritesService.toggleFavorite(offerId, user?.uid);
      setFavoriteIds(favoritesService.getFavoriteIds(user?.uid));
    },
    [user?.uid]
  );

  // Location state
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Tab state: Nearby vs Global vs Saved Deals
  const [activeTab, setActiveTab] = useState<'NEARBY' | 'GLOBAL' | 'SAVED'>('NEARBY');

  // Display mode: Grid / Cards vs Interactive Map
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filter criteria state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | undefined>(DEFAULT_RADIUS_KM);
  const [minPercentageValue, setMinPercentageValue] = useState<number | undefined>();
  const [minFixedAmountValue, setMinFixedAmountValue] = useState<number | undefined>();

  // Filter Drawer visibility
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sorting state (Default: HIGHEST_OFFER)
  const [sortOption, setSortOption] = useState<SortOption>('HIGHEST_OFFER');

  // Selected Offer for Details View
  const [selectedOffer, setSelectedOfferState] = useState<OfferWithDistance | null>(null);

  // Recently viewed deals (per user, newest first)
  const [recentIds, setRecentIds] = useState<string[]>(() => getRecentlyViewedIds(user?.uid));
  useEffect(() => {
    setRecentIds(getRecentlyViewedIds(user?.uid));
  }, [user?.uid]);

  const setSelectedOffer = useCallback(
    (offer: OfferWithDistance | null) => {
      setSelectedOfferState(offer);
      if (offer) setRecentIds(addRecentlyViewed(offer.id, user?.uid));
    },
    [user?.uid]
  );

  const endingTodayRef = React.useRef<HTMLDivElement>(null);

  // Role Modals: Profile / Role Switcher, Submission Modal, Notifications
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSubmitAdModalOpen, setIsSubmitAdModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdvertisementNotification[]>([]);

  useEffect(() => {
    if (user) {
      const unsub = advertisementService.onNotificationsChanged(user, (notifs) => {
        setNotifications(notifs);
      });
      return () => unsub();
    }
  }, [user]);

  // Load initial offers and categories from repository
  const loadData = useCallback(async () => {
    setIsLoadingOffers(true);
    setOffersError(null);
    try {
      const [fetchedOffers, fetchedCategories] = await Promise.all([
        offerRepository.getActiveOffers(),
        offerRepository.getCategories(),
      ]);
      setAllOffers(fetchedOffers);
      setCategories(fetchedCategories);
    } catch {
      setOffersError('Could not retrieve offers. Please verify your connection.');
    } finally {
      setIsLoadingOffers(false);
    }
  }, [offerRepository]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Request browser location on initial mount after login
  const handleDetectBrowserLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const result = await locationService.getCurrentLocation();
      setUserLocation(result);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Location request denied or unavailable.';
      setLocationError(msg);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [locationService]);

  const handleUseDemoLocation = useCallback(() => {
    const demo = locationService.getDemoLocation();
    setUserLocation(demo);
    setLocationError(null);
  }, [locationService]);

  const handleClearLocation = useCallback(() => {
    setUserLocation(null);
    setLocationError(null);
  }, []);

  // Try detecting location on mount
  useEffect(() => {
    handleDetectBrowserLocation();
  }, [handleDetectBrowserLocation]);

  // Compute distance for all offers based on current user coordinates
  const offersWithDistance: OfferWithDistance[] = useMemo(() => {
    return allOffers.map((offer) => {
      if (offer.scope === 'LOCAL' && offer.location && userLocation?.coordinates) {
        const dist = calculateHaversineDistanceKm(
          userLocation.coordinates,
          offer.location
        );
        return {
          ...offer,
          distanceKm: dist,
          formattedDistance: formatDistance(dist),
        };
      }
      return {
        ...offer,
        distanceKm: undefined,
        formattedDistance: undefined,
      };
    });
  }, [allOffers, userLocation]);

  // Separate pools for counts
  const nearbyPool = useMemo(() => {
    return offersWithDistance.filter((o) => o.scope === 'LOCAL');
  }, [offersWithDistance]);

  const globalPool = useMemo(() => {
    return offersWithDistance.filter((o) => o.scope !== 'LOCAL');
  }, [offersWithDistance]);

  const savedPool = useMemo(() => {
    return offersWithDistance.filter((o) => favoriteIds.includes(o.id));
  }, [offersWithDistance, favoriteIds]);

  // Active filter criteria
  const currentCriteria: FilterCriteria = useMemo(() => {
    return {
      keyword: searchQuery,
      categoryIds: selectedCategoryIds,
      maxDistanceKm: activeTab === 'NEARBY' ? maxDistanceKm : undefined,
      minPercentageValue,
      minFixedAmountValue,
      scopeFilter:
        activeTab === 'NEARBY' ? 'LOCAL' : activeTab === 'GLOBAL' ? 'GLOBAL' : 'ALL',
    };
  }, [
    searchQuery,
    selectedCategoryIds,
    activeTab,
    maxDistanceKm,
    minPercentageValue,
    minFixedAmountValue,
  ]);

  // Active filter count for badge indicator
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategoryIds.length > 0) count += 1;
    if (activeTab === 'NEARBY' && maxDistanceKm !== DEFAULT_RADIUS_KM && maxDistanceKm !== undefined)
      count += 1;
    if (minPercentageValue !== undefined) count += 1;
    if (minFixedAmountValue !== undefined) count += 1;
    return count;
  }, [selectedCategoryIds, activeTab, maxDistanceKm, minPercentageValue, minFixedAmountValue]);

  // Apply filters
  const filteredOffers = useMemo(() => {
    if (activeTab === 'SAVED') {
      const onlySaved = offersWithDistance.filter((o) => favoriteIds.includes(o.id));
      return filterOffers(onlySaved, {
        ...currentCriteria,
        scopeFilter: 'ALL',
      });
    }
    return filterOffers(offersWithDistance, currentCriteria);
  }, [offersWithDistance, currentCriteria, activeTab, favoriteIds]);

  // Apply sorting
  const sortedOffers = useMemo(() => {
    return sortOffers(filteredOffers, sortOption);
  }, [filteredOffers, sortOption]);

  // --- Home discovery helpers (chips, rails, hero stats) ---
  const radiusKm = maxDistanceKm || DEFAULT_RADIUS_KM;

  // Offers in the active tab's scope before category filtering (drives chip counts)
  const tabScopePool = useMemo(() => {
    if (activeTab === 'SAVED') return savedPool;
    if (activeTab === 'GLOBAL') return globalPool;
    return nearbyPool.filter(
      (o) => o.distanceKm === undefined || !userLocation || o.distanceKm <= radiusKm
    );
  }, [activeTab, savedPool, globalPool, nearbyPool, userLocation, radiusKm]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tabScopePool.forEach((o) => {
      if (isOfferActiveAndValid(o)) counts[o.categoryId] = (counts[o.categoryId] || 0) + 1;
    });
    return counts;
  }, [tabScopePool]);

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const endingToday = useMemo(
    () =>
      tabScopePool
        .filter((o) => {
          if (!isOfferActiveAndValid(o)) return false;
          const r = getTimeRemaining(o.validUntil);
          return !r.isExpired && r.totalMs <= 24 * 60 * 60 * 1000;
        })
        .sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()),
    [tabScopePool]
  );

  const recentlyViewed = useMemo(
    () =>
      recentIds
        .map((id) => offersWithDistance.find((o) => o.id === id))
        .filter((o): o is OfferWithDistance => Boolean(o)),
    [recentIds, offersWithDistance]
  );

  const nearbyInRadius = useMemo(
    () =>
      userLocation
        ? nearbyPool.filter((o) => o.distanceKm !== undefined && o.distanceKm <= radiusKm && isOfferActiveAndValid(o))
        : [],
    [nearbyPool, userLocation, radiusKm]
  );

  const bestDiscountLabel = useMemo(() => {
    const pool = nearbyInRadius.length > 0 ? nearbyInRadius : globalPool;
    const bestPct = pool.filter((o) => o.valueType === 'PERCENTAGE').reduce((m, o) => Math.max(m, o.value), 0);
    if (bestPct > 0) return `${bestPct}%`;
    const bestFlat = pool.reduce((m, o) => Math.max(m, o.value), 0);
    return bestFlat > 0 ? `₹${bestFlat.toLocaleString('en-IN')}` : undefined;
  }, [nearbyInRadius, globalPool]);

  const isBrowsingUnfiltered = searchQuery.trim() === '' && activeFilterCount === 0;

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryIds([]);
    setMaxDistanceKm(DEFAULT_RADIUS_KM);
    setMinPercentageValue(undefined);
    setMinFixedAmountValue(undefined);
  };

  const handleSubmitAd = async (payload: AdvertisementSubmissionPayload) => {
    if (!user) return;
    await advertisementService.submitAdvertisement(payload, user);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-200px,#eef2ff_0%,#f8fafc_60%)] flex flex-col antialiased">
      {/* Top Header */}
      <AppHeader
        user={user}
        onLogout={onLogout}
        locationLabel={userLocation?.label}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenDemoInfo={onOpenDemoInfo}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdvertizerDashboard={onOpenAdvertizerDashboard}
        onOpenAdminDashboard={onOpenAdminDashboard}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onOpenSubmitAd={() => setIsSubmitAdModalOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-28 sm:pb-10 space-y-5">
        {/* Personal greeting + location + quick stats */}
        {activeTab !== 'SAVED' && userLocation && (
          <HomeHero
            user={user}
            location={userLocation}
            isLoadingLocation={isLoadingLocation}
            activeRadiusKm={radiusKm}
            nearbyCount={nearbyInRadius.length}
            bestDiscountLabel={bestDiscountLabel}
            endingTodayCount={endingToday.length}
            savedCount={savedPool.length}
            onRefreshLocation={handleDetectBrowserLocation}
            onUseDemoLocation={handleUseDemoLocation}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onOpenSaved={() => setActiveTab('SAVED')}
            onOpenEndingToday={() => {
              setViewMode('grid');
              endingTodayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        )}

        {/* Location Banner: permission prompt / error states (Nearby Section) */}
        {activeTab === 'NEARBY' && !userLocation && (
          <LocationBanner
            location={userLocation}
            isLoading={isLoadingLocation}
            error={locationError}
            onDetectBrowserLocation={handleDetectBrowserLocation}
            onUseDemoLocation={handleUseDemoLocation}
            onOpenGlobalTab={() => setActiveTab('GLOBAL')}
            activeRadiusKm={maxDistanceKm || DEFAULT_RADIUS_KM}
          />
        )}

        {/* Navigation Tabs (Nearby vs Global vs Saved) + Search Bar */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="hidden sm:block">
            <TabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              nearbyCount={nearbyPool.length}
              globalCount={globalPool.length}
              savedCount={savedPool.length}
            />
            </div>

            <SortSelect
              value={sortOption}
              onChange={setSortOption}
              hasLocation={Boolean(userLocation?.coordinates)}
            />
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          {categories.length > 0 && (
            <CategoryChips
              categories={categories}
              counts={categoryCounts}
              selectedIds={selectedCategoryIds}
              onToggle={handleToggleCategory}
              onClear={() => setSelectedCategoryIds([])}
            />
          )}
        </div>

        {/* Discovery rails: deals ending today + recently viewed */}
        {!isLoadingOffers && !offersError && viewMode === 'grid' && activeTab !== 'SAVED' && isBrowsingUnfiltered && (
          <div className="space-y-5">
            <div ref={endingTodayRef} className="scroll-mt-24">
              <DealRail
                title="Ending today"
                subtitle="Grab these before the timer runs out"
                icon={<Flame size={16} />}
                accent="rose"
                offers={endingToday}
                onSelect={setSelectedOffer}
              />
            </div>
            <DealRail
              title="Recently viewed"
              subtitle="Pick up where you left off"
              icon={<History size={16} />}
              offers={recentlyViewed}
              onSelect={setSelectedOffer}
              actionLabel="Clear"
              onAction={() => {
                clearRecentlyViewed(user?.uid);
                setRecentIds([]);
              }}
            />
          </div>
        )}

        {/* Active Filters Pill Bar */}
        {(activeFilterCount > 0 || searchQuery.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-medium">Active filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium shadow-2xs">
                Keyword: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {selectedCategoryIds.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium shadow-2xs">
                {selectedCategoryIds.length} categories
                <button
                  onClick={() => setSelectedCategoryIds([])}
                  className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {activeTab === 'NEARBY' && maxDistanceKm && maxDistanceKm !== DEFAULT_RADIUS_KM && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium shadow-2xs">
                Radius: {maxDistanceKm} km
                <button
                  onClick={() => setMaxDistanceKm(DEFAULT_RADIUS_KM)}
                  className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {minPercentageValue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium shadow-2xs">
                Min: {minPercentageValue}% Off
                <button
                  onClick={() => setMinPercentageValue(undefined)}
                  className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {minFixedAmountValue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium shadow-2xs">
                Min: ₹{minFixedAmountValue} Off
                <button
                  onClick={() => setMinFixedAmountValue(undefined)}
                  className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* Section Header & Count + View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 pt-1">
          <div>
            Showing <strong className="text-slate-900 tabular-nums">{sortedOffers.length}</strong>{' '}
            {activeTab === 'NEARBY'
              ? 'nearby offers'
              : activeTab === 'GLOBAL'
              ? 'global offers'
              : 'saved deals'}
            {activeTab === 'NEARBY' && userLocation && (
              <span> within {maxDistanceKm || DEFAULT_RADIUS_KM} km</span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="font-medium text-slate-500 hidden md:inline">
              Sorted by:{' '}
              <span className="font-semibold text-slate-800">
                {sortOption === 'HIGHEST_OFFER'
                  ? 'Highest Offer'
                  : sortOption === 'LOWEST_OFFER'
                  ? 'Lowest Offer'
                  : sortOption === 'NEAREST'
                  ? 'Nearest Distance'
                  : 'Newest'}
              </span>
            </div>

            {/* View Mode Switcher: Cards vs Map */}
            <div className="inline-flex items-center p-0.5 bg-slate-200/80 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
                title="Grid / Cards view"
              >
                <LayoutGrid size={13} className={viewMode === 'grid' ? 'text-indigo-600' : 'text-slate-500'} />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
                title="Interactive Map view"
              >
                <MapIcon size={13} className={viewMode === 'map' ? 'text-indigo-600' : 'text-slate-500'} />
                <span>Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Offer Cards Feed / Map View / States */}
        {isLoadingOffers ? (
          <LoadingSkeleton />
        ) : offersError ? (
          <ErrorState message={offersError} onRetry={loadData} />
        ) : activeTab === 'SAVED' && savedPool.length === 0 ? (
          // Empty saved deals state
          <EmptyState
            type="NO_SAVED_OFFERS"
            onSwitchToNearby={() => setActiveTab('NEARBY')}
            onSwitchToGlobal={() => setActiveTab('GLOBAL')}
          />
        ) : activeTab === 'NEARBY' && !userLocation ? (
          // Location not set state for Nearby
          <EmptyState
            type="NO_LOCATION"
            onDetectLocation={handleDetectBrowserLocation}
            onUseDemoLocation={handleUseDemoLocation}
            onSwitchToGlobal={() => setActiveTab('GLOBAL')}
          />
        ) : sortedOffers.length === 0 ? (
          // Empty result state
          <EmptyState
            type={
              activeTab === 'NEARBY' && (!maxDistanceKm || maxDistanceKm <= 3)
                ? 'NO_NEARBY_OFFERS'
                : 'NO_FILTER_MATCHES'
            }
            onClearFilters={handleClearFilters}
            onUseDemoLocation={handleUseDemoLocation}
            onSwitchToGlobal={() => setActiveTab('GLOBAL')}
            onExpandRadius={() => setMaxDistanceKm(10)}
          />
        ) : viewMode === 'map' ? (
          /* Interactive Map View with Offers Feed */
          <div className="space-y-6">
            <NearbyOffersMap
              offers={sortedOffers}
              userLocation={userLocation}
              onSelectOffer={(selected) => setSelectedOffer(selected)}
              radiusKm={maxDistanceKm || DEFAULT_RADIUS_KM}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nearby Store Deals ({sortedOffers.filter((o) => o.scope === 'LOCAL' && o.location).length})
                </h3>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Switch to Cards View →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sortedOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onSelect={(selected) => setSelectedOffer(selected)}
                    isFavorite={favoriteIds.includes(offer.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Cards Grid View with Inline Map Callout */
          <div className="space-y-4">
            {activeTab === 'NEARBY' && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-medium truncate">
                  <MapIcon size={14} className="text-indigo-600 shrink-0" />
                  <span className="truncate">
                    Explore {sortedOffers.filter((o) => o.scope === 'LOCAL' && o.location).length} stores visually with pins, radius, and live directions
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className="px-3 py-1 bg-white hover:bg-indigo-50 font-semibold text-indigo-700 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0 ml-2"
                >
                  View on Map
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onSelect={(selected) => setSelectedOffer(selected)}
                  isFavorite={favoriteIds.includes(offer.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Filter Drawer / Modal */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        criteria={currentCriteria}
        onApply={(updated) => {
          setSelectedCategoryIds(updated.categoryIds);
          setMaxDistanceKm(updated.maxDistanceKm);
          setMinPercentageValue(updated.minPercentageValue);
          setMinFixedAmountValue(updated.minFixedAmountValue);
        }}
        onReset={handleClearFilters}
        categories={categories}
        isNearbySection={activeTab === 'NEARBY'}
      />

      {/* Offer Details Modal */}
      <OfferDetailsModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
        userCoordinates={userLocation?.coordinates}
        isFavorite={selectedOffer ? favoriteIds.includes(selectedOffer.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={userLocation}
        onDetectBrowserLocation={handleDetectBrowserLocation}
        onUseDemoLocation={handleUseDemoLocation}
        onClearLocation={handleClearLocation}
        isLoading={isLoadingLocation}
      />

      {/* Demo Information Modal */}
      <DemoInfoModal
        isOpen={isDemoInfoOpen}
        onClose={onCloseDemoInfo}
      />

      {/* Profile & Role Switcher Modal */}
      {user && onSwitchRole && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onSwitchRole={onSwitchRole}
          onLogout={onLogout}
          />
      )}


      {/* Advertisement Submission Modal */}
      {user && (
        <AdvertisementSubmissionModal
          isOpen={isSubmitAdModalOpen}
          onClose={() => setIsSubmitAdModalOpen(false)}
          onSubmit={handleSubmitAd}
          user={user}
        />
      )}

      {/* Advertizer Notifications Modal */}
      {user && (
        <AdvertizerNotificationsModal
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
          notifications={notifications}
          onMarkAsRead={(id) => advertisementService.markNotificationAsRead(id, user)}
          onMarkAllAsRead={() => advertisementService.markAllNotificationsAsRead(user)}
          onSelectAdForEdit={() => {
            if (onOpenAdvertizerDashboard) onOpenAdvertizerDashboard();
          }}
        />
      )}

      {/* Phone bottom navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        viewMode={viewMode}
        onTabChange={setActiveTab}
        onToggleMap={() => setViewMode((m) => (m === 'map' ? 'grid' : 'map'))}
        onOpenProfile={user && onSwitchRole ? () => setIsProfileModalOpen(true) : undefined}
        savedCount={savedPool.length}
      />
    </div>
  );
};
