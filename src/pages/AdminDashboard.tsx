/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  LogOut,
  ExternalLink,
  Edit3,
  MapPin,
  RefreshCw,
  Sparkles,
  ImageIcon,
  Users,
  Building2,
  Activity,
  Plus,
  Trash2,
  Smartphone,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { useSystemBarStyle } from '../hooks/useSystemBarStyle';
import { AuthUser } from '../domain/models/Offer';
import {
  Advertisement,
  AdvertisementStatus,
  AdvertisementSubmissionPayload,
} from '../domain/models/Advertisement';
import { UserProfile, UserRole, UserStatus } from '../domain/models/User';
import { VendorProfile } from '../domain/models/Vendor';
import { LoginActivityMetrics, LoginActivityRecord } from '../domain/models/LoginActivity';
import { advertisementService } from '../services/advertisements/AdvertisementService';
import { userService } from '../services/users/UserService';
import { vendorService } from '../services/vendors/VendorService';
import { loginActivityService } from '../services/auth/LoginActivityService';
import { AdminReviewModal } from '../components/AdminReviewModal';
import { UserCrudModal } from '../components/UserCrudModal';
import { VendorDetailModal } from '../components/VendorDetailModal';
import { INITIAL_CATEGORIES } from '../config/categories';

interface AdminDashboardProps {
  adminUser: AuthUser;
  onLogout: () => void;
  onViewMarketplace: () => void;
  onOpenDemoInfo: () => void;
}

