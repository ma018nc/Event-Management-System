import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = "/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  
  //  Handle Input Change

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  // Handle Form Submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE}/contact/`, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || "Contact Form",

        // phone is not in DB → append to message
        message:
          formData.message +
          (formData.phone ? `\n\nPhone: ${formData.phone}` : ""),
      });

      toast.success("Message sent! We'll get back to you soon.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        "Failed to send message. Please try again.";
      toast.error(msg);
    }
  };

  
  // UI Rendering
  
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Page Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
          <p className="text-lg text-muted-foreground">
            Questions? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/*  Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <Label>Full Name</Label>
                <Input
                  name="name"
                  placeholder="Full name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="your@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  type="text"
                  placeholder="6201839181"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Subject</Label>
                <Input
                  name="subject"
                  placeholder="Regarding booking"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  name="message"
                  placeholder="Tell us about your event..."
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Send className="mr-2 h-5 w-5" /> Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm flex gap-4">
              <div className="bg-orange-100 p-3 rounded-full h-12 w-12 flex items-center justify-center">
                <Phone className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold">Phone</h3>
                <p className="text-gray-600">+91 6201839181</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm flex gap-4">
              <div className="bg-orange-100 p-3 rounded-full h-12 w-12 flex items-center justify-center">
                <Mail className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold">Email</h3>
                <p className="text-gray-600">support@eventvenue.in</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm flex gap-4">
              <div className="bg-orange-100 p-3 rounded-full h-12 w-12 flex items-center justify-center">
                <MapPin className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold">Office</h3>
                <p className="text-gray-600">Bhpoal, India</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
