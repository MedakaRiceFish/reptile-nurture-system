
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/ui/layout/MainLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout pageTitle="Page Not Found">
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <div className="glass-card p-10 rounded-2xl text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-semibold">404</span>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the page you're looking for. The page might have been removed or is temporarily unavailable.
          </p>
          <Button asChild>
            <a href="/">Return to Dashboard</a>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