type AdminTab = 'ADS' | 'USERS' | 'VENDORS' | 'LOGIN_ACTIVITY';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onViewMarketplace,
  onOpenDemoInfo,
}) => {
  useSystemBarStyle('light-content');
  const [activeTab, setActiveTab] = useState<AdminTab>('ADS');

  // Advertisements State
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [statusFilter, setStatusFilter] = useState<AdvertisementStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [selectedAdForReview, setSelectedAdForReview] = useState<Advertisement | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Users Management State (CRUD)
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UserProfile | null>(null);
  const [isUserCrudModalOpen, setIsUserCrudModalOpen] = useState(false);

  // Vendors Management State (CRUD)
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [selectedVendorForModal, setSelectedVendorForModal] = useState<VendorProfile | null>(null);

  // Login Activity State
  const [metrics, setMetrics] = useState<LoginActivityMetrics | null>(null);
  const [activityLogs, setActivityLogs] = useState<LoginActivityRecord[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Install on Phone via USB Modal

  // Load Ads
  const loadAdminAds = async () => {
    setIsLoadingAds(true);
    try {
      const data = await advertisementService.getAdvertisementsForAdmin(adminUser, {
        status: statusFilter,
        categoryId: categoryFilter,
        search: searchQuery,
      });
      setAds(data);
    } catch (err: unknown) {
      console.error('Failed to load admin submissions:', err);
    } finally {
      setIsLoadingAds(false);
    }
  };

  // Load Users
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await userService.listUsers({
        role: userRoleFilter,
        status: userStatusFilter,
        search: userSearchQuery,
        page: userPage,
        limit: 10,
      });
      setUsers(res.items);
      setUsersTotal(res.total);
    } catch (err: unknown) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load Vendors
  const loadVendors = async () => {
    setIsLoadingVendors(true);
    try {
      const res = await vendorService.listVendors({ search: vendorSearch });
      setVendors(res.items);
    } catch (err: unknown) {
      console.error('Failed to load vendors:', err);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  // Load Metrics
  const loadMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const m = await loginActivityService.getActivityMetrics();
      setMetrics(m);
      const logs = await loginActivityService.getRecentActivityLogs(25);
      setActivityLogs(logs);
    } catch (err: unknown) {
      console.error('Failed to load login metrics:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ADS') {
      loadAdminAds();
    } else if (activeTab === 'USERS') {
      loadUsers();
    } else if (activeTab === 'VENDORS') {
      loadVendors();
    } else if (activeTab === 'LOGIN_ACTIVITY') {
      loadMetrics();
    }
  }, [
    activeTab,
    statusFilter,
    categoryFilter,
    searchQuery,
    userRoleFilter,
    userStatusFilter,
    userSearchQuery,
    userPage,
    vendorSearch,
  ]);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Ad Actions
  const handleApprove = async (adId: string, notes?: string) => {
    await advertisementService.approveAdvertisement(adId, adminUser, notes);
    showFeedback('Advertisement approved and published live.');
    await loadAdminAds();
  };

  const handleReject = async (adId: string, reason: string) => {
    await advertisementService.rejectAdvertisement(adId, reason, adminUser);
    showFeedback('Advertisement rejected. Feedback sent to advertizer.');
    await loadAdminAds();
  };

  const handleEditDetails = async (adId: string, updates: Partial<AdvertisementSubmissionPayload>) => {
    await advertisementService.updateAdvertisement(adId, updates, adminUser);
    showFeedback('Advertisement modified by administrator.');
    await loadAdminAds();
  };

  // User Actions
  const handleDeactivateUser = async (user: UserProfile) => {
    const confirm = window.confirm(`Are you sure you want to deactivate ${user.displayName}?`);
    if (!confirm) return;
    try {
      await userService.deactivateUser(user.id, adminUser);
      showFeedback(`User ${user.displayName} deactivated.`);
      await loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    const confirm = window.confirm(`Permanently delete account for ${user.displayName}?`);
    if (!confirm) return;
    try {
      await userService.deleteUser(user.id, adminUser);
      showFeedback(`User ${user.displayName} permanently deleted.`);
      await loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  // Vendor Actions
  const handleToggleVendorVerification = async (vendor: VendorProfile) => {
    try {
      await vendorService.updateVendor(
        vendor.id,
        { status: vendor.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' },
        adminUser
      );
      showFeedback(`Vendor ${vendor.businessName} status updated.`);
      await loadVendors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update vendor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased pb-[var(--sab)]">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md pt-[var(--sat)] pl-[var(--sal)] pr-[var(--sar)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base font-extrabold tracking-tight whitespace-nowrap truncate">
                  <span className="sm:hidden">Admin Panel</span>
                  <span className="hidden sm:inline">Admin Oversight Panel</span>
                </span>
                <span className="hidden min-[480px]:inline px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider whitespace-nowrap">
                  Verified Root
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                User Management, Vendor Management &amp; Usage Analytics
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            <button
              onClick={onOpenDemoInfo}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 px-2.5 py-1.5 rounded-xl border border-indigo-700/60 transition-colors cursor-pointer"
            >
              <Sparkles size={12} />
              <span className="hidden sm:inline">Audit Details</span>
            </button>

            <button
              onClick={onViewMarketplace}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Marketplace</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Global Module Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex gap-2 border-t border-slate-800/80 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTab('ADS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'ADS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock size={14} />
            <span>Advertisements &amp; Review ({ads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'USERS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users size={14} />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab('VENDORS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'VENDORS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} />
            <span>Vendor Management</span>
          </button>

          <button
            onClick={() => setActiveTab('LOGIN_ACTIVITY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'LOGIN_ACTIVITY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity size={14} />
            <span>Login Activity &amp; Analytics</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {feedbackMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* TAB 1: ADVERTISEMENTS MODERATION */}
        {activeTab === 'ADS' && (
          <div className="space-y-6">
            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Submissions
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {ads.length}
                </span>
              </div>
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Pending Review
                </span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">
                  {ads.filter((a) => a.status === 'PENDING_APPROVAL').length}
                </span>
              </div>
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Live Published
                </span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">
                  {ads.filter((a) => a.status === 'APPROVED').length}
                </span>
              </div>
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-xs">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  Rejected
                </span>
                <span className="text-2xl font-black text-rose-900 mt-1 block">
                  {ads.filter((a) => a.status === 'REJECTED').length}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Expired / Draft
                </span>
                <span className="text-2xl font-black text-slate-700 mt-1 block">
                  {ads.filter((a) => a.status === 'EXPIRED' || a.status === 'DRAFT').length}
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, business, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AdvertisementStatus | 'ALL')}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved / Live</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="DRAFT">Draft</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {INITIAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={loadAdminAds}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-pointer transition-colors"
                  title="Refresh Submissions"
                >
                  <RefreshCw size={14} className={isLoadingAds ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Ads List */}
            {isLoadingAds ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Loading submissions...
              </div>
            ) : ads.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
                <p className="text-sm font-bold text-slate-800">No advertisements found matching filters.</p>
                <p className="text-xs text-slate-500">Submissions made by advertizers will appear here for review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
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
                              : ad.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ad.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Banner Thumbnail Preview */}
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

                      <p className="text-xs text-indigo-700 font-semibold">
                        {ad.providerName}
                      </p>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {ad.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        {ad.valueType === 'PERCENTAGE' ? `${ad.value}% OFF` : `₹${ad.value} OFF`}
                        {ad.promoCode && ` · ${ad.promoCode}`}
                      </div>

                      <button
                        onClick={() => setSelectedAdForReview(ad)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Inspect &amp; Decide</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT CRUD */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-auto">
                <div className="relative col-span-2 w-full md:w-72">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, phone, email..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:bg-white"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value as UserRole | 'ALL');
                    setUserPage(1);
                  }}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">USER</option>
                  <option value="ADVERTIZER">ADVERTIZER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value as UserStatus | 'ALL');
                    setUserPage(1);
                  }}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DEACTIVATED">DEACTIVATED</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedUserToEdit(null);
                  setIsUserCrudModalOpen(true);
                }}
                className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Plus size={14} />
                <span>Register User</span>
              </button>
            </div>

            <p className="sm:hidden text-[11px] font-semibold text-slate-400 -mb-2">Swipe the table sideways to see more →</p>
            {/* Users Table (scrolls sideways on small screens instead of clipping) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Activity</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No users found matching query.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div>{u.displayName}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <div>{u.countryCode} {u.phoneNumber}</div>
                          {u.email && <div className="text-[11px] text-slate-400">{u.email}</div>}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'ADVERTIZER'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.status === 'INACTIVE'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-500">
                          <div>Logins: {u.loginCount || 0}</div>
                          <div>
                            Last: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedUserToEdit(u);
                              setIsUserCrudModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                            title="Edit User"
                          >
                            <Edit3 size={14} />
                          </button>
                          {u.status !== 'DEACTIVATED' && (
                            <button
                              onClick={() => handleDeactivateUser(u)}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                              title="Deactivate User"
                            >
                              <ShieldAlert size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>Total: {usersTotal} users registered</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage <= 1}
                    className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="font-bold text-slate-700">Page {userPage}</span>
                  <button
                    onClick={() => setUserPage((p) => p + 1)}
                    disabled={userPage * 10 >= usersTotal}
                    className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VENDOR MANAGEMENT CRUD */}
        {activeTab === 'VENDORS' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="relative w-full max-w-sm">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vendors by name, city, email..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:bg-white"
                />
              </div>

              <button
                onClick={loadVendors}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
              >
                <RefreshCw size={14} className={isLoadingVendors ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {v.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          v.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{v.businessName}</span>
                      {v.verificationBadge && <ShieldCheck size={14} className="text-emerald-600" />}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <MapPin size={12} className="text-indigo-600 shrink-0" />
                      <span>{v.address}, {v.city}</span>
                    </p>

                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                      <div>Phone: {v.contactPhone}</div>
                      <div>Email: {v.contactEmail}</div>
                      <div>Onboarding: {v.onboardingProgress}% ({v.onboardingStatus})</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleVendorVerification(v)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        v.status === 'ACTIVE'
                          ? 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100'
                          : 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {v.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>

                    <button
                      onClick={() => setSelectedVendorForModal(v)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LOGIN ACTIVITY & ANALYTICS (DAU/WAU/MAU) */}
        {activeTab === 'LOGIN_ACTIVITY' && (
          <div className="space-y-6">
            {metrics ? (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Daily Active Users (DAU)
                    </span>
                    <span className="text-3xl font-black text-indigo-600 mt-1 block">
                      {metrics.activeUsersToday}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Active past 24 hours
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Weekly Active (WAU)
                    </span>
                    <span className="text-3xl font-black text-emerald-600 mt-1 block">
                      {metrics.activeUsersThisWeek}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Past 7 days unique
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Monthly Active (MAU)
                    </span>
                    <span className="text-3xl font-black text-purple-600 mt-1 block">
                      {metrics.activeUsersThisMonth}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Past 30 days unique
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Registrations
                    </span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">
                      {metrics.totalRegisteredUsers}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Verified accounts
                    </span>
                  </div>
                </div>

                {/* Platform Distribution & Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform Breakdown */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone size={14} className="text-indigo-600" />
                      <span>Cross-Platform User Distribution</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                          Android
                        </span>
                        <span className="text-xl font-black text-emerald-950 mt-1 block">
                          {metrics.platformBreakdown.android}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-700 block uppercase">
                          iPhone (iOS)
                        </span>
                        <span className="text-xl font-black text-slate-950 mt-1 block">
                          {metrics.platformBreakdown.ios}
                        </span>
                      </div>

                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-bold text-indigo-700 block uppercase">
                          Web Browser
                        </span>
                        <span className="text-xl font-black text-indigo-950 mt-1 block">
                          {metrics.platformBreakdown.web}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 7-Day Trend Bar Chart */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-emerald-600" />
                      <span>7-Day Login Trends &amp; Active Users</span>
                    </h3>

                    <div className="flex items-end justify-between h-32 pt-4 px-2 gap-2">
                      {metrics.recentLoginTrends.map((t, idx) => {
                        const maxVal = Math.max(...metrics.recentLoginTrends.map((x) => x.successfulLogins), 1);
                        const heightPct = Math.max(15, (t.successfulLogins / maxVal) * 100);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-indigo-700">{t.successfulLogins}</span>
                            <div
                              className="w-full bg-indigo-600 rounded-t-lg transition-all"
                              style={{ height: `${heightPct}%` }}
                            />
                            <span className="text-[9px] font-mono text-slate-400">
                              {t.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Activity Log Stream */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={14} className="text-indigo-600" />
                    <span>Real-Time Authentication &amp; Activity Log Stream</span>
                  </h3>

                  <p className="sm:hidden text-[11px] font-semibold text-slate-400">Swipe the table sideways to see more →</p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-xs divide-y divide-slate-100 whitespace-nowrap">
                      <thead>
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-2">Timestamp</th>
                          <th className="pb-2">Identifier</th>
                          <th className="pb-2">Platform</th>
                          <th className="pb-2">Role</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Device Info</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activityLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 font-mono text-[11px] text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="py-2.5 font-bold text-slate-800">
                              {log.phoneNumber || log.email || log.userId || 'Guest'}
                            </td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                                {log.platform}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-600 uppercase text-[10px] font-semibold">
                              {log.role || '—'}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  log.status === 'SUCCESS'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-[11px] text-slate-500 max-w-xs truncate">
                              {log.failureReason || log.deviceInfo || 'Browser'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">Loading metrics...</div>
            )}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedAdForReview && (
        <AdminReviewModal
          isOpen={Boolean(selectedAdForReview)}
          onClose={() => setSelectedAdForReview(null)}
          advertisement={selectedAdForReview}
          adminUser={adminUser}
          onApprove={handleApprove}
          onReject={handleReject}
          onEditDetails={handleEditDetails}
        />
      )}

      {/* User CRUD Modal */}
      <UserCrudModal
        isOpen={isUserCrudModalOpen}
        onClose={() => {
          setIsUserCrudModalOpen(false);
          setSelectedUserToEdit(null);
        }}
        userToEdit={selectedUserToEdit}
        adminUser={adminUser}
        onSaved={loadUsers}
      />

      {/* Vendor Detail Modal */}
      <VendorDetailModal
        isOpen={Boolean(selectedVendorForModal)}
        onClose={() => setSelectedVendorForModal(null)}
        vendor={selectedVendorForModal}
        actor={adminUser}
        onUpdated={loadVendors}
      />

    </div>
  );
};
