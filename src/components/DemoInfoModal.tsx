/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Database,
  MapPin,
  ShieldCheck,
  Megaphone,
  ArrowRightLeft,
} from 'lucide-react';

interface DemoInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoInfoModal: React.FC<DemoInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className="relative bg-white w-full max-w-xl rounded-3xl shadow-xl overflow-hidden p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Architecture, Roles & Evaluation Guide
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
            {/* 1. Quick Test Role Credentials */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <KeyRound size={15} />
                <span>3-Role RBAC & Evaluation Test Accounts (OTP: 123456)</span>
              </div>
              <p className="text-xs text-indigo-900/90 leading-relaxed">
                Test each distinct persona with fixed demo OTP <strong className="font-mono">123456</strong>:
              </p>
              <div className="space-y-1.5 font-mono text-xs text-indigo-950 bg-white/80 p-3 rounded-xl border border-indigo-200">
                <div className="flex items-center justify-between">
                  <span>• <strong>User (Buyer):</strong> 9876543210</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">User Feed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Advertizer:</strong> 9811122233</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Campaign Hub</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Authorized Admin:</strong> 9999999999</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Admin Dashboard</span>
                </div>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                * Note: Admin is <strong>never</strong> a selectable dropdown option on login. Admin credentials are authenticated and verified against the backend trusted registry.
              </p>
            </div>

            {/* 2. Advertisement Submission & Approval Workflow */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Megaphone size={15} className="text-amber-700" />
                <span>Ad Submission & Approval Workflow</span>
              </div>
              <ul className="text-xs text-amber-950/90 space-y-1.5 leading-relaxed list-disc list-inside">
                <li>
                  <strong>Submission:</strong> Advertizers submit discounts and sales. Initial status is strictly <code>PENDING_APPROVAL</code>.
                </li>
                <li>
                  <strong>Admin Review:</strong> Admins review business details, GPS coordinates, validity dates, and content. Admins can make corrections or approve/reject.
                </li>
                <li>
                  <strong>Mandatory Rejection Reason:</strong> Rejecting an ad requires a detailed reason, notifying the advertizer with 1-click revision.
                </li>
                <li>
                  <strong>Automatic Publishing:</strong> Once approved, the ad is automatically published to active marketplace feeds. Pending and rejected ads are never visible to regular users.
                </li>
                <li>
                  <strong>Reapproval Workflow:</strong> Editing an approved or rejected ad automatically marks it <code>PENDING_APPROVAL</code> for admin reapproval.
                </li>
              </ul>
            </div>

            {/* 3. Role Switching */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <ArrowRightLeft size={15} className="text-indigo-600" />
                <span>Seamless User ↔ Advertizer Role Switching</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Users and Advertizers can switch roles anytime directly from their profile menu without creating separate accounts or losing bookmarks, campaign submissions, or history. Role switching is restricted to User and Advertizer roles and never grants administrative privileges.
              </p>
            </div>

            {/* 4. Geography & Distance Calculation */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <MapPin size={15} className="text-indigo-600" />
                <span>Interactive Map & Haversine Distance</span>
              </div>
              <p className="text-xs text-slate-600">
                • Distances are calculated mathematically using the <strong>Haversine formula</strong>.
              </p>
              <p className="text-xs text-slate-600">
                • Interactive Leaflet map powered by OpenStreetMap & CartoDB Voyager (Google Maps-Free).
              </p>
            </div>

            {/* 5. Production Integration Checklist */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Database size={15} />
                <span>Production Firebase Environment</span>
              </div>
              <p className="text-xs text-slate-300">
                In production, Firebase Phone Auth and Firestore store user claims, audit records, and ads:
              </p>
              <pre className="text-[11px] font-mono bg-black/40 p-2.5 rounded-xl text-amber-200 overflow-x-auto">
{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id`}
              </pre>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
