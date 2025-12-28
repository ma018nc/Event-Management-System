import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram
} from "lucide-react";

const Footer = () => {
  const location = useLocation();

  // ❌ Hide footer on ALL admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-slate-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-orange-600" />
              <span className="text-xl font-heading font-bold text-foreground">
                EventVenue.in
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              India's most trusted partner for finding the perfect venue. From Grand Weddings to Corporate Events.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors">
                <Facebook className="h-4 w-4 text-orange-600" />
              </a>
              <a href="#" className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors">
                <Twitter className="h-4 w-4 text-orange-600" />
              </a>
              <a href="#" className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors">
                <Instagram className="h-4 w-4 text-orange-600" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/halls" className="text-sm text-muted-foreground hover:text-orange-600 transition-colors">
                  Browse Venues
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-muted-foreground hover:text-orange-600 transition-colors">
                  Event Types
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-orange-600 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Event Types</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Indian Weddings</li>
              <li className="text-sm text-muted-foreground">Corporate Diwali Parties</li>
              <li className="text-sm text-muted-foreground">Birthday Bashes</li>
              <li className="text-sm text-muted-foreground">Cultural Festivals</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                Bhopal (M.P), India
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-orange-600 flex-shrink-0" />
                +91 6201839181
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-orange-600 flex-shrink-0" />
                namaste@eventvenue.in
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} EventVenue.in</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
