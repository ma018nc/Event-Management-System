import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Users, Building2, Calendar, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, Menu, Bell, Search, LogOut,
  LayoutDashboard, Settings, MoreVertical, ChevronRight,
  Plus, MapPin, Star, Filter, Trash2, Edit, Download, RefreshCw,
  ArrowUpRight, ArrowDownRight, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const API_BASE = "/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  // Removed isSidebarOpen state as header toggle is gone
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load Real Data from API
  useEffect(() => {
    fetchAllData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      else setIsRefreshing(true);

      const [statsRes, bookingsRes, hallsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/stats`, { withCredentials: true }),
        axios.get(`${API_BASE}/admin/bookings?limit=50`, { withCredentials: true }),
        axios.get(`${API_BASE}/admin/halls`, { withCredentials: true }),
        axios.get(`${API_BASE}/admin/users`, { withCredentials: true })
      ]);

      // Transform API data to match UI format
      const transformedBookings = bookingsRes.data.map((b: any) => ({
        id: b.id,
        ref: b.booking_ref || `BK-${b.id.toString().padStart(4, '0')}`,
        user: b.user_name,
        venue: b.hall_name,
        date: new Date(b.start_time).toLocaleDateString(),
        rawDate: b.start_time,
        status: b.status,
        amount: b.total_price,
        guests: b.guests || 0
      }));

      const transformedHalls = hallsRes.data.map((h: any) => ({
        id: h.id,
        name: h.name,
        city: h.city || "N/A",
        capacity: h.capacity,
        price: h.price_per_hour,
        rating: 4.5,
        image: h.image_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400"
      }));

      const transformedUsers = usersRes.data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.is_admin ? "Admin" : "User",
        status: "Active",
        joined: new Date().toLocaleDateString() // Fallback as created_at not in DB
      }));

      setData({
        stats: {
          pending_requests: transformedBookings.filter((b: any) => b.status === 'pending').length,
          total_bookings: statsRes.data.total_bookings,
          total_halls: statsRes.data.total_halls,
          total_users: statsRes.data.total_users,
          total_revenue: statsRes.data.total_revenue
        },
        bookings: transformedBookings,
        halls: transformedHalls,
        users: transformedUsers
      });

      setLastUpdated(new Date());
      if (isAutoRefresh) {
        toast.success("Dashboard updated", { duration: 1000 });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // CSV Export Function
  const exportToCSV = (bookings: any[]) => {
    const headers = ["Ref ID", "User", "Venue", "Date", "Status", "Amount", "Guests"];
    const rows = bookings.map(b => [
      b.ref,
      b.user,
      b.venue,
      b.date,
      b.status,
      b.amount,
      b.guests || 0
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Bookings exported successfully!");
  };

  // --- SKELETON LOADER ---
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 hidden md:block" />
      <main className="flex-1 p-6 space-y-6">
        <div className="h-16 bg-white rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-3 gap-6 h-96">
          <div className="col-span-2 bg-white rounded-xl animate-pulse" />
          <div className="bg-white rounded-xl animate-pulse" />
        </div>
      </main>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'bookings': return <BookingsView bookings={data.bookings} searchQuery={searchQuery} exportToCSV={exportToCSV} />;
      case 'halls': return <HallsView halls={data.halls} />;
      case 'users': return <UsersView users={data.users} />;
      case 'settings': return <SettingsView />;
      default: return <DashboardHome stats={data.stats} bookings={data.bookings} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-900">

      {/* --- SIDEBAR --- */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-white shadow-2xl flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10 flex justify-between items-center h-20">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg shadow-lg shadow-orange-500/20">
              <Building2 className="text-white h-5 w-5" />
            </div>
            <span>Venue<span className="text-orange-500">Admin</span></span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Overview</div>
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => { setActiveView('dashboard'); }} />

          <div className="px-3 py-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</div>
          <NavItem icon={Calendar} label="All Bookings" active={activeView === 'bookings'} onClick={() => { setActiveView('bookings'); }} />
          <NavItem icon={Building2} label="Manage Halls" active={activeView === 'halls'} onClick={() => { setActiveView('halls'); }} />
          <NavItem icon={Users} label="Users" active={activeView === 'users'} onClick={() => { setActiveView('users'); }} />

          <div className="px-3 py-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">System</div>
          <NavItem icon={Settings} label="Settings" active={activeView === 'settings'} onClick={() => { setActiveView('settings'); }} />
        </nav>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (VIEWS) ---

// 1. DASHBOARD HOME
const DashboardHome = ({ stats, bookings, setActiveView }: any) => {
  const [localBookings, setLocalBookings] = useState(bookings);
  const pending = localBookings.filter((b: any) => b.status === 'pending');

  const handleApprove = async (id: number, action: 'approve' | 'reject') => {
    try {
      await axios.patch(
        `${API_BASE}/admin/bookings/${id}`,
        null,
        {
          params: { action: action === 'approve' ? 'confirm' : 'cancel' },
          withCredentials: true
        }
      );

      // Update local state
      setLocalBookings(localBookings.map((b: any) =>
        b.id === id ? { ...b, status: action === 'approve' ? 'confirmed' : 'cancelled' } : b
      ));

      toast.success(
        action === 'approve'
          ? '✅ Booking approved successfully!'
          : '❌ Booking rejected',
        { duration: 1000 }
      );
    } catch (error) {
      console.error("Failed to update booking:", error);
      toast.error("Failed to update booking. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Revenue" value={`₹${stats.total_revenue.toLocaleString()}`} icon={DollarSign} trend="+12.5%" color="text-emerald-600" bg="bg-emerald-50" />
        <StatsCard title="Pending Approvals" value={stats.pending_requests} icon={Clock} trend="Action Needed" color="text-orange-600" bg="bg-orange-50" highlight />
        <StatsCard title="Total Bookings" value={stats.total_bookings} icon={Calendar} color="text-blue-600" bg="bg-blue-50" />
        <StatsCard title="Total Users" value={stats.total_users} icon={Users} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <Card className="xl:col-span-2 border-slate-200 shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-1.5 rounded-md"><Clock size={16} className="text-orange-600" /></div>
              <CardTitle className="text-base">Pending Requests</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveView('bookings')} className="text-slate-500 hover:text-orange-600 text-xs font-medium">View All</Button>
          </CardHeader>
          <CardContent className="pt-6">
            {pending.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">All caught up!</p>
                <p className="text-slate-400 text-xs mt-1">No pending requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((b: any) => (
                  <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50/80 hover:border-slate-200 transition-all gap-4 bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                        {b.user.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{b.venue}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{b.user}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <Calendar size={10} />
                          <span>{b.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto pl-16 sm:pl-0 justify-between sm:justify-end">
                      <div className="text-right mr-2">
                        <span className="font-bold text-slate-900 block">₹{b.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Total</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 shadow-sm shadow-emerald-200" onClick={() => handleApprove(b.id, 'approve')}>Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-9 px-4" onClick={() => handleApprove(b.id, 'reject')}>Reject</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mini Revenue Chart Visual */}
        <Card className="border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={16} className="text-emerald-600" /> Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end pt-8">
            <div className="h-48 flex items-end justify-between gap-3 px-2">
              {[40, 60, 35, 80, 50, 95, 40].map((h, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                  <div className="relative w-full h-[90%] bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-slate-800 rounded-lg group-hover:bg-orange-600 transition-all duration-500 ease-out"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-orange-600 transition-colors uppercase">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">This Week</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹1.2L</p>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 gap-1 px-2 py-1">
                  <ArrowUpRight size={14} /> 12.5%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// 2. HALLS MANAGEMENT VIEW
const HallsView = ({ halls }: any) => {
  const [localHalls, setLocalHalls] = useState(halls);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Mock Delete
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this hall?")) {
      setLocalHalls(localHalls.filter((h: any) => h.id !== id));
      toast.success("Hall deleted successfully");
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Halls</h2>
          <p className="text-slate-500 text-sm mt-1">Add, edit or remove venues from the platform.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 gap-2 shadow-lg shadow-slate-900/20">
          <Plus size={16} /> Add New Hall
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localHalls.map((hall: any) => (
          <div key={hall.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col h-full">
            <div className="h-48 overflow-hidden relative">
              <img src={hall.image} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                <button onClick={() => handleDelete(hall.id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 text-slate-800 shadow-sm">
                  <Star size={12} className="text-orange-500 fill-orange-500" /> {hall.rating}
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900 leading-tight">{hall.name}</h3>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-4"><MapPin size={14} className="text-slate-400" /> {hall.city}</p>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                  <Users size={12} /> {hall.capacity} Guests
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg text-orange-600">₹{hall.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-medium">/hr</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Hall Modal (Simplified) */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Venue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Venue Name</label>
              <Input placeholder="e.g. Grand Palace" className="focus-visible:ring-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">City</label>
                <Input placeholder="Indore" className="focus-visible:ring-orange-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Price/Hr</label>
                <Input placeholder="5000" type="number" className="focus-visible:ring-orange-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Image URL</label>
              <Input placeholder="https://..." className="focus-visible:ring-orange-500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => { setIsAddOpen(false); toast.success("Venue added successfully"); }}>Save Venue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 3. BOOKINGS VIEW
const BookingsView = ({ bookings, searchQuery, exportToCSV }: any) => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  // Apply filters and search
  let filtered = filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter);

  if (searchQuery) {
    filtered = filtered.filter((b: any) =>
      b.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ref.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedBookings = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Bookings</h2>
          <p className="text-slate-500 text-sm mt-1">Showing {filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="bg-white border border-slate-200 p-1 rounded-lg flex mr-2 shadow-sm">
            {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${filter === f ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button
            onClick={() => exportToCSV(filtered)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-sm"
            size="sm"
          >
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">Ref ID</th>
                <th className="p-4 font-semibold whitespace-nowrap">User Details</th>
                <th className="p-4 font-semibold whitespace-nowrap">Venue</th>
                <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="font-medium">{searchQuery ? `No bookings matching "${searchQuery}"` : "No bookings found"}</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-mono text-xs text-slate-500 font-medium">#{b.ref}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-200"><AvatarFallback className="bg-slate-100 text-slate-600 text-xs">{b.user.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{b.user}</p>
                          <p className="text-xs text-slate-400">{b.guests} guests</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{b.venue}</td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" /> {b.date}
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={b.status} /></td>
                    <td className="p-4 text-right font-bold text-slate-900">₹{b.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100"><MoreVertical size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="cursor-pointer">View Details</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">Download Invoice</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">Cancel Booking</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500 font-medium">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-white"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// 4. USERS VIEW
const UsersView = ({ users }: any) => (
  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
      <p className="text-slate-500 text-sm mt-1">View and manage system users.</p>
    </div>

    <div className="grid grid-cols-1 gap-6">
      <Card className="border-slate-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold">User Profile</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {/* Empty State for Now as users array was empty in fetch */}
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={20} className="text-slate-400" />
                  </div>
                  No users found in this view.
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-200"><AvatarFallback className="bg-slate-100 text-slate-700 font-bold">{u.name.charAt(0)}</AvatarFallback></Avatar>
                    <span className="text-slate-900">{u.name}</span>
                  </td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4"><Badge variant="outline" className="border-slate-300">{u.role}</Badge></td>
                  <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{u.status}</span></td>
                  <td className="p-4 text-right"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900">Edit</Button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  </div>
);

// 5. SETTINGS VIEW (Placeholder)
const SettingsView = () => (
  <div className="max-w-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Platform Settings</h2>
      <p className="text-slate-500 text-sm mt-1">Configure general system preferences.</p>
    </div>

    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h3 className="font-semibold text-slate-900">General Information</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Platform Name</label>
          <Input defaultValue="Evento Admin" className="max-w-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Admin Contact Email</label>
          <Input defaultValue="support@evento.com" className="max-w-md" />
        </div>
      </div>
    </Card>

    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h3 className="font-semibold text-slate-900">System Controls</h3>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
          <div>
            <p className="font-medium text-slate-900">Maintenance Mode</p>
            <p className="text-xs text-slate-500 mt-1">Disable bookings temporarily for all users.</p>
          </div>
          <div className="h-6 w-11 bg-slate-200 rounded-full relative cursor-pointer transition-colors hover:bg-slate-300">
            <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg mt-4">
          <div>
            <p className="font-medium text-slate-900">Payment Gateway</p>
            <p className="text-xs text-slate-500 mt-1">Test mode enabled (Razorpay Sandbox)</p>
          </div>
          <div className="h-6 w-11 bg-orange-600 rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-right">
        <Button className="bg-slate-900 hover:bg-slate-800">Save Changes</Button>
      </div>
    </Card>
  </div>
);

// --- HELPERS ---
const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium relative group
      ${active ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
    `}
  >
    {active && <div className="absolute left-0 h-full w-1 bg-orange-300 rounded-r-full" />}
    <Icon size={18} className={active ? 'text-white' : 'group-hover:text-white transition-colors'} /> {label}
  </button>
);

const StatsCard = ({ title, value, icon: Icon, color, bg, trend, highlight }: any) => (
  <Card className={`border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group ${highlight ? 'ring-2 ring-orange-500/20' : ''}`}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
          {trend && (
            <p className={`text-xs font-bold mt-1.5 ${color} flex items-center bg-opacity-10 px-1.5 py-0.5 rounded-md w-fit`}>
              <TrendingUp className="h-3 w-3 mr-1" /> {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    cancelled: "bg-rose-100 text-rose-800 border-rose-200",
    completed: "bg-blue-50 text-blue-800 border-blue-200"
  };
  return <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize border ${styles[status]}`}>{status}</span>;
};