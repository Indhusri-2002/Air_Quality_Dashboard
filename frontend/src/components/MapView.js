import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Load Leaflet CSS only on client
if (typeof window !== "undefined") {
  require("leaflet/dist/leaflet.css");
}

// Fix default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to handle map centering when coordinates change
function MapController({ coords }) {
  const map = useMap();
  
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lon], 12, {
        animate: true,
        duration: 1.5
      });
    }
  }, [coords, map]);

  return null;
}

function LocationMarker({ coords, setCoords }) {
  useMapEvents({
    click(e) {
      setCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });

  if (!coords) return null;

  return (
    <Marker position={[coords.lat, coords.lon]}>
      <Popup>
        📍 <strong>Selected Location</strong><br/>
        Lat: {coords.lat.toFixed(4)}<br/>
        Lon: {coords.lon.toFixed(4)}
      </Popup>
    </Marker>
  );
}

export default function MapView({ coords, setCoords }) {
  // Prevent SSR mismatch
  useEffect(() => {}, []);

  if (!coords) return null;

  return (
    <MapContainer
      center={[coords.lat, coords.lon]}
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
      />
      <MapController coords={coords} />
      <LocationMarker coords={coords} setCoords={setCoords} />
    </MapContainer>
  );
}
