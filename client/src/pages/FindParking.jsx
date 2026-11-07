import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import LotCard from '../components/LotCard';
import { LotCardSkeleton } from '../components/Skeleton';
import {
  Search,
  List,
  Map as MapIcon,
  Filter,
  Car,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix standard Leaflet default marker icons in React Vite builds
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Search and discovery page with dynamic List/Map toggle, live slot availability, and filters
export default function FindParking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || '';

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchQuery, setSearchQuery] = useState(initialCity);
  const [maxPrice, setMaxPrice] = useState(100);

  // Fetch parking lots from backend API
  useEffect(() => {
    const fetchLots = async () => {
      setLoading(true);
      try {
        const res = await api.get('/lots');
        setLots(res.data.lots);
      } catch (err) {
        console.error('Error fetching parking lots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, []);

  // Filter lots according to user search query and maximum hourly rate
  const filteredLots = lots.filter(lot => {
    const matchesSearch =
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = lot.pricePerHour <= maxPrice;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Filter and View Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by area (e.g. MG Road, Indiranagar, Koramangala)"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Price Slider & Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span className="text-slate-600 dark:text-slate-300">Max Fare:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">₹{maxPrice}/hr</span>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-indigo-600 w-24 sm:w-28 cursor-pointer"
            />
          </div>

          {/* List vs Map Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <LotCardSkeleton />
          <LotCardSkeleton />
          <LotCardSkeleton />
        </div>
      ) : filteredLots.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <Car className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Parking Lots Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or increase the maximum price filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setMaxPrice(100); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => (
            <LotCard key={lot._id} lot={lot} />
          ))}
        </div>
      ) : (
        /* Map View with Leaflet */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-soft h-[600px] overflow-hidden">
          <MapContainer
            center={[12.9716, 77.6200]}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full rounded-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredLots.map((lot) => (
              <Marker
                key={lot._id}
                position={[lot.lat, lot.lng]}
                icon={defaultIcon}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-slate-900 max-w-[200px]">
                    <h4 className="font-bold text-sm leading-tight">{lot.name}</h4>
                    <p className="text-[11px] text-slate-600">{lot.address}</p>
                    <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-slate-200">
                      <span>₹{lot.pricePerHour}/hr</span>
                      <span className="text-emerald-600">{lot.totalSlots} slots</span>
                    </div>
                    <Link
                      to={`/lots/${lot._id}`}
                      className="block text-center w-full py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold no-underline"
                    >
                      Book this spot
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

    </div>
  );
}
