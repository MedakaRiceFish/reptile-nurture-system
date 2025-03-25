
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { StatCard } from "@/components/ui/dashboard/StatCard";
import { EnclosureList } from "@/components/ui/dashboard/EnclosureList";
import { SensorChart } from "@/components/ui/dashboard/SensorChart";
import { QuickActions } from "@/components/ui/dashboard/QuickActions";
import { UpcomingSchedule } from "@/components/ui/dashboard/UpcomingSchedule";
import { Bell, Clock, Turtle, TreeDeciduous } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [enclosureCount, setEnclosureCount] = useState<number>(0);
  const [animalCount, setAnimalCount] = useState<number>(0);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;

      try {
        // Get enclosure count
        const { count: enclosuresCount, error: enclosuresError } = await supabase
          .from('enclosures')
          .select('*', { count: 'exact', head: true });
          
        if (!enclosuresError && enclosuresCount !== null) {
          setEnclosureCount(enclosuresCount);
        }
        
        // Get animal count
        const { count: animalsCount, error: animalsError } = await supabase
          .from('animals')
          .select('*', { count: 'exact', head: true });
          
        if (!animalsError && animalsCount !== null) {
          setAnimalCount(animalsCount);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
    
    // Set up subscription for enclosures changes
    const enclosureChannel = supabase
      .channel('enclosure-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'enclosures' 
      }, () => {
        fetchCounts();
      })
      .subscribe();
      
    // Set up subscription for animals changes
    const animalChannel = supabase
      .channel('animal-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'animals' 
      }, () => {
        fetchCounts();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(enclosureChannel);
      supabase.removeChannel(animalChannel);
    };
  }, [user]);

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
            icon={<Clock className="w-6 h-6" />}
          />
        </div>

        <div className="mb-8">
          <SensorChart />
        </div>

        <div className="mb-8">
          <EnclosureList />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActions />
          <UpcomingSchedule />
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
