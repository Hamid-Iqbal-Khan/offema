/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Megaphone,
} from 'lucide-react';
import { AdvertisementNotification } from '../domain/models/Advertisement';

interface AdvertizerNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdvertisementNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectAdForEdit?: (adId: string) => void;
}

export const AdvertizerNotificationsModal: React.FC<AdvertizerNotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectAdForEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="safe-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Advertizer Notifications
              </h2>
              <p className="text-xs text-slate-500">
                Approval and review decisions from administrators
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Check size={12} />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <Bell size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Notifications Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                When you submit advertisements for review, approval and feedback decisions will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all text-xs space-y-2 cursor-pointer ${
                  notif.isRead
                    ? 'bg-slate-50/70 border-slate-200 text-slate-700'
                    : 'bg-white border-indigo-200 ring-1 ring-indigo-500/20 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {notif.type === 'APPROVAL' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={13} />
                        <span>Approved & Published</span>
                      </span>
                    ) : notif.type === 'REJECTION' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        <AlertCircle size={13} />
                        <span>Action Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        <Megaphone size={13} />
                        <span>Submission Update</span>
                      </span>
                    )}
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs">{notif.title}</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {notif.message}
                </p>

                {notif.rejectionReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
                    <span className="font-bold text-[11px]">Admin Rejection Reason:</span>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      {notif.rejectionReason}
                    </p>
                    {onSelectAdForEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onSelectAdForEdit(notif.advertisementId);
                        }}
                        className="mt-1 text-[11px] font-bold text-rose-800 underline hover:text-rose-950 block cursor-pointer"
                      >
                        Edit & Resubmit this Advertisement →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
