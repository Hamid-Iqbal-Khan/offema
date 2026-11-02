/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthUser } from './domain/models/Offer';
import { authService } from './services/auth/FirebaseAuthService';
import { firebaseOfferRepository } from './services/offers/FirebaseOfferRepository';
import { browserGeolocationService } from './services/location/BrowserGeolocationService';
import { LoginPage } from './pages/LoginPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdvertizerDashboard } from './pages/AdvertizerDashboard';
import { DemoInfoModal } from './components/DemoInfoModal';

type AuthStep = 'LOGIN' | 'VERIFY_OTP' | 'AUTHENTICATED';
type AppView = 'DEFAULT' | 'MARKETPLACE' | 'ADVERTIZER_DASHBOARD' | 'ADMIN_DASHBOARD';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>('LOGIN');
  const [activeAppView, setActiveAppView] = useState<AppView>('DEFAULT');

  // Pending OTP credentials
  const [pendingPhone, setPendingPhone] = useState<string>('9876543210');
  const [pendingCountryCode, setPendingCountryCode] = useState<string>('+91');
  const [pendingSessionInfo, setPendingSessionInfo] = useState<string | undefined>();

  // Global Demo Info Modal
  const [isDemoInfoOpen, setIsDemoInfoOpen] = useState(false);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setAuthStep('AUTHENTICATED');
        // Reset active app view to role default on sign in
        setActiveAppView('DEFAULT');
      } else {
        setAuthStep('LOGIN');
        setActiveAppView('DEFAULT');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOtpSent = (phone: string, countryCode: string, sessionInfo?: string) => {
    setPendingPhone(phone);
    setPendingCountryCode(countryCode);
    setPendingSessionInfo(sessionInfo);
    setAuthStep('VERIFY_OTP');
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthStep('AUTHENTICATED');
    setActiveAppView('DEFAULT');
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setAuthStep('LOGIN');
    setActiveAppView('DEFAULT');
  };

  /**
   * Seamless role switching between User and Advertizer without data loss.
   */
  const handleSwitchRole = async (targetRole: 'USER' | 'ADVERTIZER') => {
    const updatedUser = await authService.switchRole(targetRole);
    setCurrentUser(updatedUser);
    if (targetRole === 'ADVERTIZER') {
      setActiveAppView('ADVERTIZER_DASHBOARD');
    } else {
      setActiveAppView('MARKETPLACE');
    }
  };

  const renderContent = () => {
    // Screen routing based on auth lifecycle
    if (authStep === 'LOGIN') {
      return (
        <LoginPage
          authService={authService}
          onOtpSent={handleOtpSent}
          onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
        />
      );
    }

    if (authStep === 'VERIFY_OTP') {
      return (
        <VerifyOtpPage
          authService={authService}
          phoneNumber={pendingPhone}
          countryCode={pendingCountryCode}
          sessionInfo={pendingSessionInfo}
          onBackToLogin={() => setAuthStep('LOGIN')}
          onSuccess={handleAuthSuccess}
          onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
        />
      );
    }

    // --- Authenticated Routing by Backend-Verified Role ---

    // 1. ADMIN ROLE (Redirected directly to Admin Dashboard per requirement 2.3 & 2.4)
    if (currentUser?.role === 'ADMIN') {
      if (activeAppView === 'MARKETPLACE') {
        return (
          <HomePage
            user={currentUser}
            onLogout={handleLogout}
            offerRepository={firebaseOfferRepository}
            locationService={browserGeolocationService}
            onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
            isDemoInfoOpen={isDemoInfoOpen}
            onCloseDemoInfo={() => setIsDemoInfoOpen(false)}
            onOpenAdminDashboard={() => setActiveAppView('ADMIN_DASHBOARD')}
          />
        );
      }

      return (
        <AdminDashboard
          adminUser={currentUser}
          onLogout={handleLogout}
          onViewMarketplace={() => setActiveAppView('MARKETPLACE')}
          onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
        />
      );
    }

    // 2. ADVERTIZER ROLE
    if (currentUser?.role === 'ADVERTIZER') {
      if (activeAppView === 'MARKETPLACE') {
        return (
          <HomePage
            user={currentUser}
            onLogout={handleLogout}
            offerRepository={firebaseOfferRepository}
            locationService={browserGeolocationService}
            onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
            isDemoInfoOpen={isDemoInfoOpen}
            onCloseDemoInfo={() => setIsDemoInfoOpen(false)}
            onSwitchRole={handleSwitchRole}
            onOpenAdvertizerDashboard={() => setActiveAppView('ADVERTIZER_DASHBOARD')}
          />
        );
      }

      return (
        <AdvertizerDashboard
          user={currentUser}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          onViewMarketplace={() => setActiveAppView('MARKETPLACE')}
          onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
        />
      );
    }

    // 3. REGULAR USER (CONSUMER)
    return (
      <HomePage
        user={currentUser}
        onLogout={handleLogout}
        offerRepository={firebaseOfferRepository}
        locationService={browserGeolocationService}
        onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
        isDemoInfoOpen={isDemoInfoOpen}
        onCloseDemoInfo={() => setIsDemoInfoOpen(false)}
        onSwitchRole={handleSwitchRole}
        onOpenAdvertizerDashboard={() => handleSwitchRole('ADVERTIZER')}
      />
    );
  };

  return (
    <>
      {renderContent()}

      {/* Global Demo Information Modal */}
      <DemoInfoModal
        isOpen={isDemoInfoOpen}
        onClose={() => setIsDemoInfoOpen(false)}
      />
    </>
  );
}
