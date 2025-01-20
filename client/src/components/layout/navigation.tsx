import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Navigation() {
  const { user, logout } = useUser();
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="text-xl font-bold text-gray-900"
            >
              TDP Portal
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
