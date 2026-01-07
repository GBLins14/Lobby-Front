import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ResidentDashboard from "./dashboards/ResidentDashboard";
import DoormanDashboard from "./dashboards/DoormanDashboard";
import SyndicDashboard from "./dashboards/SyndicDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const role = user.role?.toUpperCase();

  switch (role) {
    case "ADMIN":
    case "BUSINESS":
      return <AdminDashboard />;
    case "RESIDENT":
      return <ResidentDashboard />;
    case "DOORMAN":
      return <DoormanDashboard />;
    case "SYNDIC":
      return <SyndicDashboard />;
    default:
      return <ResidentDashboard />;
  }
}
