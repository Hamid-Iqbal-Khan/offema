/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Tag,
  Search,
  Bell,
  ArrowRightLeft,
  Sparkles,
  Info,
  ExternalLink,
  ImageIcon,
  Building2,
  TrendingUp,
  MousePointer,
  Eye,
  ShoppingBag,
  FileText,
  Trash2,
  Smartphone,
  Save,
  Check,
} from 'lucide-react';
import { AuthUser } from '../domain/models/Offer';
import {
  Advertisement,
  AdvertisementNotification,
  AdvertisementSubmissionPayload,
  AdvertisementStatus,
} from '../domain/models/Advertisement';
import { VendorProfile, VendorAnalytics } from '../domain/models/Vendor';
import { advertisementService } from '../services/advertisements/AdvertisementService';
import { vendorService } from '../services/vendors/VendorService';
import { AdvertisementSubmissionModal } from '../components/AdvertisementSubmissionModal';
import { AdvertizerNotificationsModal } from '../components/AdvertizerNotificationsModal';
import { ProfileModal } from '../components/ProfileModal';
import { VendorOnboardingWizard } from '../components/VendorOnboardingWizard';

interface AdvertizerDashboardProps {
  user: AuthUser;
  onLogout: () => void;
  onSwitchRole: (targetRole: 'USER' | 'ADVERTIZER') => Promise<void>;
  onViewMarketplace: () => void;
  onOpenDemoInfo: () => void;
}

type AdvertizerTab = 'CAMPAIGNS' | 'VENDOR_PROFILE' | 'ANALYTICS';

