/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit3,
  MapPin,
  Calendar,
  Clock,
  History,
  AlertCircle,
  Save,
  ImageIcon,
  Sliders,
  Check,
} from 'lucide-react';
import {
  Advertisement,
  AdvertisementSubmissionPayload,
} from '../domain/models/Advertisement';
import { AuthUser } from '../domain/models/Offer';
import { INITIAL_CATEGORIES } from '../config/categories';
import { formatBytes } from '../services/image/BannerStandardizer';

interface AdminReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertisement: Advertisement | null;
  adminUser: AuthUser;
  onApprove: (adId: string, notes?: string) => Promise<void>;
  onReject: (adId: string, reason: string) => Promise<void>;
  onEditDetails: (adId: string, updates: Partial<AdvertisementSubmissionPayload>) => Promise<void>;
}

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({
  isOpen,
  onClose,
  advertisement,
  adminUser: _adminUser,
  onApprove,
  onReject,
  onEditDetails,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editValue, setEditValue] = useState<number>(0);
  const [editValidUntil, setEditValidUntil] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Rejection state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (advertisement) {
      setEditTitle(advertisement.title);
      setEditProvider(advertisement.providerName);
      setEditDescription(advertisement.description);
      setEditValue(advertisement.value);
      setEditValidUntil(advertisement.validUntil.slice(0, 16));
      setEditCategory(advertisement.categoryId);
      setRejectionReason('');
      setApprovalNotes('');
      setIsEditing(false);
      setIsRejecting(false);
      setError(null);
    }
  }, [advertisement, isOpen]);

  if (!isOpen || !advertisement) return null;

  const handleSaveEdits = async () => {
    setError(null);
    if (!editTitle.trim() || !editProvider.trim()) {
      setError('Title and Provider Name cannot be empty.');
      return;
    }
    if (editValue <= 0) {
      setError('Discount value must be greater than zero.');
      return;
    }

    const matchedCategory = INITIAL_CATEGORIES.find((c) => c.id === editCategory);

    setIsLoading(true);
    try {
      await onEditDetails(advertisement.id, {
        title: editTitle.trim(),
        providerName: editProvider.trim(),
        description: editDescription.trim(),
        value: Number(editValue),
        categoryId: editCategory,
        categoryName: matchedCategory?.name || advertisement.categoryName,
        validUntil: new Date(editValidUntil).toISOString(),
      });
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save edits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmApproval = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onApprove(advertisement.id, approvalNotes.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve advertisement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRejection = async () => {
    setError(null);
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setError('A comprehensive rejection reason (minimum 5 characters) is required by policy.');
      return;
    }

    setIsLoading(true);
    try {
      await onReject(advertisement.id, rejectionReason.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject advertisement');
    } finally {
      setIsLoading(false);
    }
  };

  const statusBadge = () => {
    switch (advertisement.status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={12} />
            <span>Pending Approval</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle size={12} />
            <span>Approved / Live</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle size={12} />
            <span>Rejected</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Expired</span>
          </span>
        );
    }
  };

  return (
    <div className="safe-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Review Advertisement Submission
                </h2>
                {statusBadge()}
              </div>
              <p className="text-xs text-slate-500">
                Submitted by {advertisement.advertizerName} ({advertisement.advertizerPhone})
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Edit Toggle */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              Admin Detail Modification:
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
            >
              <Edit3 size={13} />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Details Before Deciding'}</span>
            </button>
          </div>

          {/* Edit Mode vs View Mode */}
          {isEditing ? (
            <div className="space-y-3 p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={editProvider}
                    onChange={(e) => setEditProvider(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 cursor-pointer"
                  >
                    {INITIAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valid Until</label>
                  <input
                    type="datetime-local"
                    value={editValidUntil}
                    onChange={(e) => setEditValidUntil(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveEdits}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>Save Administrative Edits</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Standardized Banner Pre-Approval Inspection */}
              {(advertisement.bannerImageUrl || (advertisement.imageUrls && advertisement.imageUrls.length > 0)) ? (
                <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <ImageIcon size={14} className="text-indigo-600" />
                      <span>Standardized Banner (Pre-Approval Inspection)</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>1200 × 675 px Standard · WebP</span>
                    </span>
                  </div>

                  {/* 16:9 Standardized Banner Preview */}
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300/80 shadow-xs">
                    <img
                      src={advertisement.bannerImageUrl || advertisement.imageUrls[0]}
                      alt={advertisement.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                      Standardized 16:9
                    </div>
                  </div>

                  {/* Banner Standardization Verification Details */}
                  {advertisement.bannerInfo ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Original Upload
                          </span>
                          <span className="font-bold text-slate-800">
                            {advertisement.bannerInfo.originalDimensions.width} × {advertisement.bannerInfo.originalDimensions.height} px
                          </span>
                          <span className="text-slate-500 block text-[10px]">
                            {formatBytes(advertisement.bannerInfo.originalSizeBytes)}
                          </span>
                        </div>

                        <div className="bg-indigo-50/70 p-2 rounded-lg border border-indigo-200">
                          <span className="text-indigo-600 block text-[10px] uppercase font-semibold">
                            Standard Dimension
                          </span>
                          <span className="font-bold text-indigo-950">
                            1200 × 675 px
                          </span>
                          <span className="text-indigo-700 block text-[10px]">
                            16:9 Universal Layout
                          </span>
                        </div>

                        <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                          <span className="text-emerald-700 block text-[10px] uppercase font-semibold">
                            Content Preservation
                          </span>
                          <span className="font-bold text-emerald-950">
                            {advertisement.bannerInfo.contentPreservationPercent ?? 100}% Preserved
                          </span>
                          <span className="text-emerald-700 block text-[10px]">
                            Zero Cutoff Loss
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Format & Strategy
                          </span>
                          <span className="font-bold text-slate-800 uppercase">
                            {advertisement.bannerInfo.standardFormat.replace('image/', '')}
                          </span>
                          <span className="text-slate-500 block text-[10px] capitalize">
                            {advertisement.bannerInfo.optimizationStrategy ? advertisement.bannerInfo.optimizationStrategy.replace('ai-', 'AI ').replace(/-/g, ' ') : 'AI Extension'}
                          </span>
                        </div>
                      </div>

                      {/* AI Content Protection Analysis Report */}
                      {advertisement.bannerInfo.aiAnalysis && (
                        <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1 text-indigo-900">
                              <ShieldCheck size={13} className="text-indigo-600" />
                              <span>AI Vision Protection Report:</span>
                            </span>
                            <span className="text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded">
                              Complete Content Intact
                            </span>
                          </div>
                          <p className="text-indigo-900/90 leading-relaxed">
                            <strong>Identified Elements:</strong> &ldquo;{advertisement.bannerInfo.aiAnalysis.detectedText}&rdquo;
                            {advertisement.bannerInfo.aiAnalysis.keyElements?.length > 0 && ` · ${advertisement.bannerInfo.aiAnalysis.keyElements.join(', ')}`}
                          </p>
                          <p className="text-indigo-800 text-[10px] leading-relaxed">
                            {advertisement.bannerInfo.aiAnalysis.explanation || 'Background extension applied to eliminate text cropping.'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span>Standard banner asset attached to submission</span>
                      <span className="font-semibold text-slate-700">1200 × 675 px standard format</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-slate-400" />
                    <span>No custom banner uploaded. Default dynamic category theme will be displayed.</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">System Theme</span>
                </div>
              )}

              {/* Highlight Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-lg">
                    {advertisement.valueType === 'PERCENTAGE'
                      ? `${advertisement.value}% OFF`
                      : `₹${advertisement.value} OFF`}
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md">
                    {advertisement.categoryName}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {advertisement.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {advertisement.description}
                </p>
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                  <span>Merchant: <strong className="text-slate-800">{advertisement.providerName}</strong></span>
                  {advertisement.promoCode && (
                    <span>Code: <strong className="font-mono text-indigo-700 font-bold">{advertisement.promoCode}</strong></span>
                  )}
                  {advertisement.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-indigo-600" />
                      <span>{advertisement.location.address || advertisement.location.label}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Dates & Scope */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} />
                    Valid From
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {new Date(advertisement.validFrom).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} />
                    Valid Until
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {new Date(advertisement.validUntil).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Terms & Conditions */}
              {advertisement.termsAndConditions?.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-700">Terms & Conditions:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    {advertisement.termsAndConditions.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Existing Rejection Notice if any */}
              {advertisement.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 text-rose-900">
                  <span className="font-bold">Active Rejection Reason:</span>
                  <p className="text-rose-700 leading-relaxed">
                    {advertisement.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Audit History Timeline */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <History size={14} className="text-slate-500" />
              <span>Submission & Approval History</span>
            </h4>
            <div className="space-y-2">
              {advertisement.auditTrail.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span className="uppercase tracking-wider text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {entry.action}
                    </span>
                    <span className="text-slate-400 font-normal">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Performed by: <strong>{entry.performedByName}</strong> ({entry.performedByRole})
                  </div>
                  {entry.notes && (
                    <div className="text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                      &quot;{entry.notes}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Decision Workflow Area (Approve vs Reject) */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            {isRejecting ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <XCircle size={16} className="text-rose-600" />
                  <span>Specify Mandatory Rejection Reason</span>
                </div>
                <p className="text-rose-700 text-[11px]">
                  Provide clear, actionable feedback to the Advertizer explaining why their submission was declined and what changes are required for reapproval.
                </p>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Discount percentage contradicts menu pricing; please attach registered business address and explicit expiration cutoff."
                  className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-700 hover:bg-slate-200/60 font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRejection}
                    disabled={isLoading || !rejectionReason.trim()}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    <span>Confirm & Send Rejection</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Administrative Notes (Optional, recorded in audit trail):
                  </label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="e.g. Verified merchant certificate and street address. Approved."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle size={15} />
                    <span>Reject Submission</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmApproval}
                    disabled={isLoading}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle size={15} />
                    <span>Approve & Publish Live</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
