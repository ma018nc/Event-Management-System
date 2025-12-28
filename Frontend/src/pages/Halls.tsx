import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  Filter,
  MapPin,
  Star,
  Users,
  IndianRupee,
  X,
  List as ListIcon,
  Map as MapIcon,
  Maximize2,
  Heart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Share2,
  CheckCircle,
  Clock
} from "lucide-react";
import axios from "axios";

const API_BASE = "/api";

// --- TYPES ---
interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface Hall {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  type: string;
  capacity: number;
  price_per_hour: number;
  rating: number;
  photo_urls: string[]; // Changed to array for gallery
  amenities: string[];
  reviews: Review[]; // Added reviews
  description: string;
}

// --- MOCK DATA GENERATOR ---
const VENUE_TYPES = ["Banquet", "Marriage Hall", "Conference", "Party Lawn", "Rooftop"];
const AMENITIES_LIST = ["AC", "Parking", "WiFi", "Catering", "DJ", "Decor", "Valet", "Bridal Room"];
const INDIA_CITIES = [
  { name: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Indore", lat: 22.7196, lng: 75.8577 },
];

const generateMockHalls = (): Hall[] => {
  const halls: Hall[] = [];
  const names = ["Grand Royal", "Silver Woods", "Oberoi Palace", "City Garden", "Ocean Pearl", "King Court", "Palm Venue", "Green Lounge", "Sky Banquet", "Royal Arena"];
  const baseImages = [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&q=80&w=800"
  ];

  INDIA_CITIES.forEach((city, cityIdx) => {
    const count = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.08;
      const offsetLng = (Math.random() - 0.5) * 0.08;

      // Generate multiple images per hall
      const hallImages = [
        baseImages[(cityIdx + i) % baseImages.length],
        baseImages[(cityIdx + i + 1) % baseImages.length],
        baseImages[(cityIdx + i + 2) % baseImages.length],
      ];

      halls.push({
        id: `hall-${cityIdx}-${i}`,
        name: `${names[(cityIdx + i) % names.length]} ${VENUE_TYPES[i % VENUE_TYPES.length]}`,
        latitude: city.lat + offsetLat,
        longitude: city.lng + offsetLng,
        city: city.name,
        type: VENUE_TYPES[(cityIdx + i) % VENUE_TYPES.length],
        capacity: 100 + Math.floor(Math.random() * 800),
        price_per_hour: 2000 + Math.floor(Math.random() * 8000),
        rating: Number((3.8 + Math.random() * 1.2).toFixed(1)), // Higher ratings generally
        photo_urls: hallImages,
        amenities: AMENITIES_LIST.sort(() => 0.5 - Math.random()).slice(0, 5),
        description: "Experience luxury and comfort at its finest. Perfect for weddings, corporate events, and grand parties. Featuring state-of-the-art facilities and impeccable service.",
        reviews: [
          { id: 'r1', user: "Amit Sharma", rating: 5, comment: "Absolutely stunning venue!", date: "2 days ago" },
          { id: 'r2', user: "Priya Singh", rating: 4, comment: "Great food and ambience.", date: "1 week ago" }
        ]
      });
    }
  });
  return halls;
};

// --- HELPER COMPONENTS ---

// 1. Image Carousel
const ImageGallery = ({ images }: { images: string[] }) => {
  const [idx, setIdx] = useState(0);

  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((prev) => (prev + 1) % images.length); };
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((prev) => (prev - 1 + images.length) % images.length); };

  return (
    <div className="relative h-64 w-full group overflow-hidden bg-gray-100">
      <img src={images[idx]} alt="Venue" className="w-full h-full object-cover transition-opacity duration-300" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

      {/* Navigation */}
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/90 p-1.5 rounded-full backdrop-blur-sm text-white hover:text-black transition-all opacity-0 group-hover:opacity-100">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/90 p-1.5 rounded-full backdrop-blur-sm text-white hover:text-black transition-all opacity-0 group-hover:opacity-100">
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
};

