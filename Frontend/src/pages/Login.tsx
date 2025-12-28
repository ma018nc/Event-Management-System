import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
const API_BASE = "/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  //  AUTO REDIRECT IF COOKIE EXISTS
  useEffect(() => {
    axios
      .get(`${API_BASE}/auth/me`, { withCredentials: true })
      .then((res) => {
        if (res.data?.id) {
          localStorage.setItem("user", JSON.stringify(res.data));
          navigate("/dashboard");
        }
      })
      .catch(() => {
        console.log("Not logged in");
      });
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      console.log("✅ Login response:", res.data);
      const user = res.data.user;

      localStorage.setItem("user", JSON.stringify(user));
      toast.success(`Welcome ${user.full_name}`);

      // Redirect admin to admin dashboard, regular users to user dashboard
      if (user.is_admin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      console.error("Error response:", err?.response);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Login failed. Please check credentials.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="glass-card p-8 animate-scale-in">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-2xl font-heading font-bold gradient-text">
                EventVenue
              </span>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to manage your bookings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-gradient text-lg py-6"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
