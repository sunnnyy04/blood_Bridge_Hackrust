import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const RootLayout = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-red-600">
            Blood Bridge
          </Link>
          <nav className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-gray-600">
                  {session.user.name}
                </span>
                {session.user.role === "hospital" && (
                  <Link to="/hospital-dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                {session.user.role === "donor" && (
                  <Link to="/donor-dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/donor-register">
                  <Button size="sm">Register as Donor</Button>
                </Link>
                <Link to="/hospital-register">
                  <Button variant="outline" size="sm">
                    Register Hospital
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  );
};

export const Route = createRootRoute({ component: RootLayout });
