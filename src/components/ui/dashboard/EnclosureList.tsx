
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { EnclosureGridView } from "./EnclosureGridView";
import { EnclosureListView } from "./EnclosureListView";
import { Enclosure, EnclosureListProps } from "@/types/enclosure";
import { 
  INITIAL_ENCLOSURE_DATA, 
  getRandomPlaceholderImage, 
  getTemperatureColor, 
  getHumidityColor 
} from "@/utils/enclosureHelpers";

export function EnclosureList({ viewMode = "grid" }: EnclosureListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEnclosures = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('enclosures')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map database data to the format expected by the component
        const mappedData = data.map(enclosure => ({
          id: enclosure.id,
          name: enclosure.name,
          temperature: enclosure.temperature || 75,
          humidity: enclosure.humidity || 50,
          light: 120, // Default values for fields not in DB
          pressure: 1013,
          image: enclosure.image_url || getRandomPlaceholderImage(),
          readingStatus: enclosure.reading_status || "Active"
        }));
        setEnclosures(mappedData);
      } else {
        setEnclosures([]);
      }
    } catch (error: any) {
      console.error('Error fetching enclosures:', error);
      toast({
        title: "Failed to load enclosures",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnclosures();
    
    // Set up real-time subscription for enclosure changes
    const channel = supabase
      .channel('enclosures-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'enclosures' 
      }, (payload) => {
        console.log('Enclosure change detected:', payload);
        fetchEnclosures(); // Refetch all enclosures when there's a change
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleEnclosureClick = (id: string | number) => {
    navigate(`/enclosure/${id}`);
  };

  const handleUpdateValues = (id: string | number, values: { temperature: number; humidity: number }) => {
    setEnclosures(prevEnclosures => 
      prevEnclosures.map(enclosure => 
        enclosure.id === id 
          ? { ...enclosure, ...values } 
          : enclosure
      )
    );

    toast({
      title: "Environment updated",
      description: `Enclosure #${id} temperature and humidity have been updated.`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="h-64 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (enclosures.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-4">No enclosures found. Add your first enclosure to get started!</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <EnclosureListView 
        enclosures={enclosures}
        handleEnclosureClick={handleEnclosureClick}
        handleUpdateValues={handleUpdateValues}
        getTemperatureColor={getTemperatureColor}
        getHumidityColor={getHumidityColor}
      />
    );
  }

  return (
    <EnclosureGridView 
      enclosures={enclosures}
      handleEnclosureClick={handleEnclosureClick}
      handleUpdateValues={handleUpdateValues}
      getTemperatureColor={getTemperatureColor}
      getHumidityColor={getHumidityColor}
    />
  );
}
