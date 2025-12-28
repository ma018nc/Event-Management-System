import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar, MapPin, Clock, LayoutDashboard, CalendarDays, Search,
    MoreVertical, CheckCircle2, Wallet, RefreshCw, FileText, Filter, ArrowRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import axios from "axios";

const API_BASE = "/api";

// --- Sub-Components (Simplified) ---
const StatsCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

// --- MAIN DASHBOARD ---
export default function UserDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("upcoming");
    const [searchQuery, setSearchQuery] = useState("");
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Bookings
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setError(null);
                const res = await axios.get(`${API_BASE}/bookings/me`, { withCredentials: true });
                setBookings(res.data);
            } catch (err: any) {
                console.error("Failed to fetch bookings", err);
                setError(err?.response?.data?.detail || "Failed to load bookings");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = useMemo(() => {
        let data = bookings;
        if (activeTab === 'upcoming') data = data.filter(b => ['confirmed', 'pending'].includes(b.status));
        if (activeTab === 'history') data = data.filter(b => ['completed', 'cancelled'].includes(b.status));
        return data.filter(b => b.hall_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [bookings, activeTab, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Dashboard</h3>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 md:px-8">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl">
                            {(() => {
                                const user = JSON.parse(localStorage.getItem("user") || "{}");
                                return user.full_name?.[0]?.toUpperCase() || "U";
                            })()}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">
                                Welcome, {(() => {
                                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                                    return user.full_name?.split(' ')[0] || "User";
                                })()}!
                            </h1>
                            <p className="text-xs text-slate-500">Manage your events</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/halls')} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        + New Booking
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total Bookings"
                        value={bookings.length.toString()}
                        icon={LayoutDashboard}
                        color="bg-blue-500"
                    />
                    <StatsCard
                        title="Upcoming Events"
                        value={bookings.filter(b => ['confirmed', 'pending'].includes(b.status)).length.toString()}
                        icon={CalendarDays}
                        color="bg-orange-500"
                    />
                    <StatsCard
                        title="Total Spent"
                        value={`₹${bookings.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}`}
                        icon={Wallet}
                        color="bg-emerald-500"
                    />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">

                    {/* Tabs & Search */}
                    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                            <button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Upcoming</button>
                            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>History</button>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search venues..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Booking List */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-4 font-medium">Event Details</th>
                                    <th className="p-4 font-medium">Date & Time</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Amount</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                                    <tr key={booking.id} onClick={() => navigate(`/booking/${booking.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{booking.hall_name}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {booking.city}</p>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{format(parseISO(booking.start_time), "dd MMM yyyy")}</span>
                                                <span className="text-xs text-slate-400">{format(parseISO(booking.start_time), "h:mm a")}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                                    booking.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-900">
                                            ₹{booking.total_amount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900">
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-500">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}