export const AdvertizerDashboard: React.FC<AdvertizerDashboardProps> = ({
  user,
  onLogout,
  onSwitchRole,
  onViewMarketplace,
  onOpenDemoInfo,
}) => {
  const [activeTab, setActiveTab] = useState<AdvertizerTab>('CAMPAIGNS');
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [notifications, setNotifications] = useState<AdvertisementNotification[]>([]);
  const [statusFilter, setStatusFilter] = useState<AdvertisementStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Vendor Profile State
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [vendorAnalytics, setVendorAnalytics] = useState<VendorAnalytics | null>(null);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingWizardOpen, setIsOnboardingWizardOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // Vendor Profile form state
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Load Advertizer data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const userAds = await advertisementService.getAdvertisementsForAdvertizer(user);
      setAds(userAds);
      const userNotifs = await advertisementService.getNotifications(user);
      setNotifications(userNotifs);

      // Load or initialize vendor profile
      let vp = await vendorService.getVendorByUserId(user.uid);
      if (!vp) {
        // Auto-create initial vendor profile for Advertizer
        vp = await vendorService.registerVendor(
          {
            userId: user.uid,
            businessName: user.advertizerProfile?.businessName || `Merchant (${user.phoneNumber.slice(-4)})`,
            contactPhone: `${user.countryCode} ${user.phoneNumber}`,
            category: 'food-dining',
            city: 'Hyderabad',
          },
          user
        );
      }
      setVendorProfile(vp);
      setEditBusinessName(vp.businessName);
      setEditPhone(vp.contactPhone);
      setEditEmail(vp.contactEmail);
      setEditAddress(vp.address);
      setEditCity(vp.city);
      setEditHours(vp.operatingHours || '09:00 AM - 09:00 PM');
      setEditDesc(vp.description || '');

      // Load analytics
      const va = await vendorService.getVendorAnalytics(vp.id, user);
      setVendorAnalytics(va);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = advertisementService.onNotificationsChanged(user, (notifs) => {
      setNotifications(notifs);
    });
    return () => unsub();
  }, [user]);

  const handleCreateNewAd = () => {
    setEditingAd(null);
    setIsSubmitModalOpen(true);
  };

  const handleEditAd = (ad: Advertisement) => {
    setEditingAd(ad);
    setIsSubmitModalOpen(true);
  };

  const handleDeleteAd = async (adId: string) => {
    const confirm = window.confirm('Are you sure you want to delete this advertisement?');
    if (!confirm) return;
    try {
      await advertisementService.deleteAdvertisement(adId, user);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete advertisement');
    }
  };

  const handleSubmitAd = async (payload: AdvertisementSubmissionPayload) => {
    if (vendorProfile) {
      payload.vendorId = vendorProfile.id;
    }
    if (editingAd) {
      await advertisementService.updateAdvertisement(editingAd.id, payload, user);
    } else {
      await advertisementService.submitAdvertisement(payload, user);
    }
    await loadData();
  };

  const handleSaveVendorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorProfile) return;
    try {
      const updated = await vendorService.updateVendor(
        vendorProfile.id,
        {
          businessName: editBusinessName.trim(),
          contactPhone: editPhone.trim(),
          contactEmail: editEmail.trim(),
          address: editAddress.trim(),
          city: editCity.trim(),
          operatingHours: editHours.trim(),
          description: editDesc.trim(),
        },
        user
      );
      setVendorProfile(updated);
      setProfileSavedMsg('Vendor profile changes saved successfully.');
      setTimeout(() => setProfileSavedMsg(null), 3500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save vendor profile');
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    await advertisementService.markNotificationAsRead(id, user);
  };

  const handleMarkAllNotifsRead = async () => {
    await advertisementService.markAllNotificationsAsRead(user);
  };

  // Metrics
  const totalCount = ads.length;
  const pendingCount = ads.filter((a) => a.status === 'PENDING_APPROVAL').length;
  const approvedCount = ads.filter((a) => a.status === 'APPROVED').length;
  const draftCount = ads.filter((a) => a.status === 'DRAFT').length;
  const rejectedCount = ads.filter((a) => a.status === 'REJECTED').length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Filtered ads
  const filteredAds = ads.filter((ad) => {
    if (statusFilter !== 'ALL' && ad.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ad.title.toLowerCase().includes(q) ||
        ad.providerName.toLowerCase().includes(q) ||
        ad.description.toLowerCase().includes(q) ||
        ad.promoCode?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                <Megaphone size={16} />
              </div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                Vendor Hub
              </span>
            </div>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {vendorProfile?.businessName || 'Merchant Mode'}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* AI Offer Copilot Wizard Button */}
            <button
              onClick={() => setIsOnboardingWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Generate new promotion using AI Agent"
            >
              <Sparkles size={13} className="text-indigo-600" />
              <span className="hidden sm:inline">AI Offer Copilot</span>
              <span className="sm:hidden">AI Offer</span>
            </button>

            {/* View Marketplace Button */}
            <button
              onClick={onViewMarketplace}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Browse live customer marketplace"
            >
              <ExternalLink size={13} />
              <span className="hidden md:inline">Live Marketplace</span>
            </button>

            {/* Role Switcher Pill */}
            <button
              onClick={() => onSwitchRole('USER')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer"
              title="Switch to User (Consumer) Mode"
            >
              <ArrowRightLeft size={13} />
              <span className="hidden sm:inline">Switch to User</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifModalOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="View approval & review notifications"
            >
              <Bell size={18} />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              title="Account & Role Settings"
            >
              {user.phoneNumber.slice(-2)}
            </button>

            {/* New Ad CTA */}
            <button
              onClick={handleCreateNewAd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Ad</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-slate-100 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('CAMPAIGNS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'CAMPAIGNS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Megaphone size={14} />
            <span>Campaigns &amp; Offers ({ads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('VENDOR_PROFILE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'VENDOR_PROFILE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 size={14} />
            <span>Vendor Profile CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'ANALYTICS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp size={14} />
            <span>Performance Analytics</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {profileSavedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{profileSavedMsg}</span>
          </div>
        )}

        {/* TAB 1: CAMPAIGNS & OFFERS */}
        {activeTab === 'CAMPAIGNS' && (
          <div className="space-y-6">
            {/* Banner with AI Offer Copilot Notice */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-200/80 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Vendor Advertisement Lifecycle &amp; AI Standardization
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Upload standardized 1200×675 px banners or promotional video clips. The system automatically preserves 100% of text and graphics before submission to the Admin Dashboard.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOnboardingWizardOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>AI Offer Onboarding</span>
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Offers
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {totalCount}
                </span>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Pending Review
                </span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">
                  {pendingCount}
                </span>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Live Published
                </span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">
                  {approvedCount}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Drafts
                </span>
                <span className="text-2xl font-black text-slate-700 mt-1 block">
                  {draftCount}
                </span>
              </div>

              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-xs">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  Action Required
                </span>
                <span className="text-2xl font-black text-rose-900 mt-1 block">
                  {rejectedCount}
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search my advertisements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AdvertisementStatus | 'ALL')}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Live Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="REJECTED">Needs Revision</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            {/* Ads List */}
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading your campaigns...</div>
            ) : filteredAds.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <p className="text-sm font-bold text-slate-800">No advertisements found.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Get started by creating your first promotional advertisement with AI optimization or our easy submission form.
                </p>
                <button
                  onClick={handleCreateNewAd}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create Advertisement</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {ad.categoryName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ad.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ad.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : ad.status === 'DRAFT'
                              ? 'bg-slate-100 text-slate-700'
                              : ad.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ad.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Banner / Media Thumbnail */}
                      {(ad.bannerImageUrl || ad.imageUrls?.length > 0) && (
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                          <img
                            src={ad.bannerImageUrl || ad.imageUrls[0]}
                            alt={ad.title}
                            className="w-full h-full object-cover object-center"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <ImageIcon size={10} />
                            <span>1200×675</span>
                          </div>
                        </div>
                      )}

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                        {ad.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {ad.description}
                      </p>

                      {ad.rejectionReason && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800">
                          <strong>Admin Feedback:</strong> {ad.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-700">
                        {ad.valueType === 'PERCENTAGE' ? `${ad.value}% OFF` : `₹${ad.value} OFF`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {(ad.status === 'DRAFT' || ad.status === 'REJECTED' || ad.status === 'EXPIRED') && (
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAd(ad)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VENDOR PROFILE CRUD */}
        {activeTab === 'VENDOR_PROFILE' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs max-w-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={16} className="text-amber-600" />
                  <span>Vendor Business Profile CRUD</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your store identity, contact info, operating hours, and location
                </p>
              </div>

              {vendorProfile?.verificationBadge && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified Merchant
                </span>
              )}
            </div>

            <form onSubmit={handleSaveVendorProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Store Name *
                </label>
                <input
                  type="text"
                  value={editBusinessName}
                  onChange={(e) => setEditBusinessName(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  placeholder="e.g. 08:00 AM - 10:00 PM"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-600/20"
                >
                  <Save size={14} />
                  <span>Save Vendor Profile</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PERFORMANCE ANALYTICS */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            {vendorAnalytics ? (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Impressions / Views
                    </span>
                    <span className="text-3xl font-black text-indigo-600 mt-1 block">
                      {vendorAnalytics.totalViews}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Users saw your offers
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Offer Detail Clicks
                    </span>
                    <span className="text-3xl font-black text-emerald-600 mt-1 block">
                      {vendorAnalytics.totalClicks}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      CTR: {vendorAnalytics.clickThroughRatePercent}%
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Engagements (Saved/Directions)
                    </span>
                    <span className="text-3xl font-black text-purple-600 mt-1 block">
                      {vendorAnalytics.totalEngagements}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      High-intent shoppers
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Conversions / Redemptions
                    </span>
                    <span className="text-3xl font-black text-amber-600 mt-1 block">
                      {vendorAnalytics.totalConversions}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Conv. Rate: {vendorAnalytics.conversionRatePercent}%
                    </span>
                  </div>
                </div>

                {/* 7-Day Performance Trends Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-600" />
                        <span>Daily Performance: Views vs. Clicks (Past 7 Days)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Clearly distinguished impression views, detail clicks, and redemptions over time
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-indigo-700 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                        <span>Views</span>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                        <span>Clicks</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between h-40 pt-4 px-2 gap-3">
                    {vendorAnalytics.dailyTrends.map((d, i) => {
                      const maxV = Math.max(...vendorAnalytics.dailyTrends.map((x) => x.views), 1);
                      const viewH = Math.max(15, (d.views / maxV) * 100);
                      const clickH = Math.max(8, (d.clicks / maxV) * 100);

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-700">{d.clicks}c / {d.views}v</span>
                          <div className="w-full flex items-end justify-center gap-1 h-28">
                            <div
                              className="w-1/2 bg-indigo-500 rounded-t-md transition-all"
                              style={{ height: `${viewH}%` }}
                              title={`Views: ${d.views}`}
                            />
                            <div
                              className="w-1/2 bg-emerald-500 rounded-t-md transition-all"
                              style={{ height: `${clickH}%` }}
                              title={`Clicks: ${d.clicks}`}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-slate-400">
                            {d.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">Loading vendor analytics...</div>
            )}
          </div>
        )}
      </main>

      {/* Ad Submission Modal */}
      {isSubmitModalOpen && (
        <AdvertisementSubmissionModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={handleSubmitAd}
          user={user}
          editingAd={editingAd}
        />
      )}

      {/* AI Vendor Onboarding Wizard */}
      <VendorOnboardingWizard
        isOpen={isOnboardingWizardOpen}
        onClose={() => setIsOnboardingWizardOpen(false)}
        user={user}
        onCompleted={async () => {
          await loadData();
        }}
      />

      {/* Notifications Modal */}
      {isNotifModalOpen && (
        <AdvertizerNotificationsModal
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkNotifRead}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          onSelectAdForEdit={(adId) => {
            const found = ads.find((a) => a.id === adId);
            if (found) handleEditAd(found);
          }}
        />
      )}

      {/* Profile & Role Switch Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSwitchRole={onSwitchRole}
        onLogout={onLogout}
        totalSubmissionsCount={totalCount}
      />

    </div>
  );
};
