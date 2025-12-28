import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
const API_BASE = "/api";
const Events = () => {
  const eventTypes = [
    {
      title: "Big Fat Indian Weddings",
      icon: "💍",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      description:
        "From Haldi and Mehendi to the Sangeet and Reception. We have venues that can accommodate the grandeur of Indian weddings.",
      features: [
        "Spacious halls for Sangeet",
        "Dedicated Mandap areas",
        "Bridal rooms",
        "Late night music permissions",
      ],
      price: "From ₹1.5 Lakhs",
    },
    {
      title: "Corporate & Diwali Parties",
      icon: "💼",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
      description:
        "Professional venues for conferences and annual Diwali parties. Impress clients with premium hospitality.",
      features: [
        "High-speed WiFi & Projectors",
        "Buffet catering areas",
        "Business lounges",
      ],
      price: "From ₹50,000",
    },
    {
      title: "Birthday Bashes",
      icon: "🎂",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      description:
        "Celebrate 1st birthdays or 50th jubilees. Perfect spots for kids' magic shows or elegant family dinners.",
      features: [
        "Theme decoration support",
        "Play areas for kids",
        "DJ and Music systems",
      ],
      price: "From ₹20,000",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Event Categories</h1>
          <p className="text-lg text-muted-foreground">Discover the perfect venue for every Indian celebration.</p>
        </div>

        <div className="space-y-8">
          {eventTypes.map((event, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md flex flex-col lg:flex-row">
              <div className="lg:w-1/3 h-64 lg:h-auto relative">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 text-4xl">{event.icon}</div>
              </div>
              <div className="p-8 lg:w-2/3">
                <h2 className="text-2xl font-bold mb-2 text-orange-600">{event.title}</h2>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {event.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-500">
                      <span className="text-green-500 mr-2">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="font-bold text-lg">{event.price}</span>
                  <Link to="/halls">
                    <Button className="bg-orange-600 hover:bg-orange-700">Browse Venues <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;