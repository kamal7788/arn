'use client';

import { useEffect, useRef } from 'react';

interface AgencyMapProps {
  placeId?: string;
  address?: string;
}

export default function AgencyMap({ placeId, address }: AgencyMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!ref.current || !apiKey || !placeId) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      const google = (window as unknown as { google: any }).google;
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );
      service.getDetails({ placeId, fields: ['geometry', 'name'] }, (place: any, status: string) => {
        if (status !== 'OK' || !place.geometry) return;
        const map = new google.maps.Map(ref.current, {
          center: place.geometry.location,
          zoom: 15,
        });
        new google.maps.Marker({ position: place.geometry.location, map, title: place.name });
      });
    };
    document.head.appendChild(script);
  }, [apiKey, placeId]);

  if (!placeId) {
    return <div className="agency-map-empty">No map location set{address ? `: ${address}` : ''}</div>;
  }

  return <div ref={ref} className="agency-map" aria-label="Agency location map" />;
}
