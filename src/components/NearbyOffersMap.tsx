/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { OfferWithDistance } from '../domain/models/Offer';
import { LocationResult } from '../services/location/LocationService';
import { Compass, Locate, Maximize2, Minimize2, Navigation, Layers } from 'lucide-react';

interface NearbyOffersMapProps {
  offers: OfferWithDistance[];
  userLocation: LocationResult | null;
  onSelectOffer: (offer: OfferWithDistance) => void;
  radiusKm?: number;
  className?: string;
}

export const NearbyOffersMap: React.FC<NearbyOffersMapProps> = ({
  offers,
  userLocation,
  onSelectOffer,
  radiusKm = 5,
  className = 'h-[460px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  // Filter only local offers with valid coordinates
  const mappedOffers = offers.filter(
    (o) =>
      o.scope === 'LOCAL' &&
      o.location &&
      typeof o.location.latitude === 'number' &&
      typeof o.location.longitude === 'number'
  );

  // Center coordinate determination
  const defaultCenter: [number, number] = userLocation?.coordinates
    ? [userLocation.coordinates.latitude, userLocation.coordinates.longitude]
    : mappedOffers.length > 0
    ? [mappedOffers[0].location!.latitude, mappedOffers[0].location!.longitude]
    : [17.4156, 78.435]; // Banjara Hills, Hyderabad default

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Voyager tiles - clean, modern, high-contrast street map
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Recalculate size when expanding
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isExpanded]);

  // Update User Marker & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation?.coordinates) {
      const { latitude, longitude } = userLocation.coordinates;
      const userLatLng: [number, number] = [latitude, longitude];

      // Remove existing user layers if any
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }
      if (radiusCircleRef.current) {
        map.removeLayer(radiusCircleRef.current);
      }

      // 5 km Discovery Radius Circle
      const circle = L.circle(userLatLng, {
        radius: radiusKm * 1000,
        color: '#4f46e5',
        weight: 1.5,
        dashArray: '5, 8',
        fillColor: '#6366f1',
        fillOpacity: 0.07,
      }).addTo(map);
      radiusCircleRef.current = circle;

      // User location pulsing marker
      const userMarker = L.circleMarker(userLatLng, {
        radius: 8,
        color: '#ffffff',
        weight: 3,
        fillColor: '#4f46e5',
        fillOpacity: 1,
      }).addTo(map);
      userMarker.bindTooltip('Your Location', {
        permanent: false,
        direction: 'top',
        className: 'font-semibold text-xs',
      });
      userMarkerRef.current = userMarker;
    }
  }, [userLocation, radiusKm]);

  // Render Offer Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    mappedOffers.forEach((offer) => {
      const lat = offer.location!.latitude;
      const lng = offer.location!.longitude;

      const formattedVal =
        offer.valueType === 'PERCENTAGE'
          ? `${offer.value}% OFF`
          : `${offer.currency === 'INR' ? '₹' : ''}${offer.value} OFF`;

      // Theme color by category
      let badgeBg = 'bg-indigo-600';
      if (offer.categoryId === 'food-dining') badgeBg = 'bg-amber-600';
      if (offer.categoryId === 'grocery') badgeBg = 'bg-emerald-600';
      if (offer.categoryId === 'fashion') badgeBg = 'bg-purple-600';
      if (offer.categoryId === 'electronics') badgeBg = 'bg-slate-800';
      if (offer.categoryId === 'beauty-wellness') badgeBg = 'bg-rose-600';
      if (offer.categoryId === 'health-fitness') badgeBg = 'bg-teal-600';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative group cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110">
            <div class="${badgeBg} text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white whitespace-nowrap tabular-nums">
              <span>${formattedVal}</span>
            </div>
            <div class="w-2.5 h-2.5 ${badgeBg} transform rotate-45 mx-auto -mt-1.5 border-r border-b border-white"></div>
          </div>
        `,
        iconSize: [60, 36],
        iconAnchor: [30, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersGroup);

      const safeTitle = offer.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const safeProvider = offer.providerName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const safeDist = (offer.formattedDistance || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

      // Popup Content Card
      const bannerImg = offer.bannerImageUrl || (offer.imageUrls && offer.imageUrls.length > 0 ? offer.imageUrls[0] : null);
      const bannerHtml = bannerImg
        ? `<div class="w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-900 mb-1.5 border border-slate-200"><img src="${bannerImg}" alt="" class="w-full h-full object-cover" /></div>`
        : '';

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 w-64 space-y-2 text-slate-800 font-sans';
      popupDiv.innerHTML = `
        ${bannerHtml}
        <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span class="truncate max-w-[150px] font-bold text-slate-900">${safeProvider}</span>
          <span>${safeDist}</span>
        </div>
        <h4 class="text-xs font-bold text-slate-900 leading-snug">${safeTitle}</h4>
        <div class="flex items-center justify-between pt-1 border-t border-slate-100">
          <span class="text-xs font-extrabold text-indigo-700">${formattedVal}</span>
          <button id="view-offer-${offer.id}" class="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-md transition-colors cursor-pointer">
            View Deal →
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv, { maxWidth: 280, closeButton: false });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-offer-${offer.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelectOffer(offer);
          };
        }
      });
    });
  }, [mappedOffers, onSelectOffer]);

  // Center on user location action
  const handleCenterUser = () => {
    if (mapInstanceRef.current && userLocation?.coordinates) {
      mapInstanceRef.current.flyTo(
        [userLocation.coordinates.latitude, userLocation.coordinates.longitude],
        14,
        { duration: 1 }
      );
    }
  };

  // Fit all markers in view
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    const points: [number, number][] = mappedOffers.map((o) => [
      o.location!.latitude,
      o.location!.longitude,
    ]);

    if (userLocation?.coordinates) {
      points.push([userLocation.coordinates.latitude, userLocation.coordinates.longitude]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 transition-all ${
        isExpanded ? 'h-[620px]' : className
      }`}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Top Header on Map */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Navigation size={13} className="text-indigo-600" />
          <span>
            {mappedOffers.length} {mappedOffers.length === 1 ? 'store' : 'stores'} on map
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 font-normal">{radiusKm} km radius</span>
        </div>
      </div>

      {/* Map Control Buttons (Center, Fit Bounds, Fullscreen toggle) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
        {userLocation && (
          <button
            type="button"
            onClick={handleCenterUser}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-xs flex items-center justify-center transition-all cursor-pointer"
            title="Center on my location"
          >
            <Locate size={15} />
          </button>
        )}

        <button
          type="button"
          onClick={handleFitBounds}
          className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-xs flex items-center justify-center transition-all cursor-pointer"
          title="Fit all offer pins in view"
        >
          <Compass size={15} />
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-xs flex items-center justify-center transition-all cursor-pointer"
          title={isExpanded ? 'Collapse map' : 'Expand map'}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-auto">
        <span className="text-[11px] font-medium bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg">
          Click any marker to preview deal & directions
        </span>
      </div>
    </div>
  );
};
