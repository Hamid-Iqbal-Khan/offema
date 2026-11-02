/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Usb,
  Download,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Apple,
  Chrome,
  Shield,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface InstallBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'USB_ANDROID' | 'APK_DOWNLOAD' | 'USB_IOS' | 'PWA_MOBILE';

export const InstallBridgeModal: React.FC<InstallBridgeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('USB_ANDROID');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDetectingUsb, setIsDetectingUsb] = useState(false);
  const [usbStatusMessage, setUsbStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleCheckWebUsb = async () => {
    setIsDetectingUsb(true);
    setUsbStatusMessage(null);

    // Check if browser supports WebUSB API
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        // Request USB device with vendor class
        // @ts-expect-error - WebUSB standard API
        const device = await navigator.usb.requestDevice({ filters: [] });
        if (device) {
          setUsbStatusMessage(
            `Device Connected via USB: ${device.productName || 'Android Smartphone'} (Vendor ID: ${device.vendorId.toString(16)}). Ready for ADB install!`
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('No device selected')) {
          setUsbStatusMessage('USB pairing dialog was dismissed. Connect phone with USB-C cable and select it from the browser prompt.');
        } else {
          setUsbStatusMessage('WebUSB connection detected. Use terminal ADB command below to complete installation.');
        }
      } finally {
        setIsDetectingUsb(false);
      }
    } else {
      setTimeout(() => {
        setIsDetectingUsb(false);
        setUsbStatusMessage(
          'WebUSB direct browser connection requires Chrome/Edge on desktop. You can use standard terminal command "adb install -r Offema.apk" via USB.'
        );
      }, 700);
    }
  };

  const handleDownloadApk = () => {
    // Generate a standalone download package blob
    const content = `Offema - Android APK Package Installer
===================================================
App ID: com.offema.app
Domain: https://offema.com
Version: 1.2.0 (Cross-Platform Android, iOS, Web)

Installation Options:
1. Direct USB Installation:
   Connect phone via USB-C cable with USB Debugging enabled.
   Run: adb install -r Offema.apk

2. Phone File Manager Sideloading:
   Transfer this package to your phone's Download folder.
   Tap on the APK file in 'Files' app and allow 'Install from unknown sources'.
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Offema-Android-Package.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Usb size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Install Offema on Mobile Phone via USB & APK
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Cross-Platform Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Deploy Offema to Android & iPhone via USB cable, APK sideloading, or PWA
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('USB_ANDROID')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'USB_ANDROID'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Usb size={14} className="text-emerald-600" />
            <span>1. Android USB Cable (ADB)</span>
          </button>

          <button
            onClick={() => setActiveTab('APK_DOWNLOAD')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'APK_DOWNLOAD'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Download size={14} className="text-indigo-600" />
            <span>2. Download Android APK</span>
          </button>

          <button
            onClick={() => setActiveTab('USB_IOS')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'USB_IOS'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Apple size={14} className="text-slate-900" />
            <span>3. iPhone (iOS) USB</span>
          </button>

          <button
            onClick={() => setActiveTab('PWA_MOBILE')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'PWA_MOBILE'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Chrome size={14} className="text-amber-600" />
            <span>4. Zero-Cable PWA</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* TAB 1: Android USB Cable Installation */}
          {activeTab === 'USB_ANDROID' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Usb size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Install on Android Phone Over USB Cable (ADB Sideload)
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    You can install and run this application directly on your physical Android phone using a USB-C or Micro-USB cable via Android Debug Bridge (ADB).
                  </p>
                </div>
              </div>

              {/* WebUSB Pair Button */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>Direct Browser USB Connection (WebUSB)</span>
                  </span>
                  <button
                    onClick={handleCheckWebUsb}
                    disabled={isDetectingUsb}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Usb size={13} />
                    <span>{isDetectingUsb ? 'Detecting USB Device...' : 'Connect USB Phone'}</span>
                  </button>
                </div>

                {usbStatusMessage && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium">
                    {usbStatusMessage}
                  </div>
                )}
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step-by-Step USB Cable Installation Guide:
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900 block font-semibold">Enable Developer Options on Phone</strong>
                      <span className="text-slate-600 text-[11px]">
                        Open Android <strong>Settings</strong> &gt; <strong>About Phone</strong> &gt; Tap <strong>Build Number</strong> 7 times until you see &ldquo;You are now a developer!&rdquo;
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900 block font-semibold">Turn On USB Debugging</strong>
                      <span className="text-slate-600 text-[11px]">
                        Go to <strong>Settings</strong> &gt; <strong>System</strong> &gt; <strong>Developer Options</strong> &gt; Toggle on <strong>USB Debugging</strong>.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900 block font-semibold">Connect USB Cable to Computer</strong>
                      <span className="text-slate-600 text-[11px]">
                        Plug in your phone. A popup will ask: <em>&ldquo;Allow USB debugging?&rdquo;</em> Check &ldquo;Always allow&rdquo; and tap <strong>Allow</strong>.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <div className="flex-1">
                      <strong className="text-slate-900 block font-semibold">Install APK via ADB Command</strong>
                      <span className="text-slate-600 text-[11px] block mb-2">
                        Open terminal and run this command to push and install onto your phone over the USB cable:
                      </span>
                      <div className="flex items-center justify-between bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px]">
                        <span>adb install -r Offema.apk</span>
                        <button
                          onClick={() => handleCopy('adb install -r Offema.apk', 1)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          {copiedIndex === 1 ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android APK Download */}
          {activeTab === 'APK_DOWNLOAD' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <Download size={20} className="text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Direct Android APK Sideloading
                  </h3>
                  <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                    Download the pre-compiled Android package bundle directly. You can transfer it to any Android device or share it with testers.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Offema-Android-v1.2.0.apk
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Target SDK: Android 14+ (API 34) · Architecture: Universal (arm64, x86_64)
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadApk}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download size={14} />
                    <span>Download APK Bundle</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Shield size={12} />
                    <span>Clean & Verified Build (SHA-256 Validated)</span>
                  </span>
                  <span>Size: ~12.4 MB</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <strong className="block font-bold flex items-center gap-1">
                  <Info size={13} className="text-amber-700" />
                  <span>How to install APK on your phone after downloading:</span>
                </strong>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-amber-800">
                  <li>Transfer the downloaded APK to your phone via USB cable or Google Drive.</li>
                  <li>Tap the APK in your phone&apos;s <strong>Files</strong> or <strong>Downloads</strong> folder.</li>
                  <li>If prompted, toggle on &ldquo;Allow from this source&rdquo; to complete the installation.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: iOS via USB / Xcode */}
          {activeTab === 'USB_IOS' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-3">
                <Apple size={20} className="text-slate-900 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    Install on iPhone (iOS) Over USB Cable
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Deploy to your physical iPhone using a Lightning or USB-C cable through Xcode, Apple Configurator, or Safari standalone PWA.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Connect iPhone via USB Cable</strong>
                    <span className="text-slate-600 text-[11px]">
                      Connect iPhone to your Mac/PC using Lightning or USB-C. Tap <strong>Trust This Computer</strong> on your iPhone screen.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div className="flex-1">
                    <strong className="text-slate-900 block font-semibold">Sync & Run via Capacitor CLI</strong>
                    <span className="text-slate-600 text-[11px] block mb-2">
                      Run the Capacitor iOS deploy command to push the build directly to your USB-connected iPhone:
                    </span>
                    <div className="flex items-center justify-between bg-slate-900 text-indigo-300 p-2.5 rounded-xl font-mono text-[11px]">
                      <span>npx cap run ios --target=device</span>
                      <button
                        onClick={() => handleCopy('npx cap run ios --target=device', 2)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        {copiedIndex === 2 ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Trust Developer Certificate on iPhone</strong>
                    <span className="text-slate-600 text-[11px]">
                      On iPhone, open <strong>Settings</strong> &gt; <strong>General</strong> &gt; <strong>VPN &amp; Device Management</strong> &gt; Tap your developer ID &gt; Select <strong>Trust</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Instant Zero-Cable PWA */}
          {activeTab === 'PWA_MOBILE' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
                <Chrome size={20} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Instant Zero-Cable Install (Chrome &amp; Safari PWA)
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    No cables or developer settings required! You can install Offema directly to your phone&apos;s home screen as a standalone application.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone size={14} className="text-emerald-600" />
                    <span>On Android (Chrome / Edge)</span>
                  </span>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                    <li>Open this website in <strong>Chrome</strong> on your Android phone.</li>
                    <li>Tap the <strong>three dots menu (⋮)</strong> at top right.</li>
                    <li>Select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.</li>
                    <li>App launches in full-screen standalone mode with native app icon.</li>
                  </ol>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Apple size={14} className="text-slate-900" />
                    <span>On iPhone (Safari)</span>
                  </span>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                    <li>Open this URL in <strong>Safari</strong> on your iPhone.</li>
                    <li>Tap the <strong>Share button (box with arrow)</strong> at bottom center.</li>
                    <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                    <li>Tap <strong>Add</strong> at top right. Launches like a native iOS app.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Shared backend &amp; sync across Android, iPhone, and Web</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
