import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface ProtectedRouteProps {
  isAdmin?: boolean;
}

const API_BASE = "/api";

const ProtectedRoute = ({ isAdmin = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated via backend
    axios
      .get(`${API_BASE}/auth/me`, { withCredentials: true })
      .then((res) => {
        if (res.data?.id) {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        }
        setLoading(false);
      })
      .catch(() => {
        // If backend says not authenticated, clear localStorage
        localStorage.removeItem("user");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
