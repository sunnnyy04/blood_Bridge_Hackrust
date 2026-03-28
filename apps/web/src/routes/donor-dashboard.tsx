import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Heart, Activity, MapPin, Phone, Droplets } from "lucide-react";

export default function DonorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ fulfilledCount: 0, isAvailable: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "donor") {
      window.location.href = "/";
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/donor/stats", {
        headers: {
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const toggleAvailability = async (checked: boolean) => {
    try {
      await fetch("http://localhost:3000/api/auth/donor/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: checked })
      });
      setStats(prev => ({ ...prev, isAvailable: checked }));
    } catch (err) {
      console.error("Failed to update availability", err);
    }
  };

  if (!session || session.user.role !== "donor") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Donor Dashboard</h1>
            <p className="text-muted-foreground">
              Hello, {session.user.name}. Thank you for being a life-saver.
            </p>
          </div>
          <div className="flex items-center gap-4 p-3 bg-white rounded-lg border shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold">Active Status</span>
              <span className="text-xs text-muted-foreground">
                {stats.isAvailable ? "You're visible to hospitals" : "You're currently hidden"}
              </span>
            </div>
            <Switch
              checked={stats.isAvailable}
              onCheckedChange={toggleAvailability}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-red-50 border-red-100 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-red-700">Lives Impacted</CardTitle>
              <Heart className="w-4 h-4 text-red-600 fill-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{stats.fulfilledCount}</div>
              <p className="text-xs text-red-600 mt-1">Successful donations recorded</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-blue-700">Blood Type</CardTitle>
              <Droplets className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{session.user.bloodType}</div>
              <p className="text-xs text-blue-600 mt-1">Ready for compatible requests</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-100 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-green-700">Status</CardTitle>
              <Activity className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {stats.isAvailable ? "Available" : "Away"}
              </div>
              <p className="text-xs text-green-600 mt-1">Toggle to control visibility</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Your details used for emergency outreach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <Phone className="w-4 h-4 text-gray-500" />
                <div className="text-sm">
                  <p className="font-semibold">{session.user.phone || "Not set"}</p>
                  <p className="text-xs text-muted-foreground">WhatsApp Primary</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div className="text-sm">
                  <p className="font-semibold">GPS Location Set</p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.latitude && session.user.longitude
                      ? `${session.user.latitude}, ${session.user.longitude}`
                      : "Coordinates missing"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>What happens during an emergency?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-3">
                <p className="flex gap-2">
                  <span className="font-bold text-red-600">1.</span>
                  A nearby hospital requests your blood type.
                </p>
                <p className="flex gap-2">
                  <span className="font-bold text-red-600">2.</span>
                  You receive a WhatsApp alert with the hospital's details.
                </p>
                <p className="flex gap-2">
                  <span className="font-bold text-red-600">3.</span>
                  Reply "YES" to confirm your availability.
                </p>
                <p className="flex gap-2">
                  <span className="font-bold text-red-600">4.</span>
                  The hospital is notified and will coordinate with you.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/donor-dashboard")({
  component: DonorDashboard,
});
