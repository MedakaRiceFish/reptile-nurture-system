
import React, { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { StatCard } from "@/components/ui/dashboard/StatCard";
import { EnclosureList } from "@/components/ui/dashboard/EnclosureList";
import { QuickActions } from "@/components/ui/dashboard/QuickActions";
import { UpcomingSchedule } from "@/components/ui/dashboard/UpcomingSchedule";
import { Bell, CheckSquare, Turtle, TreeDeciduous } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [enclosureCount, setEnclosureCount] = useState<number>(0);
  const [animalCount, setAnimalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the fetchCounts function to prevent unnecessary re-renders
  const fetchCounts = useCallback(async () => {
    if (!user) return;

    try {
      // Use Promise.all to fetch counts in parallel
      const [enclosuresResponse, animalsResponse] = await Promise.all([
        supabase
          .from('enclosures')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('animals')
          .select('*', { count: 'exact', head: true })
      ]);
        
      if (!enclosuresResponse.error && enclosuresResponse.count !== null) {
        setEnclosureCount(enclosuresResponse.count);
      }
      
      if (!animalsResponse.error && animalsResponse.count !== null) {
        setAnimalCount(animalsResponse.count);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCounts();
    
    // Set up optimized subscriptions using a single channel when possible
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'enclosures' 
      }, () => {
        fetchCounts();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'animals' 
      }, () => {
        fetchCounts();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCounts]);

  return (
    <MainLayout pageTitle="Home">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="TOTAL ENCLOSURES"
            value={enclosureCount.toString()}
            icon={<TreeDeciduous className="w-6 h-6" />}
            linkTo="/enclosures"
          />
          <StatCard
            title="TOTAL ANIMALS"
            value={animalCount.toString()}
            icon={<Turtle className="w-6 h-6" />}
            linkTo="/animals"
          />
          <StatCard
            title="ACTIVE ALERTS"
            value="3"
            icon={<Bell className="w-6 h-6" />}
            isAlert={true}
            linkTo="/alerts"
          />
          <StatCard
            title="UPCOMING TASKS"
            value="4"
            icon={<CheckSquare className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <QuickActions />
          <UpcomingSchedule />
        </div>

        <div className="mb-8">
          <EnclosureList />
        </div>
      </div>
    </MainLayout>
  );
}

export default React.memo(Dashboard);
