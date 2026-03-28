import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: session } = useSession();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Data</h1>
      {session ? (
        <Card>
          <CardHeader>
            <CardTitle>{session.user.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Email:</strong> {session.user.email}
            </p>
            <p>
              <strong>Role:</strong> {session.user.role}
            </p>
            <p>
              <strong>Blood Type:</strong> {session.user.bloodType || "Not set"}
            </p>
            <p>
              <strong>Phone:</strong> {session.user.phone || "Not set"}
            </p>
            <p>
              <strong>Latitude:</strong> {session.user.latitude || "Not set"}
            </p>
            <p>
              <strong>Longitude:</strong> {session.user.longitude || "Not set"}
            </p>
            {session.user.hospitalName && (
              <p>
                <strong>Hospital Name:</strong> {session.user.hospitalName}
              </p>
            )}
            {session.user.contactName && (
              <p>
                <strong>Contact Name:</strong> {session.user.contactName}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome to Blood Bridge</h1>
          <p className="text-gray-600">Please login to view your profile</p>
        </div>
      )}
    </div>
  );
}
