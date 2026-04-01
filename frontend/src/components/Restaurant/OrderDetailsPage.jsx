import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { cancelOrder, getOrderById } from "../../features/user/foodOrderSlice";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Custom SVG Marker Icons ────────────────────────────────────────────────

const userMarkerIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:48px;height:48px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:radial-gradient(circle at 35% 35%, #60a5fa, #2563eb);
        box-shadow:0 0 0 4px rgba(37,99,235,0.25), 0 4px 16px rgba(37,99,235,0.5);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='white'>
          <path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/>
        </svg>
      </div>
      <div style="
        position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
        width:10px;height:10px;background:#2563eb;
        clip-path:polygon(50% 100%, 0 0, 100% 0);
      "></div>
    </div>
  `,
  iconSize: [48, 54],
  iconAnchor: [24, 54],
  popupAnchor: [0, -54],
});

const deliveryMarkerIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:52px;height:52px;animation:pulse-marker 2s ease-in-out infinite;">
      <style>
        @keyframes pulse-marker {
          0%,100%{transform:scale(1);}
          50%{transform:scale(1.08);}
        }
        @keyframes ring-pulse {
          0%{transform:scale(1);opacity:0.7;}
          100%{transform:scale(2.2);opacity:0;}
        }
      </style>
      <div style="
        position:absolute;inset:4px;border-radius:50%;
        background:radial-gradient(circle at 35% 35%, #f97316, #dc2626);
        box-shadow:0 0 0 3px rgba(220,38,38,0.3), 0 4px 20px rgba(220,38,38,0.5);
        display:flex;align-items:center;justify-content:center;z-index:2;
      ">
        <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='white'>
          <path d='M17.5 8C15.6 8 14 9.6 14 11.5c0 2.5 3.5 6.5 3.5 6.5s3.5-4 3.5-6.5C21 9.6 19.4 8 17.5 8zm0 4.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM5 6h9v2H5zm-2 4h2v7H3zm3 0h6v2H6zm0 3h6v2H6z'/>
        </svg>
      </div>
      <div style="
        position:absolute;inset:0;border-radius:50%;
        border:2px solid rgba(220,38,38,0.5);
        animation:ring-pulse 1.8s ease-out infinite;
      "></div>
    </div>
  `,
  iconSize: [52, 52],
  iconAnchor: [26, 52],
  popupAnchor: [0, -52],
});

// ─── Map Helpers ─────────────────────────────────────────────────────────────

function FitBounds({ userLocation, deliveryLocation }) {
  const map = useMap();
  useEffect(() => {
    if (!userLocation || !deliveryLocation?.lat || !deliveryLocation?.lng) return;
    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
      [deliveryLocation.lat, deliveryLocation.lng],
    ]);
    map.fitBounds(bounds, { padding: [100, 100] });
  }, [map, userLocation, deliveryLocation]);
  return null;
}

function SmoothMarker({ position, icon, children }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!markerRef.current || !position) return;
    markerRef.current.setLatLng(position);
  }, [position]);

  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      {children}
    </Marker>
  );
}

// ─── Distance & Time Calculation ─────────────────────────────────────────────

