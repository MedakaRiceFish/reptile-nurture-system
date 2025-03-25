
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Extra validation to catch any session issues that might not be caught by the auth context
    const checkSession = async () => {
      if (!loading && !user) {
        console.log("Protected route: No user found, redirecting to login");
        navigate("/login", { replace: true });
      }
    };
    
    checkSession();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-reptile-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-reptile-100 rounded mb-3"></div>
          <div className="h-3 w-24 bg-reptile-50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    console.log("Protected route: No session or user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
