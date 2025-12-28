import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Loader2, ArrowLeft, MapPin, Calendar, Clock, Download,
    Printer, Building2, User, Phone, Mail, QrCode
} from "lucide-react";
import axios from "axios";

const API_BASE = "/api";

// --- Types ---
const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        confirmed: "bg-emerald-100 text-emerald-800",
        pending: "bg-amber-100 text-amber-800",
        cancelled: "bg-rose-100 text-rose-800",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || "bg-gray-100"}`}>
            {status}
        </span>
    );
};

export default function BookingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axios.get(`${API_BASE}/bookings/${id}`, { withCredentials: true });
                const data = res.data;
                // Transform API data to match UI
                setBooking({
                    id: data.id,
                    ref: data.booking_ref,
                    status: data.status,
                    date: new Date(data.start_time).toLocaleDateString(),
                    time: `${new Date(data.start_time).toLocaleTimeString()} - ${new Date(data.end_time).toLocaleTimeString()}`,
                    guests: data.guests,
                    total: data.total_amount,
                    hall: {
                        name: data.hall_name,
                        address: data.hall_city, // Or full address if available
                        image: data.hall_image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
                        phone: data.hall_phone || "+91 98765 43210"
                    },
                    user: {
                        name: "User", // Backend might not return user name in this endpoint, or we use current user context
                        email: "user@example.com"
                    }
                });
            } catch (err) {
                console.error("Failed to fetch booking", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBooking();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

    if (!booking) return <div className="h-screen flex items-center justify-center">Booking not found</div>;

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Booking Details</h1>
                </div>

                {/* TICKET CARD LAYOUT */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                    {/* Left Side: Visuals & Main Info */}
                    <div className="md:w-2/5 bg-slate-900 text-white p-8 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 w-full h-full opacity-30">
                            <img src={booking.hall.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900/50 to-slate-900 z-10" />

                        <div className="relative z-20 space-y-6">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Venue</p>
                                <h2 className="text-2xl font-bold leading-tight">{booking.hall.name}</h2>
                                <p className="text-slate-400 text-sm mt-2 flex items-start gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                    {booking.hall.address}
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-orange-500 p-2 rounded-lg"><Calendar className="h-5 w-5 text-white" /></div>
                                    <div>
                                        <p className="text-xs text-slate-300 uppercase font-bold">Date</p>
                                        <p className="font-semibold">{booking.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500 p-2 rounded-lg"><Clock className="h-5 w-5 text-white" /></div>
                                    <div>
                                        <p className="text-xs text-slate-300 uppercase font-bold">Time</p>
                                        <p className="font-semibold">{booking.time}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-20 mt-8 pt-6 border-t border-white/20">
                            <p className="text-xs text-slate-400">Total Amount</p>
                            <p className="text-3xl font-bold text-emerald-400">₹{booking.total.toLocaleString()}</p>
                        </div>

                        {/* Decor Circles for Ticket Cutout Effect */}
                        <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-100 rounded-full z-30 hidden md:block"></div>
                    </div>

                    {/* Right Side: Details & QR */}
                    <div className="md:w-3/5 p-8 relative flex flex-col justify-between">
                        <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-100 rounded-full z-30 hidden md:block"></div>

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Booking Ref</p>
                                <p className="text-xl font-mono font-bold text-slate-800 tracking-wide">{booking.ref}</p>
                            </div>
                            <StatusBadge status={booking.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Guest Name</p>
                                <p className="font-semibold text-slate-800 flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" /> {booking.user.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Guest Count</p>
                                <p className="font-semibold text-slate-800">{booking.guests} People</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Contact Venue</p>
                                <p className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-slate-400" /> {booking.hall.phone}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center border-t border-dashed border-slate-200 pt-6">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-2">
                                <QrCode className="h-32 w-32 text-slate-900" />
                            </div>
                            <p className="text-xs text-slate-400">Scan at entrance for check-in</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                <Download className="h-4 w-4" /> Download
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
                                <Printer className="h-4 w-4" /> Print Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}