
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Thermometer, Droplet, User, Image, List, Calendar, Plus, Settings, Pen, Clock, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";

// Mock data for the enclosure details
const ENCLOSURE_DATA = [
  {
    id: 1,
    name: "Gargoyle Gecko Enclosure",
    temperature: 78,
    humidity: 65,
    lastReading: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    readingStatus: "online",
    image: "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=800&auto=format&fit=crop&q=60",
    inhabitants: [
      { id: 1, name: "Spike", species: "Gargoyle Gecko", age: "3 years" },
      { id: 2, name: "Crest", species: "Gargoyle Gecko", age: "2 years" }
    ],
    hardware: [
      { id: 1, name: "UVB Light", lastMaintenance: "2023-05-15" },
      { id: 2, name: "Heating Pad", lastMaintenance: "2023-06-20" },
      { id: 3, name: "Misting System", lastMaintenance: "2023-07-10" }
    ]
  },
  {
    id: 2,
    name: "Bearded Dragon Habitat",
    temperature: 92,
    humidity: 35,
    lastReading: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    readingStatus: "online",
    image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&auto=format&fit=crop&q=60",
    inhabitants: [
      { id: 1, name: "Rex", species: "Bearded Dragon", age: "4 years" }
    ],
    hardware: [
      { id: 1, name: "Heat Lamp", lastMaintenance: "2023-06-05" },
      { id: 2, name: "UVB Fixture", lastMaintenance: "2023-07-20" }
    ]
  },
  {
    id: 3,
    name: "Ball Python Terrarium",
    temperature: 82,
    humidity: 60,
    lastReading: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    readingStatus: "warning",
    image: "https://images.unsplash.com/photo-1438565434616-3ef039228b15?w=800&auto=format&fit=crop&q=60",
    inhabitants: [
      { id: 1, name: "Monty", species: "Ball Python", age: "5 years" }
    ],
    hardware: [
      { id: 1, name: "Heating Pad", lastMaintenance: "2023-05-25" },
      { id: 2, name: "Thermostat", lastMaintenance: "2023-06-15" }
    ]
  },
  {
    id: 4,
    name: "Leopard Gecko Home",
    temperature: 80,
    humidity: 45,
    lastReading: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
    readingStatus: "offline",
    image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&auto=format&fit=crop&q=60",
    inhabitants: [
      { id: 1, name: "Spots", species: "Leopard Gecko", age: "2 years" },
      { id: 2, name: "Dots", species: "Leopard Gecko", age: "1 year" }
    ],
    hardware: [
      { id: 1, name: "Heat Mat", lastMaintenance: "2023-07-05" },
      { id: 2, name: "LED Light", lastMaintenance: "2023-08-10" }
    ]
  }
];

interface InhabitantFormData {
  name: string;
  species: string;
  age: string;
}

interface HardwareFormData {
  name: string;
  lastMaintenance: string;
}

const Environment = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const enclosureId = Number(searchParams.get("enclosureId"));
  
  const enclosure = ENCLOSURE_DATA.find(e => e.id === enclosureId);
  
  const [imageUrl, setImageUrl] = useState<string>(enclosure?.image || "");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  
  const inhabitantForm = useForm<InhabitantFormData>({
    defaultValues: {
      name: "",
      species: "",
      age: ""
    }
  });
  
  const hardwareForm = useForm<HardwareFormData>({
    defaultValues: {
      name: "",
      lastMaintenance: new Date().toISOString().split('T')[0]
    }
  });
  
  if (!enclosure) {
    return (
      <MainLayout pageTitle="Environment">
        <div className="max-w-[1600px] mx-auto animate-fade-up">
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Enclosure Not Found</h2>
            <p className="text-muted-foreground">
              The requested enclosure could not be found. Please return to the enclosures page.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/enclosures"}>
              Back to Enclosures
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUrl(result);
        setIsImageDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddInhabitant = (data: InhabitantFormData) => {
    console.log("Adding new inhabitant:", data);
    // In a real app, this would update state or make API calls
    inhabitantForm.reset();
  };
  
  const handleAddHardware = (data: HardwareFormData) => {
    console.log("Adding new hardware:", data);
    // In a real app, this would update state or make API calls
    hardwareForm.reset();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTimeSinceLastReading = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500 text-green-50';
      case 'warning': return 'bg-yellow-500 text-yellow-50';
      case 'offline': return 'bg-red-500 text-red-50';
      default: return 'bg-gray-500 text-gray-50';
    }
  };

  return (
    <MainLayout pageTitle={enclosure.name}>
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="glass-card p-8 rounded-2xl mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="relative rounded-lg overflow-hidden h-64 bg-muted">
                <img 
                  src={imageUrl} 
                  alt={enclosure.name} 
                  className="w-full h-full object-cover"
                />
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm">
                      <Image className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Enclosure Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="image-upload">Upload Image</Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload a photo of your enclosure. Supported formats: JPG, PNG, GIF.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{enclosure.name}</h1>
                <Badge className={`${getStatusColor(enclosure.readingStatus)} flex items-center gap-1.5`}>
                  <Activity className="h-3.5 w-3.5" />
                  {enclosure.readingStatus.charAt(0).toUpperCase() + enclosure.readingStatus.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Last reading: {getTimeSinceLastReading(enclosure.lastReading)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="rounded-full p-2 bg-amber-100 text-amber-600">
                      <Thermometer className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="text-2xl font-semibold">{enclosure.temperature}°F</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                      <Droplet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-2xl font-semibold">{enclosure.humidity}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Inhabitants
                </CardTitle>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Add New Inhabitant</SheetTitle>
                    </SheetHeader>
                    <div className="py-6">
                      <Form {...inhabitantForm}>
                        <form onSubmit={inhabitantForm.handleSubmit(handleAddInhabitant)} className="space-y-4">
                          <FormField
                            control={inhabitantForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Name" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={inhabitantForm.control}
                            name="species"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Species</FormLabel>
                                <FormControl>
                                  <Input placeholder="Species" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={inhabitantForm.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input placeholder="Age (e.g. 2 years)" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">Add Inhabitant</Button>
                        </form>
                      </Form>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enclosure.inhabitants.map(inhabitant => (
                  <div key={inhabitant.id} className="flex justify-between items-center p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{inhabitant.name}</p>
                      <p className="text-sm text-muted-foreground">{inhabitant.species} • {inhabitant.age}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Pen className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Hardware & Maintenance
                </CardTitle>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Add New Hardware</SheetTitle>
                    </SheetHeader>
                    <div className="py-6">
                      <Form {...hardwareForm}>
                        <form onSubmit={hardwareForm.handleSubmit(handleAddHardware)} className="space-y-4">
                          <FormField
                            control={hardwareForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hardware Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Hardware Name" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={hardwareForm.control}
                            name="lastMaintenance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Maintenance Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">Add Hardware</Button>
                        </form>
                      </Form>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enclosure.hardware.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-1.5 bg-muted">
                        <List className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          Last Maintenance: {formatDate(item.lastMaintenance)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Pen className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Environment;
