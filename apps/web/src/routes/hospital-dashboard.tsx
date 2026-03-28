import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BloodMap from "@/components/Map";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AvailableDonor {
  id: string;
  phone: string;
  bloodType: string;
}

interface BloodRequest {
  id: string;
  bloodType: string;
  requestType: "blood" | "plasma";
  status: "pending" | "assigned" | "completed" | "cancelled";
  recipientsNotified: number;
  assignedDonorName?: string;
  assignedDonorPhone?: string;
  createdAt: string;
}

export default function HospitalDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("");
  const [requestType, setRequestType] = useState<"blood" | "plasma">("blood");
  const [availableDonors, setAvailableDonors] = useState<AvailableDonor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [currentRadius, setCurrentRadius] = useState(5);
  const [notifiedDonors, setNotifiedDonors] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, number> | null>(null);
  const [lastRequestedBloodType, setLastRequestedBloodType] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session?.user?.role !== "hospital") {
      window.location.href = "/";
    }
  }, [session]);

  const fetchAvailableDonors = async () => {
    setLoadingDonors(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/blood/donors/available`,
      );
      const data = await response.json();
      setAvailableDonors(data.donors || []);
    } catch {
      console.error("Failed to fetch available donors");
    } finally {
      setLoadingDonors(false);
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/blood/requests`);
      const data = await response.json();

      const sortedRequests = (data.requests || []).sort((a: BloodRequest, b: BloodRequest) => {
        const isAFinished = a.status === 'completed' || a.status === 'cancelled';
        const isBFinished = b.status === 'completed' || b.status === 'cancelled';

        if (isAFinished && !isBFinished) return 1;
        if (!isAFinished && isBFinished) return -1;

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setRequests(sortedRequests);
    } catch {
      console.error("Failed to fetch requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchAvailableDonors();
    fetchRequests();
    const interval = setInterval(() => {
      fetchAvailableDonors();
      fetchRequests();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesBloodType = filterBloodType === "all" || req.bloodType === filterBloodType;
    const matchesSearch =
      searchTerm === "" ||
      req.assignedDonorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.assignedDonorPhone?.includes(searchTerm) ||
      req.bloodType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesBloodType && matchesSearch;
  });

  const handleRequestBlood = async (radius = 5) => {
    if (!selectedBloodType && !lastRequestedBloodType) {
      setMessage("Please select a blood type");
      return;
    }

    const bloodTypeToUse = selectedBloodType || lastRequestedBloodType;
    setLoading(true);
    setMessage("");
    setSuggestions(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/blood/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bloodType: bloodTypeToUse,
          hospitalId: session?.user?.id,
          radiusKm: radius,
          requestType: requestType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentRadius(radius);
        if (data.notifiedCount === 0 && data.suggestions) {
          setSuggestions(data.suggestions);
          setLastRequestedBloodType(bloodTypeToUse);
          setMessage(`No donors found within ${radius}km. See suggestions below.`);
          setNotifiedDonors([]);
        } else {
          setMessage(
            `Request sent! ${data.notifiedCount} donors notified within ${radius}km.`,
          );
          setSuggestions(null);
          setNotifiedDonors(data.nearbyDonors || []);
        }
        fetchRequests();
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setMessage("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "complete" | "cancel") => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/blood/requests/${id}/${status}`, {
        method: "POST",
      });
      fetchRequests();
    } catch {
      console.error(`Failed to ${status} request`);
    }
  };

  if (!session || session.user.role !== "hospital") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hospital Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.hospitalName || session.user.name}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Location: {session.user.latitude}, {session.user.longitude}
          </Badge>
        </div>

        {session.user.latitude && session.user.longitude && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b py-3 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold">Live Outreach Map</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-[10px] text-muted-foreground">Hospital</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span className="text-[10px] text-muted-foreground">Donors Notified</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <BloodMap
                hospitalCoords={[(session.user.latitude), (session.user.longitude)]}
                donors={notifiedDonors}
                searchRadius={currentRadius}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Request Blood</CardTitle>
              <CardDescription>
                Send an urgent alert to nearby donors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Tabs
                  value={requestType}
                  onValueChange={(v) => setRequestType(v as any)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="blood">Blood</TabsTrigger>
                    <TabsTrigger value="plasma">Plasma</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType">Required Blood Group</Label>

                <Select
                  value={selectedBloodType}
                  onValueChange={setSelectedBloodType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => handleRequestBlood(5)}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? "Sending..." : "Request Blood"}
              </Button>

              {message && (
                <p className={`text-sm text-center ${message.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                  {message}
                </p>
              )}

              {suggestions && (
                <div className="pt-4 border-t space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expand search radius:</p>
                  <div className="flex flex-col gap-2">
                    {Object.entries(suggestions).map(([radius, count]) => (
                      <Button
                        key={radius}
                        variant="outline"
                        size="sm"
                        className="flex justify-between items-center"
                        onClick={() => handleRequestBlood(parseInt(radius))}
                        disabled={loading || count === 0}
                      >
                        <span>{radius} km</span>
                        <span className="text-xs text-muted-foreground">{count} donors found</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Active Donors</CardTitle>
              <CardDescription>
                Donors ready for immediate coordination
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDonors && availableDonors.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : availableDonors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No donors available at the moment.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableDonors.map((donor) => (
                    <div key={donor.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{donor.phone}</span>
                        <span className="text-xs text-muted-foreground">Status: Ready</span>
                      </div>
                      <Badge variant="destructive">{donor.bloodType}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Tracking</CardTitle>
            <CardDescription>
              Monitor and filter your blood requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search donor name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBloodType} onValueChange={setFilterBloodType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Blood Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {BLOOD_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(filterStatus !== 'all' || filterBloodType !== 'all' || searchTerm !== '') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterBloodType('all');
                      setSearchTerm('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {loadingRequests && requests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Loading request history...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                {requests.length > 0 ? "No requests match your filters." : "No recent requests found."}
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Donor</TableHead>
                      <TableHead>Notified</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req) => (
                      <TableRow key={req.id} className={req.status === 'completed' || req.status === 'cancelled' ? 'opacity-60' : ''}>
                        <TableCell className="capitalize font-medium text-xs text-muted-foreground">{req.requestType}</TableCell>
                        <TableCell className="font-bold text-red-600">{req.bloodType}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              req.status === 'pending' ? 'outline' :
                                req.status === 'assigned' ? 'default' :
                                  req.status === 'completed' ? 'secondary' :
                                    'outline'
                            }
                            className={
                              req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                req.status === 'assigned' ? 'bg-blue-600 text-white' :
                                  req.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                    'text-gray-500'
                            }
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {req.status === 'assigned' ? (
                            <div className="text-xs">
                              <p className="font-semibold">{req.assignedDonorName}</p>
                              <p className="text-muted-foreground">{req.assignedDonorPhone}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{req.recipientsNotified}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status !== 'completed' && req.status !== 'cancelled' ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(req.id, 'complete')}
                              >
                                Mark Fulfilled
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-muted-foreground"
                                onClick={() => handleUpdateStatus(req.id, 'cancel')}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Finished</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/hospital-dashboard")({
  component: HospitalDashboard,
});