function haversineDistance(loc1, loc2) {
  if (!loc1 || !loc2) return null;
  const R = 6371;
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateTime(distanceKm) {
  if (!distanceKm) return null;
  const avgSpeedKmh = 25;
  const minutes = Math.ceil((distanceKm / avgSpeedKmh) * 60);
  return minutes;
}

// ─── Main Component ───────────────────────────────────────────────────────────

function OrderDetailsPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { currentOrder, loading } = useSelector((state) => state.foodOrder);
  // console.log(currentOrder);

  useEffect(() => {
    if (!orderId) return;
    dispatch(getOrderById(orderId));
    const interval = setInterval(() => {
      dispatch(getOrderById(orderId));
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch, orderId]);

  const deliveryLocation = useMemo(() => {
    const coordinates = currentOrder?.deliveryBoy?.location?.coordinates;
    if (!coordinates || coordinates.length < 2) return { lat: null, lng: null };
    return { lng: coordinates[0], lat: coordinates[1] };
  }, [currentOrder]);

  // Track route history
  useEffect(() => {
    if (!deliveryLocation.lat || !deliveryLocation.lng) return;
    setRoutePoints((prev) => {
      const newPoint = [deliveryLocation.lat, deliveryLocation.lng];
      if (prev.length === 0) return [newPoint];
      const last = prev[prev.length - 1];
      if (last[0] === newPoint[0] && last[1] === newPoint[1]) return prev;
      return [...prev.slice(-20), newPoint]; // keep last 20 points
    });
  }, [deliveryLocation.lat, deliveryLocation.lng]);

  useEffect(() => {
    if (!deliveryLocation.lat || !deliveryLocation.lng) return;
    const fetchAddress = async () => {
      try {
        setLocationLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${deliveryLocation.lat}&lon=${deliveryLocation.lng}`
        );
        const data = await response.json();
        setDeliveryAddress(data?.display_name || "Current location available");
      } catch {
        setDeliveryAddress("Location updating...");
      } finally {
        setLocationLoading(false);
      }
    };
    fetchAddress();
  }, [deliveryLocation.lat, deliveryLocation.lng]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => console.log("User location error:", error)
    );
  }, []);

  const distance = useMemo(
    () => haversineDistance(userLocation, deliveryLocation.lat ? deliveryLocation : null),
    [userLocation, deliveryLocation]
  );
  const eta = useMemo(() => estimateTime(distance), [distance]);

  const handleCancelOrder = async () => {
    try {
      await dispatch(cancelOrder({ orderId: currentOrder._id, reason: cancelReason || "Cancelled by user" })).unwrap();
      setShowCancelModal(false);
      setCancelReason("");
      dispatch(getOrderById(currentOrder._id));
    } catch (error) {
      console.log(error);
    }
  };

  const statusSteps = [
    { key: "pending", label: "Placed", icon: "📋" },
    { key: "confirmed", label: "Confirmed", icon: "✅" },
    { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
    { key: "assigned", label: "Assigned", icon: "🛵" },
    { key: "out_for_delivery", label: "On the Way", icon: "🚀" },
    { key: "delivered", label: "Delivered", icon: "🎉" },
  ];

  const statusOrder = ["pending", "confirmed", "preparing", "assigned", "accepted_by_delivery_boy", "out_for_delivery", "delivered"];
  const currentStatusIndex = statusOrder.indexOf(currentOrder?.status);

  const getStepState = (stepKey) => {
    const stepIndex = statusOrder.indexOf(stepKey);
    if (stepIndex === -1) return "pending";
    if (stepIndex < currentStatusIndex) return "done";
    if (stepIndex === currentStatusIndex) return "active";
    return "pending";
  };

  if (loading && !currentOrder)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-medium">Loading your order...</p>
        </div>
      </div>
    );

  if (!currentOrder)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <p className="text-gray-400 text-lg">Order not found</p>
      </div>
    );

  const isActiveDelivery = ["assigned", "accepted_by_delivery_boy", "out_for_delivery"].includes(currentOrder.status);
  const hasDeliveryBoy = currentOrder.deliveryBoy && ["assigned", "accepted_by_delivery_boy", "out_for_delivery", "delivered"].includes(currentOrder.status);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        .od-root {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'DM Sans', sans-serif;
          color: #f0f0f5;
          padding: 24px 16px 80px;
        }

        .od-container { max-width: 780px; margin: 0 auto; }

        .od-card {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }

        .od-card::before {
          content:'';
          position:absolute;
          top:0;left:0;right:0;
          height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
        }

        .od-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .od-section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: -0.2px;
          color: #f0f0f5;
          margin-bottom: 16px;
        }

        /* ── Status Badge ── */
        .status-badge {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          text-transform: capitalize;
        }
        .status-badge.delivered { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
        .status-badge.cancelled { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
        .status-badge.active { background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.25); animation: badge-pulse 2s ease-in-out infinite; }

        @keyframes badge-pulse { 0%,100%{opacity:1;} 50%{opacity:0.7;} }

        /* ── Progress Steps ── */
        .steps-row {
          display: flex;
          align-items: flex-start;
          position: relative;
          margin-top: 8px;
        }

        .step-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.4s ease;
          position: relative;
        }

        .step-circle.done {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 0 16px rgba(34,197,94,0.4);
        }

        .step-circle.active {
          background: linear-gradient(135deg, #f97316, #ea580c);
          box-shadow: 0 0 20px rgba(249,115,22,0.5);
          animation: step-pulse 1.5s ease-in-out infinite;
        }

        .step-circle.pending {
          background: #1e1e2a;
          border: 1px solid rgba(255,255,255,0.08);
        }

        @keyframes step-pulse {
          0%,100%{box-shadow:0 0 20px rgba(249,115,22,0.5);}
          50%{box-shadow:0 0 32px rgba(249,115,22,0.8);}
        }

        .step-label {
          font-size: 10px;
          font-weight: 500;
          margin-top: 8px;
          color: #6b6b80;
          text-align: center;
          transition: color 0.3s;
        }
        .step-label.done, .step-label.active { color: #c0c0d0; }

        .step-connector {
          position: absolute;
          top: 20px;
          left: 50%;
          width: 100%;
          height: 2px;
          z-index: 1;
        }

        .step-connector-fill {
          height: 100%;
          transition: width 0.6s ease;
          background: linear-gradient(90deg, #22c55e, #16a34a);
        }

        /* ── ETA Bar ── */
        .eta-bar {
          background: linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.08));
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 16px;
        }

        .eta-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .eta-value {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #fb923c;
          line-height: 1;
        }

        .eta-label {
          font-size: 11px;
          color: #6b6b80;
          margin-top: 4px;
          font-weight: 500;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .eta-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.08);
        }

        /* ── Delivery Partner ── */
        .partner-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: #1a1a24;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 14px;
        }

        .partner-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ea580c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
          position: relative;
        }

        .online-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #13131a;
        }

        .online-dot.online { background: #4ade80; animation: online-pulse 2s ease-in-out infinite; }
        .online-dot.offline { background: #6b6b80; }
        @keyframes online-pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }

        /* ── Track Button ── */
        .track-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 14px;
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .track-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .track-btn:hover::after { opacity: 1; }
        .track-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(249,115,22,0.4); }
        .track-btn:active { transform: translateY(0); }

        /* ── Items ── */
        .item-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: #1a1a24;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.04);
          margin-bottom: 10px;
          transition: border-color 0.2s;
        }
        .item-row:hover { border-color: rgba(249,115,22,0.2); }

        /* ── Modal Overlay ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-end;
          animation: overlay-in 0.25s ease;
        }

        @keyframes overlay-in { from{opacity:0;} to{opacity:1;} }

        .modal-sheet {
          width: 100%;
          height: 96vh;
          background: #0e0e16;
          border-radius: 24px 24px 0 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: sheet-up 0.35s cubic-bezier(0.34,1.56,0.64,1);
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        @media (min-width: 768px) {
          .modal-overlay { align-items: center; justify-content: center; }
          .modal-sheet { width: 95%; max-width: 1100px; height: 92vh; border-radius: 24px; }
        }

        @keyframes sheet-up { from{transform:translateY(100%);} to{transform:translateY(0);} }

        .modal-header {
          padding: 18px 20px 16px;
          background: #0e0e16;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #9090a8;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.12); color: white; }

        .map-wrapper { flex: 1; position: relative; min-height: 0; }

        .leaflet-container { width: 100%; height: 100%; background: #1a1a2e; }

        /* Dark map tiles filter */
        .leaflet-tile-pane { filter: brightness(0.75) saturate(0.6) hue-rotate(200deg); }

        /* ── Bottom Info Panel ── */
        .bottom-panel {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 680px;
          background: rgba(14,14,22,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 16px 18px;
          z-index: 1000;
        }

        .panel-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .panel-stats {
          display: grid;
          grid-template-columns: 1fr 1px 1fr 1px 1fr;
          gap: 0;
        }

        .stat-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 12px;
        }

        .stat-divider { background: rgba(255,255,255,0.08); }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fb923c;
        }

        .stat-label {
          font-size: 10px;
          color: #6b6b80;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        /* ── Live Pulse Indicator ── */
        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #f87171;
          letter-spacing: 0.3px;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f87171;
          animation: live-blink 1s ease-in-out infinite;
        }

        @keyframes live-blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

        /* ── Cancel Modal ── */
        .cancel-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .cancel-card {
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
          width: 100%;
          max-width: 420px;
        }

        .cancel-textarea {
          width: 100%;
          background: #1a1a24;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #f0f0f5;
          padding: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          resize: none;
          outline: none;
          margin-top: 10px;
          margin-bottom: 18px;
          transition: border-color 0.2s;
        }
        .cancel-textarea:focus { border-color: rgba(249,115,22,0.4); }

        .btn-danger {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 10px;
          transition: all 0.2s;
        }
        .btn-danger:hover { opacity: 0.9; transform: translateY(-1px); }

        .btn-ghost {
          width: 100%;
          padding: 14px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #9090a8;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: #f0f0f5; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div className="od-root">
        <div className="od-container">

          {/* ── Header ── */}
          <div className="od-card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <button
                    onClick={() => navigate(-1)}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "#9090a8", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    ← Back
                  </button>
                </div>
                <h1 className="od-title" style={{ fontSize: 24, margin: 0 }}>Order Details</h1>
                <p style={{ fontSize: 12, color: "#6b6b80", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
                  #{currentOrder._id.slice(-8).toUpperCase()} · {new Date(currentOrder.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <span className={`status-badge ${currentOrder.status === "delivered" ? "delivered" : currentOrder.status === "cancelled" ? "cancelled" : "active"}`}>
                  {currentOrder.status.replaceAll("_", " ")}
                </span>
                {loading && <span style={{ fontSize: 11, color: "#fb923c", fontWeight: 500 }}>● Refreshing</span>}
              </div>
            </div>
          </div>

          {/* ── ETA Bar (active delivery only) ── */}
          {isActiveDelivery && distance && eta && (
            <div className="eta-bar">
              <div className="eta-item">
                <span className="eta-value">{eta}</span>
                <span className="eta-label">Min ETA</span>
              </div>
              <div className="eta-divider" />
              <div className="eta-item">
                <span className="eta-value">{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
                <span className="eta-label">Distance</span>
              </div>
              <div className="eta-divider" />
              <div className="eta-item">
                <span className="live-indicator" style={{ fontSize: 12 }}>
                  <span className="live-dot" />
                  LIVE
                </span>
                <span className="eta-label" style={{ marginTop: 6 }}>Tracking</span>
              </div>
            </div>
          )}

          {/* ── Order Progress ── */}
          <div className="od-card">
            <p className="od-section-title" style={{ marginBottom: 20 }}>Order Progress</p>
            <div className="steps-row">
              {statusSteps.map((step, idx) => {
                const state = getStepState(step.key);
                const isLast = idx === statusSteps.length - 1;
                return (
                  <div className="step-item" key={step.key}>
                    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
                      {!isLast && (
                        <div className="step-connector" style={{ left: "50%" }}>
                          <div className="step-connector-fill" style={{ width: state === "done" ? "100%" : state === "active" ? "50%" : "0%" }} />
                          <div style={{ height: "100%", background: "#1e1e2a", position: "absolute", top: 0, left: 0, right: 0, zIndex: -1 }} />
                        </div>
                      )}
                      <div className={`step-circle ${state}`}>
                        <span style={{ fontSize: state === "pending" ? 14 : 16 }}>{step.icon}</span>
                      </div>
                    </div>
                    <span className={`step-label ${state}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Delivery Partner ── */}
          {hasDeliveryBoy && (
            <div className="od-card">
              <p className="od-section-title">Delivery Partner</p>

              <div className="partner-row">
                <div className="partner-avatar">
                  {(currentOrder.deliveryBoy?.user?.userName || "D").charAt(0).toUpperCase()}
                  <span className={`online-dot ${currentOrder.deliveryBoy?.isOnline ? "online" : "offline"}`} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, margin: 0, marginBottom: 2 }}>
                    {currentOrder.deliveryBoy?.user?.userName || currentOrder.deliveryBoy?.name || "Delivery Partner"}
                  </p>
                  <p style={{ fontSize: 13, color: "#6b6b80", margin: 0 }}>
                    {currentOrder.deliveryBoy?.user?.contactNumber || currentOrder.deliveryBoy?.phone || "Not Available"}
                  </p>
                </div>
                <a
                  href={`tel:${currentOrder.deliveryBoy?.user?.contactNumber || currentOrder.deliveryBoy?.phone}`}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none", fontSize: 18, flexShrink: 0
                  }}
                >📞</a>
              </div>

              {deliveryLocation.lat && deliveryLocation.lng && userLocation ? (
                <button className="track-btn" onClick={() => setShowTrackingModal(true)}>
                  <span style={{ fontSize: 18 }}>🛵</span>
                  Track Live Location
                  {eta && <span style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>· {eta} min away</span>}
                </button>
              ) : (
                <div style={{
                  borderRadius: 14, border: "1px dashed rgba(255,255,255,0.08)",
                  padding: "16px", textAlign: "center", color: "#6b6b80", fontSize: 13
                }}>
                  Waiting for live location...
                </div>
              )}
            </div>
          )}

          {/* ── Ordered Items ── */}
          <div className="od-card">
            <p className="od-section-title">Ordered Items</p>
            {currentOrder.items?.map((item, index) => (
              <div className="item-row" key={index}>
                <img
                  src={item.food?.image || "https://placehold.co/80x80/1a1a24/fb923c?text=🍽"}
                  alt={item.food?.name}
                  style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, margin: 0, marginBottom: 3, fontFamily: "'Syne', sans-serif" }}>
                    {item.food?.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#6b6b80", margin: 0 }}>Qty: {item.food?.quantity || item.quantity}</p>
                </div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fb923c", fontSize: 15, flexShrink: 0 }}>
                  ₹{(item.food?.price || 0) * (item.food?.quantity || item.quantity || 1)}
                </p>
              </div>
            ))}

            {/* Total */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 12, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#9090a8", fontSize: 13 }}>Total Amount</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#f0f0f5" }}>
                ₹{currentOrder.totalAmount || currentOrder.total || "—"}
              </span>
            </div>
          </div>

          {/* ── Cancel Button ── */}
          {["pending", "confirmed"].includes(currentOrder.status) && (
            <button
              onClick={() => setShowCancelModal(true)}
              style={{
                width: "100%", padding: "14px",
                background: "transparent", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 14, color: "#f87171",
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.background = "rgba(239,68,68,0.08)"; e.target.style.borderColor = "rgba(239,68,68,0.5)"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(239,68,68,0.3)"; }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TRACKING MODAL
      ══════════════════════════════════════════ */}
      {showTrackingModal && userLocation && deliveryLocation.lat && deliveryLocation.lng && (
        <div className="modal-overlay">
          <div className="modal-sheet">

            {/* Header */}
            <div className="modal-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, margin: 0, color: "#f0f0f5" }}>
                    Live Tracking
                  </h2>
                  <span className="live-indicator"><span className="live-dot" />LIVE</span>
                </div>
                <p style={{ fontSize: 12, color: "#6b6b80", margin: 0 }}>
                  {currentOrder.deliveryBoy?.user?.userName || "Your partner"} is heading your way
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowTrackingModal(false)}>×</button>
            </div>

            {/* Map */}
            <div className="map-wrapper">
              <MapContainer
                center={[deliveryLocation.lat, deliveryLocation.lng]}
                zoom={14}
                zoomControl={true}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Route breadcrumb */}
                {routePoints.length > 1 && (
                  <Polyline
                    positions={routePoints}
                    color="#f97316"
                    weight={3}
                    opacity={0.6}
                    dashArray="6,8"
                  />
                )}

                {/* Straight-line connector */}
                <Polyline
                  positions={[
                    [userLocation.lat, userLocation.lng],
                    [deliveryLocation.lat, deliveryLocation.lng],
                  ]}
                  color="#3b82f6"
                  weight={2}
                  opacity={0.35}
                  dashArray="4,8"
                />

                <SmoothMarker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon}>
                  <Popup>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                      <strong>📍 Your Location</strong>
                    </div>
                  </Popup>
                </SmoothMarker>

                <SmoothMarker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryMarkerIcon}>
                  <Popup>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                      <strong>🛵 {currentOrder.deliveryBoy?.user?.userName || "Delivery Partner"}</strong><br />
                      <span style={{ color: "#888" }}>{deliveryAddress?.slice(0, 60)}...</span>
                    </div>
                  </Popup>
                </SmoothMarker>

                <FitBounds userLocation={userLocation} deliveryLocation={deliveryLocation} />
              </MapContainer>

              {/* ── Bottom Info Panel ── */}
              <div className="bottom-panel">
                {/* Partner row */}
                <div className="panel-top">
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%",
                      background: "linear-gradient(135deg, #f97316, #ea580c)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "white"
                    }}>
                      {(currentOrder.deliveryBoy?.user?.userName || "D").charAt(0).toUpperCase()}
                    </div>
                    <span className={`online-dot ${currentOrder.deliveryBoy?.isOnline ? "online" : "offline"}`}
                      style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", border: "2px solid #0e0e16" }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, margin: 0, marginBottom: 2, color: "#f0f0f5" }}>
                      {currentOrder.deliveryBoy?.user?.userName || "Delivery Partner"}
                    </p>
                    <p style={{ fontSize: 11, color: "#6b6b80", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {locationLoading ? "Locating..." : (deliveryAddress?.split(",").slice(0, 3).join(", ") || "—")}
                    </p>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: "#6b6b80", margin: 0, marginBottom: 2 }}>Status</p>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#4ade80", margin: 0, textTransform: "capitalize" }}>
                      {currentOrder.status.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="panel-stats">
                  <div className="stat-cell">
                    <span className="stat-value">{eta ? `${eta}` : "—"}</span>
                    <span className="stat-label">Min ETA</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-cell">
                    <span className="stat-value">
                      {distance
                        ? distance < 1
                          ? `${Math.round(distance * 1000)}m`
                          : `${distance.toFixed(1)}km`
                        : "—"}
                    </span>
                    <span className="stat-label">Distance</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-cell">
                    <span className="stat-value" style={{ fontSize: 13 }}>~25</span>
                    <span className="stat-label">km/h speed</span>
                  </div>
                </div>

                {/* Last updated */}
                {lastUpdated && (
                  <p style={{ textAlign: "center", fontSize: 10, color: "#4b4b60", marginTop: 10, marginBottom: 0 }}>
                    Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · refreshes every 5s
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CANCEL MODAL
      ══════════════════════════════════════════ */}
      {showCancelModal && (
        <div className="cancel-overlay">
          <div className="cancel-card">
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, margin: "0 0 6px", color: "#f0f0f5" }}>
              Cancel Order?
            </h3>
            <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: 0 }}>
              Tell us why you want to cancel (optional)
            </p>
            <textarea
              className="cancel-textarea"
              rows={3}
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <button className="btn-danger" onClick={handleCancelOrder}>
              Yes, Cancel Order
            </button>
            <button className="btn-ghost" onClick={() => setShowCancelModal(false)}>
              Keep Order
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default OrderDetailsPage;
