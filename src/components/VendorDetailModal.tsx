/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  AlertCircle,
  Eye,
  MousePointer,
  Sparkles,
} from 'lucide-react';
import { VendorProfile, VendorStatus } from '../domain/models/Vendor';
import { AuthUser } from '../domain/models/Offer';
import { vendorService } from '../services/vendors/VendorService';
import { INITIAL_CATEGORIES } from '../config/categories';

interface VendorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorProfile | null;
  actor: AuthUser;
  onUpdated: () => void;
}

export const VendorDetailModal: React.FC<VendorDetailModalProps> = ({
  isOpen,
  onClose,
  vendor,
  actor,
  onUpdated,
}) => {
  if (!isOpen || !vendor) return null;

  const isAdmin = actor.role === 'ADMIN';

  const [businessName, setBusinessName] = useState(vendor.businessName);
  const [legalEntityName, setLegalEntityName] = useState(vendor.legalEntityName || '');
  const [category, setCategory] = useState(vendor.category);
  const [contactPhone, setContactPhone] = useState(vendor.contactPhone);
  const [contactEmail, setContactEmail] = useState(vendor.contactEmail);
  const [address, setAddress] = useState(vendor.address);
  const [city, setCity] = useState(vendor.city);
  const [status, setStatus] = useState<VendorStatus>(vendor.status);
  const [description, setDescription] = useState(vendor.description || '');
  const [operatingHours, setOperatingHours] = useState(vendor.operatingHours || '');
  const [verificationBadge, setVerificationBadge] = useState(vendor.verificationBadge);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await vendorService.updateVendor(
        vendor.id,
        {
          businessName: businessName.trim(),
          legalEntityName: legalEntityName.trim() || undefined,
          category,
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          address: address.trim(),
          city: city.trim(),
          status: isAdmin ? status : undefined,
          description: description.trim() || undefined,
          operatingHours: operatingHours.trim() || undefined,
        },
        actor
      );

      onUpdated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {vendor.businessName}
                </h2>
                {vendor.verificationBadge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck size={11} />
                    <span>Verified Vendor</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Vendor ID: {vendor.id} · Registered {new Date(vendor.registrationDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Trade Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legal Registered Entity Name
              </label>
              <input
                type="text"
                value={legalEntityName}
                onChange={(e) => setLegalEntityName(e.target.value)}
                placeholder="e.g. Wild Yeast Bakers LLP"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 cursor-pointer"
              >
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 08:00 AM - 10:00 PM"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vendor Status (Admin Control)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VendorStatus)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="DEACTIVATED">DEACTIVATED</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSubmitting ? 'Saving...' : 'Update Vendor Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
