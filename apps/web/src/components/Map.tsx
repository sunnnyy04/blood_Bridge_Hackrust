import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const donorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  hospitalCoords: [number, number];
  donors: Array<{
    id: string;
    latitude: string;
    longitude: string;
    name?: string;
    bloodType: string;
    phone: string;
  }>;
  searchRadius: number;
}

function ChangeView({ center, radius }: { center: [number, number]; radius: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, radius > 20 ? 10 : radius > 10 ? 11 : 13);
  }, [center, radius, map]);
  return null;
}

export default function BloodMap({ hospitalCoords, donors, searchRadius }: MapProps) {
  useEffect(() => {
    console.log("Map rendering with donors:", donors.length);
    if (donors.length > 0) {
      console.log("Donors detected in Map component:", donors.map(d => ({ name: d.name, lat: d.latitude, lng: d.longitude })));
    }
  }, [donors]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={hospitalCoords}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <ChangeView center={hospitalCoords} radius={searchRadius} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={hospitalCoords} icon={hospitalIcon}>
          <Popup>
            <div className="font-semibold text-blue-600">Your Hospital</div>
          </Popup>
        </Marker>

        <Circle
          center={hospitalCoords}
          radius={searchRadius * 1000}
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
        />

        {donors.map((donor) => {
          const lat = parseFloat(donor.latitude);
          const lng = parseFloat(donor.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.error("Invalid donor coordinates:", donor);
            return null;
          }

          return (
            <React.Fragment key={donor.id}>
              <CircleMarker
                center={[lat, lng]}
                radius={8}
                pathOptions={{ color: 'white', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-red-600">{donor.bloodType}</p>
                    <p className="font-medium">{donor.name || 'Anonymous Donor'}</p>
                    <p className="text-xs text-gray-500">{donor.phone}</p>
                  </div>
                </Popup>
              </CircleMarker>

              <Marker
                position={[lat, lng]}
                icon={donorIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-red-600">{donor.bloodType}</p>
                    <p className="font-medium">{donor.name || 'Anonymous Donor'}</p>
                    <p className="text-xs text-gray-500">{donor.phone}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
