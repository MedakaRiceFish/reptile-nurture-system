
import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { EnvironmentHeader } from "@/components/environment/EnvironmentHeader";
import { EnvironmentImageCard } from "@/components/environment/EnvironmentImageCard";
import { InhabitantsCard } from "@/components/environment/InhabitantsCard";
import { EnvironmentDetailsCard } from "@/components/environment/EnvironmentDetailsCard";
import { EnvironmentTabContent } from "@/components/environment/EnvironmentTabContent";
import { EnvironmentNotFound } from "@/components/environment/EnvironmentNotFound";
import { EditEnvironmentDetailsDialog } from "@/components/ui/dashboard/EditEnvironmentDetailsDialog";

const enclosureData = [
  {
    id: 1,
    name: "Desert Terrarium",
    type: "Arid",
    size: "36\" x 18\" x 18\"",
    substrate: "Desert Sand Mix",
    plants: ["Aloe Vera", "Desert Grass"],
    temperature: 78,
    humidity: 65,
    lastReading: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    readingStatus: "online",
    image: "https://images.unsplash.com/photo-1580502778874-ad1e78d2e252?w=800&auto=format&fit=crop&q=60",
    inhabitants: [
      { id: 1, name: "Spike", species: "Gargoyle Gecko", age: "3 years" },
      { id: 2, name: "Crest", species: "Gargoyle Gecko", age: "2 years" }
    ],
    history: [
      { date: "2024-02-01", temp: 78, humidity: 65 },
      { date: "2024-02-02", temp: 77, humidity: 64 },
      { date: "2024-02-03", temp: 79, humidity: 66 },
      { date: "2024-02-04", temp: 78, humidity: 65 },
    ]
  },
  {
    id: 2,
    name: "Large Rock Habitat",
    type: "Desert",
    size: "48\" x 24\" x 24\"",
    substrate: "Reptile Carpet with Slate Tiles",
    plants: ["Desert Succulent", "Air Plant"],
    temperature: 92,
    humidity: 35,
    lastReading: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    readingStatus: "online",
    image: "https://images.unsplash.com/photo-1534415378365-b8dd2e261c6d?w=800&auto=format&fit=crop&q=60",
    inhabitants: [
      { id: 2, name: "Rex", species: "Bearded Dragon", age: "4 years" }
    ],
    history: [
      { date: "2024-02-01", temp: 91, humidity: 35 },
      { date: "2024-02-02", temp: 92, humidity: 34 },
      { date: "2024-02-03", temp: 93, humidity: 33 },
      { date: "2024-02-04", temp: 92, humidity: 35 },
    ]
  },
  {
    id: 3,
    name: "Forest Terrarium",
    type: "Tropical",
    size: "36\" x 18\" x 36\"",
    substrate: "Coconut Fiber Mix",
    plants: ["Pothos", "Fern", "Moss"],
    temperature: 82,
    humidity: 60,
    lastReading: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    readingStatus: "warning",
    image: "https://images.unsplash.com/photo-1558958806-d5088c734714?w=800&auto=format&fit=crop&q=60",
    inhabitants: [
      { id: 3, name: "Monty", species: "Ball Python", age: "5 years" }
    ],
    history: [
      { date: "2024-02-01", temp: 82, humidity: 60 },
      { date: "2024-02-02", temp: 81, humidity: 62 },
      { date: "2024-02-03", temp: 83, humidity: 61 },
      { date: "2024-02-04", temp: 82, humidity: 60 },
    ]
  },
  {
    id: 4,
    name: "Small Desert Setup",
    type: "Arid",
    size: "24\" x 18\" x 12\"",
    substrate: "Fine Desert Sand",
    plants: ["Small Cactus"],
    temperature: 80,
    humidity: 45,
    lastReading: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
    readingStatus: "offline",
    image: "https://images.unsplash.com/photo-1617775047746-5b89a320f916?w=800&auto=format&fit=crop&q=60",
    inhabitants: [
      { id: 4, name: "Spots", species: "Leopard Gecko", age: "2 years" },
      { id: 2, name: "Dots", species: "Leopard Gecko", age: "1 year" }
    ],
    history: [
      { date: "2024-02-01", temp: 81, humidity: 44 },
      { date: "2024-02-02", temp: 80, humidity: 45 },
      { date: "2024-02-03", temp: 82, humidity: 43 },
      { date: "2024-02-04", temp: 80, humidity: 45 },
    ]
  },
];

const Environment = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [enclosures, setEnclosures] = useState(enclosureData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  
  const enclosureId = parseInt(id || "0");
  const enclosureIndex = enclosures.findIndex(enc => enc.id === enclosureId);
  const enclosure = enclosureIndex !== -1 ? enclosures[enclosureIndex] : null;
  
  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && enclosureIndex !== -1) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageUrl = event.target.result as string;
          setImagePreview(imageUrl);
          setImageError(false);
          
          const updatedEnclosures = [...enclosures];
          updatedEnclosures[enclosureIndex] = {
            ...updatedEnclosures[enclosureIndex],
            image: imageUrl
          };
          setEnclosures(updatedEnclosures);
          
          toast({
            title: "Photo updated",
            description: `${enclosure?.name}'s photo has been updated successfully`,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageError = () => {
    setImageError(true);
  };

  const getPlaceholderImage = () => {
    switch(enclosure?.type) {
      case "Arid":
        return "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=60";
      case "Desert":
        return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=60";
      case "Tropical":
        return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60";
      default:
        return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60";
    }
  };

  const handleSaveEnvironmentDetails = (data: any) => {
    const updatedEnclosures = [...enclosures];
    updatedEnclosures[enclosureIndex] = {
      ...updatedEnclosures[enclosureIndex],
      ...data
    };
    setEnclosures(updatedEnclosures);
    
    toast({
      title: "Environment details updated",
      description: `${enclosure?.name} details have been updated successfully`,
    });
  };

  if (!enclosure) {
    return (
      <MainLayout pageTitle="Enclosure Not Found">
        <EnvironmentNotFound id={id} />
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "offline": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 90) return "text-red-500";
    if (temp < 70) return "text-blue-500";
    return "text-green-500";
  };

  const getHumidityColor = (hum: number) => {
    if (hum > 80) return "text-blue-500";
    if (hum < 40) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <MainLayout pageTitle={`${enclosure.name} - Environment`}>
      <div className="max-w-[1200px] mx-auto py-6">
        <EnvironmentHeader enclosureName={enclosure.name} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <EnvironmentImageCard 
              enclosure={enclosure}
              imagePreview={imagePreview}
              imageError={imageError}
              getPlaceholderImage={getPlaceholderImage}
              handlePhotoButtonClick={handlePhotoButtonClick}
              handleImageError={handleImageError}
              getTemperatureColor={getTemperatureColor}
              getHumidityColor={getHumidityColor}
              onFileChange={handleFileChange}
              fileInputRef={fileInputRef}
            />
          </div>

          <div>
            <InhabitantsCard inhabitants={enclosure.inhabitants} />
            
            <EnvironmentDetailsCard 
              enclosure={enclosure}
              getStatusColor={getStatusColor}
              onEditClick={() => setIsEditingDetails(true)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <EnvironmentTabContent 
            enclosure={enclosure}
            getTemperatureColor={getTemperatureColor}
            getHumidityColor={getHumidityColor}
          />
        </Tabs>
      </div>
      
      <EditEnvironmentDetailsDialog
        isOpen={isEditingDetails}
        onOpenChange={setIsEditingDetails}
        enclosure={enclosure}
        onSave={handleSaveEnvironmentDetails}
      />
    </MainLayout>
  );
};

export default Environment;
