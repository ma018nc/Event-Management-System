import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar, User, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "/api";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setIsAdmin(parsed?.is_admin === true);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  }, [location.pathname]);

  // Auto close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const signOut = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
    } catch {}

    localStorage.removeItem("user");
    setUser(null);
    setIsAdmin(false);
    window.location.href = "/login";
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Halls", path: "/halls" },
    { name: "Events", path: "/events" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-2 group">
            <Calendar className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-heading font-bold gradient-text">
              EventVenue
            </span>
          </Link>

          {/* ---------------- DESKTOP NAV LINKS ---------------- */}
          {/* ❌ Hide links completely for ADMIN */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium relative group transition-colors ${
                    isActive(link.path)
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-primary transition-all ${
                      isActive(link.path)
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
            </div>
          )}

          {/* ---------------- DESKTOP AUTH ---------------- */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* ADMIN */}
                {isAdmin && (
                  <Link to="/admin/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}

                {/* USER */}
                {!isAdmin && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/halls">
                  <Button size="sm" className="btn-gradient">
                    Book Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* ---------------- MOBILE DRAWER ---------------- */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-4">

              {/* ❌ Hide nav links for ADMIN */}
              {!isAdmin &&
                navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium px-4 py-2 rounded-lg ${
                      isActive(link.path)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

              <div className="flex flex-col gap-2 px-4 pt-2">
                {user ? (
                  <>
                    {isAdmin ? (
                      <Link to="/admin/dashboard">
                        <Button variant="outline" className="w-full gap-2">
                          <Shield className="h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/dashboard">
                        <Button variant="outline" className="w-full gap-2">
                          <User className="h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" className="w-full gap-2">
                        <User className="h-4 w-4" />
                        Login
                      </Button>
                    </Link>

                    <Link to="/halls">
                      <Button className="w-full btn-gradient">
                        Book Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
