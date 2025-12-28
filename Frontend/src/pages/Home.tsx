import { useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, MapPin, Users, Star } from "lucide-react"

const Home = () => {
  const navigate = useNavigate()

  //  BLOCK ACCESS IF NOT LOGGED IN
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!user?.id) {
      navigate("/login")
    }
  }, [])

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Easy Booking",
      description: "Simple 3-step process to book your dream venue",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Prime Locations",
      description: "Venues in Mumbai, Delhi, Bangalore & more",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Grand Capacity",
      description: "From 50 to 2000+ guests for big fat weddings",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Top Rated",
      description: "Trusted by thousands of Indian families",
    },
  ]

  return (
    <div className="min-h-screen">
      
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"
            alt="Indian Wedding Venue"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Plan Your
              <span className="text-orange-400 block">
                Shadi & Celebrations
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Discover stunning venues for Weddings, Sangeet, Corporate
              Events, and Parties across India.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/halls">
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-lg px-8"
                >
                  Book a Venue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg text-black border-white hover:bg-white/20 hover:text-white"
                >
                  View Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Us?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-4">
                  {feature.icon}
                </div>

                <h3 className="font-heading font-semibold text-lg mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-orange-600 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to Book?
            </h2>

            <p className="text-lg mb-8 text-white/90">
              Join thousands of satisfied families who trusted
              us with their special moments.
            </p>

            <Link to="/halls">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg bg-white text-orange-600 hover:bg-gray-100"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
