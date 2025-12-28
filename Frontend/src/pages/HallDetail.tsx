import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
  Loader2, MapPin, Star, Users, ArrowLeft, Wifi, Music, Car, Utensils,
  Snowflake, Info, Camera, CheckCircle2, Building, Clock, Share2, Heart,
  ChevronRight, CalendarCheck
} from "lucide-react";
import { toast } from "sonner"; // Assuming you have a toast library, or replace with alert

// --- UI COMPONENTS (Simplified for brevity) ---
const Button = ({ children, variant = "primary", className = "", ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg",
    outline: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900",
    ghost: "hover:bg-gray-100 text-gray-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  };
  const size = props.size === "icon" ? "h-10 w-10" : "h-11 px-6";
  return <button className={`${base} ${variants[variant]} ${size} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children, className }: any) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </span>
);

// --- BOOKING WIDGET ---
const BookingWidget = ({ hall }: { hall: any }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(4);
  const [guests, setGuests] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate pricing dynamically
  const pricing = useMemo(() => {
    const base = hall.price_per_hour * duration;
    const tax = Math.round(base * 0.18);
    const serviceFee = 300;
    return { base, tax, serviceFee, total: base + tax + serviceFee };
  }, [hall, duration]);

  const handleBook = async () => {
    if (!date) return toast.error("Please select a date");

    setIsProcessing(true);
    try {
      const API_BASE = "/api";
      // Combine date and time
      const [h, m] = startTime.split(":").map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(h, m, 0);

      const res = await axios.post(`${API_BASE}/bookings/create`, {
        hall_id: hall.id,
        date: startDateTime.toISOString(),
        duration: duration,
        guests: guests,
        note: "Booked via Hall Detail Page"
      }, { withCredentials: true });

      toast.success("Booking successful!");
      navigate(`/booking/${res.data.booking_id}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.detail || "Booking failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white">
        <p className="text-xs font-medium opacity-90 mb-1">Price starts at</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">₹{hall.price_per_hour.toLocaleString()}</span>
          <span className="text-sm opacity-90">/ hour</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
            <input type="date" className="w-full border-gray-200 bg-gray-50 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition-all" onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
            <select className="w-full border-gray-200 bg-gray-50 rounded-lg text-sm p-2.5 outline-none" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              {["09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</label>
            <span className="text-sm font-semibold text-orange-600">{duration} Hours</span>
          </div>
          <input type="range" min="3" max="12" step="1" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-orange-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Guests</label>
            <span className="text-sm font-semibold text-orange-600">{guests} People</span>
          </div>
          <input type="range" min="20" max={hall.capacity} step="10" value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full accent-orange-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{hall.price_per_hour} x {duration} hrs</span>
            <span>₹{pricing.base.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service Fee & Tax</span>
            <span>₹{(pricing.tax + pricing.serviceFee).toLocaleString()}</span>
          </div>
          <div className="h-px bg-gray-200 my-2"></div>
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span>₹{pricing.total.toLocaleString()}</span>
          </div>
        </div>

        <Button className="w-full h-12 text-base shadow-orange-200" onClick={handleBook} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Reserve Venue"}
        </Button>
        <p className="text-center text-xs text-gray-400">You won't be charged yet</p>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const HallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "/api";

  useEffect(() => {
    const fetchHall = async () => {
      try {
        const res = await axios.get(`${API_BASE}/halls/${id}`);
        // Transform API data to match UI expected format if needed, or update UI to match API
        // API returns: id, name, city, state, location, capacity, price_per_hour, description, image_url
        // UI expects: ... + amenities, images array, host, rating, reviews_count

        const data = res.data;
        setHall({
          ...data,
          address: data.location,
          type: "Banquet Hall", // Default
          rating: 4.8, // Default
          reviews_count: 124, // Default
          amenities: ["AC", "WiFi", "Parking", "Catering", "Decor", "Bridal Room"], // Default
          images: [
            data.image_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
          ],
          host: { name: "Rajesh Kumar", image: "https://i.pravatar.cc/150?u=rajesh", type: "Superhost" }
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load hall details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHall();
  }, [id]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-10 w-10 text-orange-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0 font-sans text-slate-900">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full text-rose-500 hover:bg-rose-50"><Heart className="h-5 w-5" /></Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Gallery - Masonry Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px] mb-8 rounded-2xl overflow-hidden">
          <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer">
            <img src={hall.images[0]} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
          <div className="hidden md:block relative group overflow-hidden cursor-pointer">
            <img src={hall.images[1]} alt="Sub 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="hidden md:block relative group overflow-hidden cursor-pointer">
            <img src={hall.images[2]} alt="Sub 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="hidden md:block col-span-2 relative group overflow-hidden cursor-pointer">
            <img src={hall.images[3]} alt="Sub 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <Button variant="secondary" className="absolute bottom-4 right-4 bg-white/90 shadow-lg backdrop-blur-sm text-xs h-9">View all photos</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0">{hall.type}</Badge>
                <div className="flex items-center text-sm font-medium text-slate-600">
                  <Star className="h-4 w-4 text-orange-500 fill-orange-500 mr-1" />
                  {hall.rating} ({hall.reviews_count} reviews)
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{hall.name}</h1>
              <div className="flex items-center text-slate-500">
                <MapPin className="h-4 w-4 mr-1.5" /> {hall.address}
              </div>
            </div>

            <div className="flex gap-6 py-6 border-y border-gray-100 overflow-x-auto">
              <div className="flex items-center gap-3 min-w-max">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="h-6 w-6" /></div>
                <div><p className="font-bold text-slate-900">{hall.capacity} Guests</p><p className="text-xs text-slate-500">Max Capacity</p></div>
              </div>
              <div className="flex items-center gap-3 min-w-max">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building className="h-6 w-6" /></div>
                <div><p className="font-bold text-slate-900">3,500 sq.ft</p><p className="text-xs text-slate-500">Total Area</p></div>
              </div>
              <div className="flex items-center gap-3 min-w-max">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Clock className="h-6 w-6" /></div>
                <div><p className="font-bold text-slate-900">Instant Book</p><p className="text-xs text-slate-500">Available</p></div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">About this venue</h3>
              <p className="text-slate-600 leading-relaxed">{hall.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hall.amenities.map((item: string) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Info */}
            <div className="bg-slate-50 p-6 rounded-2xl flex items-center gap-4">
              <img src={hall.host.image} alt={hall.host.name} className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-sm" />
              <div>
                <h3 className="font-bold text-lg">Hosted by {hall.host.name}</h3>
                <p className="text-slate-500 text-sm">{hall.host.type} · Response time: 1 hr</p>
              </div>
              <Button variant="outline" className="ml-auto">Contact Host</Button>
            </div>
          </div>

          {/* Right Sidebar (Booking Widget) */}
          <div className="relative mt-8 lg:mt-0">
            <BookingWidget hall={hall} />
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Price starts at</p>
          <p className="text-xl font-bold text-slate-900">₹{hall.price_per_hour}<span className="text-sm font-normal text-slate-400">/hr</span></p>
        </div>
        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Check Availability</Button>
      </div>
    </div>
  );
};

export default HallDetail;