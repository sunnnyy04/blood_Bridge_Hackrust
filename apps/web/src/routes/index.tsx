import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  Users,
  Zap,
  ArrowRight,
  DropletIcon,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 via-white to-red-50 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="w-fit bg-red-100 text-red-700 hover:bg-red-100">
                <DropletIcon className="w-3 h-3 mr-1" />
                Save Lives Today
              </Badge>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Connect Donors & Hospitals
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Blood Bridge connects generous blood donors with hospitals in
                need. Register as a donor, get matched based on location and
                blood type, and help save lives in your community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/donor-register">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                    Become a Donor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/hospital-register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Register Hospital
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500">
                Already registered?{" "}
                <Link to="/login" className="text-red-600 font-semibold hover:text-red-700">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="relative hidden md:block">
              <div className="w-full h-96 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl shadow-lg flex items-center justify-center">
                <Heart className="w-40 h-40 text-red-400 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to connect donors with hospitals
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-red-50 rounded-2xl p-8 h-full">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Register as Donor
                </h3>
                <p className="text-gray-600">
                  Sign up with your blood type, location, and contact details to
                  join our donor network.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-blue-50 rounded-2xl p-8 h-full">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Location Matching
                </h3>
                <p className="text-gray-600">
                  Our system identifies donors nearest to hospitals requesting
                  blood based on GPS coordinates.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-green-50 rounded-2xl p-8 h-full">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Get Notified
                </h3>
                <p className="text-gray-600">
                  Donors receive instant notifications about blood requests from
                  nearby hospitals matching their blood type (when eligible).
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="bg-purple-50 rounded-2xl p-8 h-full">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Complete & Start Recovery
                </h3>
                <p className="text-gray-600">
                  You complete the donation and save a life. Enjoy your well-deserved 4-month break.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            {/* Step 5 */}
            <div>
              <div className="bg-orange-50 rounded-2xl p-8 h-full">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  5
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Come Back Stronger
                </h3>
                <p className="text-gray-600">
                  After 4 months, you're eligible again and we'll welcome you back to help more lives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">
            Why Choose Blood Bridge?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Smart Location Matching</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Our GPS-based system identifies and notifies the nearest available
                donors, ensuring quick response times and efficient blood supply
                management.
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Instant Notifications</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Real-time alerts keep donors informed about urgent blood requests
                in their area, enabling faster response and potentially lifesaving
                interventions.
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Join thousands of donors making a real difference in their
                communities. Every donation can save multiple lives.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Donor Benefits Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl p-8 border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              We Respect Your Health & Recovery
            </h3>
            <p className="text-gray-700 mb-4">
              After you donate blood, your body needs time to recover and regenerate. That's why we have a 
              <strong> 4-month cooling-off period</strong> where you won't receive any notifications or requests. 
              This ensures you can focus on your health and recovery without any pressure.
            </p>
            <p className="text-gray-600 text-sm">
              After 4 months, you're welcome to donate again, and we'll notify you when your blood type is needed in your area.
            </p>
          </div>
        </div>
      </section>

      {/* For Donors Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                For Blood Donors
              </h3>
              <ul className="space-y-4">
                {[
                  "Register once with your blood type and location",
                  "Receive notifications only when your blood type is needed nearby",
                  "4-month cooldown period after donation - no interruptions while you recover",
                  "Control your donation schedule and preferences",
                  "Track your donation history and impact",
                  "Access health guidelines and donor resources",
                  "Connect directly with hospitals",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/donor-register" className="mt-8 block">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  Register as Donor
                </Button>
              </Link>
            </div>
            <div className="bg-red-50 rounded-2xl p-8 h-96 flex items-center justify-center">
              <Heart className="w-32 h-32 text-red-300" />
            </div>
          </div>
        </div>
      </section>

      {/* For Hospitals Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-blue-50 rounded-2xl p-8 h-96 flex items-center justify-center order-2 md:order-1">
              <Users className="w-32 h-32 text-blue-300" />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                For Hospitals
              </h3>
              <ul className="space-y-4">
                {[
                  "Post blood requests with specific blood types",
                  "Access a network of nearby verified donors",
                  "Receive instant donor responses and confirmations",
                  "Manage your blood inventory efficiently",
                  "Track donor availability in your area",
                  "Reduce blood shortages and emergency response times",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/hospital-register" className="mt-8 block">
                <Button size="lg" variant="outline">
                  Register Hospital
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-red-100">
            Join Blood Bridge today and become part of a life-saving community.
            Whether you're a donor or a hospital, we're here to help you connect
            and save lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/donor-register">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-50 w-full sm:w-auto"
              >
                Start Donating
              </Button>
            </Link>
            <Link to="/hospital-register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Register Hospital
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Blood Bridge</h4>
              <p className="text-sm">Connecting donors with hospitals to save lives.</p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">For Donors</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/donor-register" className="hover:text-white">Register</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/about" className="hover:text-white">Learn More</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">For Hospitals</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/hospital-register" className="hover:text-white">Register</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/about" className="hover:text-white">Learn More</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Org</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Blood Bridge. All rights reserved. Saving lives, one donation at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