// 2. Booking Form Modal
const BookingModal = ({ hall, onClose }: { hall: Hall; onClose: () => void }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-orange-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Book {hall.name}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input type="date" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" className="w-full border rounded-lg p-2.5 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" className="w-full border rounded-lg p-2.5 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Count</label>
                <input type="number" placeholder="e.g. 250" className="w-full border rounded-lg p-2.5 outline-none" />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg mt-2 transition-colors">
                Continue to Details
              </button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full border rounded-lg p-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" placeholder="+91 98765 43210" className="w-full border rounded-lg p-2.5 outline-none" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg">
                  Confirm Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Booking Requested!</h3>
              <p className="text-gray-500 mt-2 text-sm">The venue manager will contact you shortly to confirm your slot.</p>
              <button onClick={onClose} className="mt-6 text-orange-600 font-semibold hover:underline">Close Window</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Details Modal (Enhanced)
const DetailsModal = ({ hall, onClose, isFavorite, toggleFavorite }: any) => {
  const [showBooking, setShowBooking] = useState(false);

  if (showBooking) return <BookingModal hall={hall} onClose={() => setShowBooking(false)} />;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Gallery */}
        <div className="relative">
          <ImageGallery images={hall.photo_urls} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors shadow-sm z-10"
          >
            <X size={20} />
          </button>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {hall.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {hall.name}
                <button onClick={() => toggleFavorite(hall.id)} className="focus:outline-none">
                  <Heart className={`cursor-pointer transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} size={24} />
                </button>
              </h2>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={16} /> {hall.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600 flex items-center justify-end">
                <IndianRupee size={20} />{hall.price_per_hour.toLocaleString()}
                <span className="text-sm text-gray-400 font-normal ml-1">/ hr</span>
              </p>
              <div className="flex items-center gap-1 justify-end mt-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">{hall.rating}</span>
                <span className="text-gray-400 text-xs">({hall.reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed text-sm">
            {hall.description}
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y py-6 border-gray-100">
            <div className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg">
              <Users size={20} className="mb-1" />
              <span className="text-xs text-blue-400 font-medium uppercase">Capacity</span>
              <span className="font-bold">{hall.capacity}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-purple-50 text-purple-700 rounded-lg">
              <Maximize2 size={20} className="mb-1" />
              <span className="text-xs text-purple-400 font-medium uppercase">Size</span>
              <span className="font-bold">3,500 sq.ft</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg">
              <Clock size={20} className="mb-1" />
              <span className="text-xs text-green-400 font-medium uppercase">Min Time</span>
              <span className="font-bold">4 Hours</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-rose-50 text-rose-700 rounded-lg">
              <Share2 size={20} className="mb-1" />
              <span className="text-xs text-rose-400 font-medium uppercase">Share</span>
              <span className="font-bold">Link</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {hall.amenities.map(a => (
                <span key={a} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <h3 className="font-semibold mb-3">Recent Reviews</h3>
            <div className="space-y-3">
              {hall.reviews.map(r => (
                <div key={r.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-gray-800">{r.user}</span>
                    <span className="text-gray-400 text-xs">{r.date}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < r.rating ? "fill-current" : "text-gray-300"} />)}
                  </div>
                  <p className="text-gray-600">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              window.location.href = `/halls/${hall.id}`;
            }}
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98]"
          >
            View Details & Book
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LEAFLET MAP WRAPPER ---
const LeafletMap = ({ center, zoom, markers, onMarkerClick, selectedHallId, hoveredHallId }: any) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [libLoaded, setLibLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).L) { setLibLoaded(true); return; }
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement("link");
      link.id = 'leaflet-css'; link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLibLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (libLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      const L = (window as any).L;
      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(center, zoom);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }
  }, [libLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L;
    markersLayerRef.current.clearLayers();
    markers.forEach((hall: Hall) => {
      const isSelected = hall.id === selectedHallId;
      const isHovered = hall.id === hoveredHallId;
      const iconHtml = `
            <div style="
                background-color: ${isSelected ? '#ea580c' : (isHovered ? '#f97316' : '#3b82f6')};
                width: ${isSelected ? '36px' : '28px'};
                height: ${isSelected ? '36px' : '28px'};
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;
            ">
                <strong style="color:white; font-size: ${isSelected ? '14px' : '10px'};">${isSelected ? '📍' : ''}</strong>
            </div>
        `;
      const icon = L.divIcon({ html: iconHtml, className: 'custom-div-icon', iconSize: [36, 36], iconAnchor: [18, 18] });
      const marker = L.marker([hall.latitude, hall.longitude], { icon })
        .on('click', () => onMarkerClick(hall))
        .on('mouseover', () => marker.openPopup());
      marker.bindPopup(`<div class="font-sans p-1"><b>${hall.name}</b><br/><span class="text-orange-600 font-bold">₹${hall.price_per_hour}/hr</span></div>`);
      markersLayerRef.current.addLayer(marker);
      if (isSelected) marker.openPopup();
    });
  }, [markers, selectedHallId, hoveredHallId]);

  return <div id="map-container" ref={mapContainerRef} className="w-full h-full z-0 outline-none" />;
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  // App State
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [hoveredHallId, setHoveredHallId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // View State
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [mapConfig, setMapConfig] = useState<{ center: [number, number], zoom: number }>({ center: [22.5, 79.5], zoom: 5 });

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [filterGuestCount, setFilterGuestCount] = useState<number | "">("");
  const [filterDate, setFilterDate] = useState("");


  // Load Data
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await axios.get(`${API_BASE}/halls/`);
        // Transform API data to match UI expected format
        const apiHalls = res.data.map((h: any) => ({
          id: h.id,
          name: h.name,
          latitude: h.latitude,
          longitude: h.longitude,
          city: h.city || "Unknown",
          type: "Banquet Hall", // Default
          capacity: h.capacity,
          price_per_hour: h.price_per_hour,
          rating: 4.5, // Default
          photo_urls: [h.image_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"],
          amenities: ["AC", "WiFi", "Parking"], // Default
          reviews: [],
          description: h.description || "No description available."
        }));
        setHalls(apiHalls);
      } catch (err) {
        console.error("Failed to fetch halls", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();

    // Load favorites
    const savedFavs = localStorage.getItem("favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };

  // Filter Logic (Enhanced)
  const filteredHalls = useMemo(() => {
    return halls.filter(h =>
      h.name.toLowerCase().includes(searchText.toLowerCase()) &&
      (selectedCity === "All Cities" || h.city === selectedCity) &&
      (selectedType === "All Types" || h.type === selectedType) &&
      (filterGuestCount === "" || h.capacity >= filterGuestCount)
    );
  }, [halls, searchText, selectedCity, selectedType, filterGuestCount]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city === "All Cities") {
      setMapConfig({ center: [22.5, 79.5], zoom: 5 });
    } else {
      const target = INDIA_CITIES.find(c => c.name === city);
      if (target) setMapConfig({ center: [target.lat, target.lng], zoom: 12 });
    }
  };

  const focusHall = (hall: Hall) => {
    setMapConfig({ center: [hall.latitude, hall.longitude], zoom: 15 });
    setSelectedHall(hall);
    setViewMode("map");
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="animate-spin text-orange-600 h-10 w-10" />
        <p className="text-gray-500 font-medium">Finding luxury venues...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans text-gray-800">

      {/* HEADER */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-20 relative">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-2 rounded-lg shadow-md">
            <MapPin size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Venue<span className="text-orange-600">Finder</span></h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide">PREMIUM SPACES</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          <div className="hover:text-orange-600 cursor-pointer transition-colors">Venues</div>
          <div className="hover:text-orange-600 cursor-pointer transition-colors">Services</div>
          <div className="hover:text-orange-600 cursor-pointer transition-colors">Blog</div>
          <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full cursor-pointer">
            <Heart size={16} className="fill-orange-600" />
            <span>Saved ({favorites.length})</span>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="md:hidden flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow text-orange-600" : "text-gray-500"}`}><ListIcon size={18} /></button>
          <button onClick={() => setViewMode("map")} className={`p-2 rounded-md transition-all ${viewMode === "map" ? "bg-white shadow text-orange-600" : "text-gray-500"}`}><MapIcon size={18} /></button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* SIDEBAR (LIST) */}
        <div className={`
          absolute md:relative z-10 w-full md:w-[420px] lg:w-[480px] h-full bg-white flex flex-col border-r shadow-xl md:shadow-none transition-transform duration-300
          ${viewMode === "list" ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>

          {/* Filters Section */}
          <div className="p-4 border-b space-y-3 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search by name..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" value={searchText} onChange={e => setSearchText(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <select className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer" value={selectedCity} onChange={(e) => handleCityChange(e.target.value)}>
                <option>All Cities</option>
                {INDIA_CITIES.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
              <select className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option>All Types</option>
                {VENUE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* New Date/Guest Filters */}
            <div className="flex gap-2 pt-1">
              <div className="flex-1 relative">
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none text-gray-600" />
              </div>
              <div className="w-1/3 relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" placeholder="Guests" value={filterGuestCount} onChange={(e) => setFilterGuestCount(e.target.value ? Number(e.target.value) : "")} className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>{filteredHalls.length} venues found</span>
              <button className="flex items-center gap-1 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => { setSearchText(""); setSelectedCity("All Cities"); setSelectedType("All Types"); setFilterGuestCount(""); }}><Filter size={12} /> Clear Filters</button>
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {filteredHalls.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p>No venues found matching your criteria.</p>
              </div>
            ) : (
              filteredHalls.map(hall => (
                <div
                  key={hall.id}
                  onClick={() => focusHall(hall)}
                  onDoubleClick={() => window.location.href = `/halls/${hall.id}`}
                  onMouseEnter={() => setHoveredHallId(hall.id)}
                  onMouseLeave={() => setHoveredHallId(null)}
                  className={`
                    group bg-white rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden
                    ${selectedHall?.id === hall.id ? "ring-2 ring-orange-500 border-transparent" : "hover:border-orange-200 border-gray-200"}
                  `}
                >
                  {/* Popular Badge Mockup */}
                  {hall.rating > 4.5 && <div className="absolute top-0 right-0 bg-yellow-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">POPULAR</div>}

                  <div className="flex gap-3">
                    <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
                      <img src={hall.photo_urls[0]} alt={hall.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(hall.id); }}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full hover:bg-white transition-colors"
                      >
                        <Heart size={14} className={favorites.includes(hall.id) ? "fill-red-500 text-red-500" : "text-gray-500"} />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors text-base">{hall.name}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={10} /> {hall.city} • {hall.type}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex bg-green-50 px-1.5 py-0.5 rounded text-green-700 font-bold text-[10px] items-center gap-0.5">
                            <span>{hall.rating}</span> <Star size={8} fill="currentColor" />
                          </div>
                          <span className="text-[10px] text-gray-400">({hall.reviews.length})</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                          <Users size={10} /> {hall.capacity}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-base flex items-center">
                            <IndianRupee size={14} />{hall.price_per_hour.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400">per hour</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAP AREA */}
        <div className="flex-1 relative bg-gray-100">
          <LeafletMap
            center={mapConfig.center}
            zoom={mapConfig.zoom}
            markers={filteredHalls}
            onMarkerClick={(h: Hall) => setSelectedHall(h)}
            selectedHallId={selectedHall?.id || null}
            hoveredHallId={hoveredHallId}
          />

          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <button className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 text-gray-700 transition-transform hover:scale-105" onClick={() => { navigator.geolocation.getCurrentPosition(pos => { setMapConfig({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 13 }); }); }}>
              <MapPin size={20} className="text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedHall && (
        <DetailsModal hall={selectedHall} onClose={() => setSelectedHall(null)} isFavorite={favorites.includes(selectedHall.id)} toggleFavorite={toggleFavorite} />
      )}
    </div>
  );
}