import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import Halls from "./pages/Halls";
import HallDetail from "./pages/HallDetail";
import BookingDetail from "./pages/BookingDetail";
import AdminDashboard from "./pages/AdminDashboard";
import ChatWidget from "@/components/chatbot";

import ProtectedRoute from "@/components/ProtectedRoute";

const App = () => (
  <>
    <Toaster />
    <Sonner />

    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/halls" element={<Halls />} />
            <Route path="/halls/:id" element={<HallDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/booking/:id" element={<BookingDetail />} />
            </Route>
            {/* Admin Routes */}
            <Route element={<ProtectedRoute isAdmin={true} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>

      {/* Chat Widget - will be available on all pages */}
      <ChatWidget />
    </BrowserRouter>
  </>
);

export default App;
