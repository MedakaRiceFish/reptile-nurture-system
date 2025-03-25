
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EnvironmentCard } from "./EnvironmentCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Thermometer, Droplet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnclosureValueEditor } from "./EnclosureValueEditor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Initial enclosure data (fallback when no DB data available)
const INITIAL_ENCLOSURE_DATA = [
  {
    id: "sample-1",
    name: "Gargoyle Gecko Enclosure",
    temperature: 78,
    humidity: 65,
    light: 120,
    pressure: 1013,
    image: "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=800&auto=format&fit=crop&q=60",
    readingStatus: "Active" // Add readingStatus property to sample data
  },
  {
    id: "sample-2",
    name: "Bearded Dragon Habitat",
    temperature: 92,
    humidity: 35,
    light: 250,
    pressure: 1012,
    image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&auto=format&fit=crop&q=60",
    readingStatus: "Active" // Add readingStatus property to sample data
  },
  {
    id: "sample-3",
    name: "Ball Python Terrarium",
    temperature: 82,
    humidity: 60,
    light: 80,
    pressure: 1013,
    image: "https://images.unsplash.com/photo-1438565434616-3ef039228b15?w=800&auto=format&fit=crop&q=60",
    readingStatus: "Active" // Add readingStatus property to sample data
  },
  {
    id: "sample-4",
    name: "Leopard Gecko Home",
    temperature: 80,
    humidity: 45,
    light: 110,
    pressure: 1012,
    image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&auto=format&fit=crop&q=60",
    readingStatus: "Active" // Add readingStatus property to sample data
  },
];

interface EnclosureListProps {
  viewMode?: "grid" | "list";
}

// Updated interface to include all properties including readingStatus
interface Enclosure {
  id: string | number;
  name: string;
  temperature: number;
  humidity: number;
  light: number;
  pressure: number;
  image?: string;
  readingStatus?: string;
}

export function EnclosureList({ viewMode = "grid" }: EnclosureListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enclosures, setEnclosures] = useState<Enclosure[]>(INITIAL_ENCLOSURE_DATA);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnclosures = async () => {
      if (!user) return;
      
      try {
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
    
    fetchEnclosures();
  }, [user, toast]);

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

  const getTemperatureColor = (temp: number) => {
    if (temp > 90) return "text-red-500";
    if (temp < 70) return "text-blue-500";
    return "text-reptile-500";
  };

  const getHumidityColor = (hum: number) => {
    if (hum > 80) return "text-blue-500";
    if (hum < 40) return "text-amber-500";
    return "text-reptile-500";
  };

  const getRandomPlaceholderImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1438565434616-3ef039228b15?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&auto=format&fit=crop&q=60"
    ];
    return images[Math.floor(Math.random() * images.length)];
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

  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enclosure Name</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Humidity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enclosures.map((enclosure) => (
              <TableRow 
                key={enclosure.id} 
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell 
                  className="font-medium"
                  onClick={() => handleEnclosureClick(enclosure.id)}
                >
                  {enclosure.name}
                </TableCell>
                <TableCell 
                  className={getTemperatureColor(enclosure.temperature)}
                  onClick={() => handleEnclosureClick(enclosure.id)}
                >
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    {enclosure.temperature}°F
                  </div>
                </TableCell>
                <TableCell 
                  className={getHumidityColor(enclosure.humidity)}
                  onClick={() => handleEnclosureClick(enclosure.id)}
                >
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    {enclosure.humidity}%
                  </div>
                </TableCell>
                <TableCell onClick={() => handleEnclosureClick(enclosure.id)}>
                  <span className="text-xs px-2 py-0.5 bg-reptile-100 text-reptile-800 rounded-full">
                    {enclosure.readingStatus || "Active"}
                  </span>
                </TableCell>
                <TableCell>
                  <EnclosureValueEditor
                    enclosureId={enclosure.id}
                    enclosureName={enclosure.name}
                    currentTemperature={enclosure.temperature}
                    currentHumidity={enclosure.humidity}
                    onUpdate={handleUpdateValues}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {enclosures.map((enclosure) => (
          <div 
            key={enclosure.id} 
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <EnvironmentCard
              enclosureId={enclosure.id}
              enclosureName={enclosure.name}
              temperature={enclosure.temperature}
              humidity={enclosure.humidity}
              light={enclosure.light}
              pressure={enclosure.pressure}
              image={enclosure.image}
              onClick={() => handleEnclosureClick(enclosure.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
