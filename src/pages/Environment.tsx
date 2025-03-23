import React, { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Thermometer, Droplet, Sun, Wind, AlertTriangle, Monitor, Users, Lock, Turtle, Leaf, Camera } from "lucide-react";
import { format } from "date-fns";
import { ANIMALS_DATA } from "@/data/animalsData";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [enclosures, setEnclosures] = useState(enclosureData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
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

  if (!enclosure) {
    return (
      <MainLayout pageTitle="Enclosure Not Found">
        <div className="max-w-[1200px] mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Enclosure Not Found</h2>
            <p className="mb-6">We couldn't find an enclosure with the ID {id}.</p>
            <Button onClick={() => navigate("/enclosures")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Enclosures
            </Button>
          </div>
        </div>
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
        <div className="mb-6 flex items-center">
          <Button variant="outline" onClick={() => navigate("/enclosures")} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{enclosure.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <div className="relative">
                <img 
                  src={imageError ? getPlaceholderImage() : (imagePreview || enclosure.image)} 
                  alt={enclosure.name} 
                  className="w-full h-[300px] object-cover rounded-t-lg"
                  onError={handleImageError}
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button size="sm" variant="secondary" className="h-8" onClick={handlePhotoButtonClick}>
                    <Camera className="w-4 h-4 mr-1" />
                    Upload Photo
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <Thermometer className="h-6 w-6 mb-2 text-muted-foreground" />
                    <span className={`text-2xl font-semibold ${getTemperatureColor(enclosure.temperature)}`}>
                      {enclosure.temperature}°F
                    </span>
                    <span className="text-sm text-muted-foreground">Temperature</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <Droplet className="h-6 w-6 mb-2 text-muted-foreground" />
                    <span className={`text-2xl font-semibold ${getHumidityColor(enclosure.humidity)}`}>
                      {enclosure.humidity}%
                    </span>
                    <span className="text-sm text-muted-foreground">Humidity</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <Sun className="h-6 w-6 mb-2 text-muted-foreground" />
                    <span className="text-2xl font-semibold">12/12</span>
                    <span className="text-sm text-muted-foreground">Light Cycle</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <Wind className="h-6 w-6 mb-2 text-muted-foreground" />
                    <span className="text-2xl font-semibold">Low</span>
                    <span className="text-sm text-muted-foreground">Ventilation</span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Last reading: {format(enclosure.lastReading, "PPp")}
                  {enclosure.readingStatus !== "online" && (
                    <span className="flex items-center mt-2 text-amber-500">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {enclosure.readingStatus === "warning" 
                        ? "Sensor readings delayed. Check connection." 
                        : "Sensors offline. Maintenance required."}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  Inhabitants
                </CardTitle>
                <CardDescription>
                  Animals living in this enclosure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enclosure.inhabitants.map((animal) => {
                    const animalData = ANIMALS_DATA.find(a => a.name === animal.name) || 
                                      { id: animal.id, name: animal.name };
                    
                    return (
                      <Link 
                        key={animal.name} 
                        to={`/animal/${animalData.id}`}
                        className="flex items-center p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-reptile-100 flex items-center justify-center mr-3">
                          <Turtle className="h-5 w-5 text-reptile-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{animal.name}</h4>
                          <p className="text-sm text-muted-foreground">{animal.species} • {animal.age}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-muted-foreground" />
                  Environment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={`${getStatusColor(enclosure.readingStatus)} text-white`}>
                      {enclosure.readingStatus === "online" ? "Online" : 
                      enclosure.readingStatus === "warning" ? "Warning" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{enclosure.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{enclosure.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Substrate:</span>
                    <span>{enclosure.substrate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plants:</span>
                    <span>{enclosure.plants.join(", ")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Environment Overview</CardTitle>
                <CardDescription>
                  Comprehensive view of the enclosure's environmental conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  This {enclosure.type.toLowerCase()} environment is designed to replicate the natural habitat for {enclosure.inhabitants.map(i => i.species).join(" and ")}. It maintains optimal temperature and humidity levels with automated systems.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Climate Control</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                          <Thermometer className="h-3 w-3 text-reptile-600" />
                        </span>
                        <span>Daytime temperature: {enclosure.temperature}°F (regulated)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                          <Thermometer className="h-3 w-3 text-reptile-600" />
                        </span>
                        <span>Nighttime temperature: {enclosure.temperature - 5}°F (natural drop)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                          <Droplet className="h-3 w-3 text-reptile-600" />
                        </span>
                        <span>Humidity maintained at {enclosure.humidity}% with misting system</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                          <Sun className="h-3 w-3 text-reptile-600" />
                        </span>
                        <span>UVB lighting on 12-hour cycle with sunrise/sunset simulation</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Monitoring</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                          <Monitor className="h-3 w-3 text-reptile-600" />
                        </span>
                        <span>Wireless sensors with real-time data collection</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-reptile-600" />
                        </span>
                        <span>Automated alerts for environmental deviations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                          <Lock className="h-3 w-3 text-reptile-600" />
                        </span>
                        <span>Secure, remote access to system controls</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Temperature & Humidity History</CardTitle>
                <CardDescription>
                  Recorded environmental data for {enclosure.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Date</th>
                        <th className="text-left pb-2">Temperature</th>
                        <th className="text-left pb-2">Humidity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enclosure.history.map((record, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3">{record.date}</td>
                          <td className={`py-3 ${getTemperatureColor(record.temp)}`}>
                            {record.temp}°F
                          </td>
                          <td className={`py-3 ${getHumidityColor(record.humidity)}`}>
                            {record.humidity}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>
                  Upcoming and past maintenance activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-12">
                  Maintenance schedule information will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Environment Settings</CardTitle>
                <CardDescription>
                  Configure the enclosure environment settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-12">
                  Environment control settings will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Environment;
