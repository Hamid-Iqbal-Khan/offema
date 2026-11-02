/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
} from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../domain/models/User';
import { userService } from '../services/users/UserService';
import { AuthUser } from '../domain/models/Offer';

interface UserCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserProfile | null;
  adminUser: AuthUser;
  onSaved: () => void;
}

export const UserCrudModal: React.FC<UserCrudModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  adminUser,
  onSaved,
}) => {
  const isEditing = Boolean(userToEdit);

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setDisplayName(userToEdit.displayName);
      setPhoneNumber(userToEdit.phoneNumber);
      setCountryCode(userToEdit.countryCode || '+91');
      setEmail(userToEdit.email || '');
      setRole(userToEdit.role);
      setStatus(userToEdit.status);
    } else {
      setDisplayName('');
      setPhoneNumber('');
      setCountryCode('+91');
      setEmail('');
      setRole('USER');
      setStatus('ACTIVE');
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 8 || cleanedPhone.length > 15) {
      setError('Please enter a valid mobile number (8 to 15 digits).');
      return;
    }

    if (email.trim() && !userService.isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && userToEdit) {
        await userService.updateUser(
          userToEdit.id,
          {
            displayName: displayName.trim(),
            phoneNumber: cleanedPhone,
            countryCode,
            email: email.trim() || undefined,
            role,
            status,
          },
          adminUser
        );
      } else {
        await userService.createUser({
          phoneNumber: cleanedPhone,
          countryCode,
          email: email.trim() || undefined,
          displayName: displayName.trim() || undefined,
          role,
        });
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <UserIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit User Account' : 'Register New User'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing ? `Account ID: ${userToEdit?.id}` : 'Create consumer, merchant, or admin profile'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name / Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Priya Verma"
              required
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="+91"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number (Unique) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 pl-8"
                />
                <Phone size={13} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Optional, Unique)
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 pl-8"
              />
              <Mail size={13} className="absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 cursor-pointer"
              >
                <option value="USER">USER (Consumer)</option>
                <option value="ADVERTIZER">ADVERTIZER (Vendor)</option>
                <option value="ADMIN">ADMIN (Full Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="DEACTIVATED">DEACTIVATED</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
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
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update User Profile' : 'Register User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
