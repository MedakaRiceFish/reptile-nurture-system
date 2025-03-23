import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Edit, Search, Weight, ArrowLeft, Camera, Save, X, Plus, MessageSquare } from "lucide-react";
import { AnimalWeightChart } from "@/components/ui/dashboard/AnimalWeightChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { WeightHistoryList } from "@/components/ui/dashboard/WeightHistoryList";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Initial data for animal details
const ANIMALS_DATA = [
  {
    id: 1,
    name: "Spike",
    species: "Gargoyle Gecko",
    age: 3,
    weight: 35,
    length: 20,
    enclosure: 1,
    enclosureName: "Desert Terrarium",
    feedingSchedule: "Every 2 days",
    breederSource: "Reptile World",
    description: "Friendly and active gecko with distinctive markings. Responds well to handling and has a healthy appetite.",
    image: "https://images.unsplash.com/photo-1597926599906-afd0d4a7ecbf?w=800&auto=format&fit=crop&q=60",
    weightHistory: [
      { date: "2023-08-01", weight: 32 },
      { date: "2023-09-01", weight: 33 },
      { date: "2023-10-01", weight: 34 },
      { date: "2023-11-01", weight: 34 },
      { date: "2023-12-01", weight: 35 },
      { date: "2024-01-01", weight: 35 },
      { date: "2024-02-01", weight: 35 },
    ]
  },
  {
    id: 2,
    name: "Rex",
    species: "Bearded Dragon",
    age: 5,
    weight: 350,
    length: 45,
    enclosure: 2,
    enclosureName: "Large Rock Habitat",
    feedingSchedule: "Daily",
    breederSource: "Exotic Pets Inc.",
    description: "Mature bearded dragon with vibrant coloration. Very docile and enjoys basking under the heat lamp.",
    image: "https://images.unsplash.com/photo-1497339100210-9e87df79c218?w=800&auto=format&fit=crop&q=60",
    weightHistory: [
      { date: "2023-08-01", weight: 340 },
      { date: "2023-09-01", weight: 345 },
      { date: "2023-10-01", weight: 348 },
      { date: "2023-11-01", weight: 350 },
      { date: "2023-12-01", weight: 352 },
      { date: "2024-01-01", weight: 350 },
      { date: "2024-02-01", weight: 350 },
    ]
  },
  {
    id: 3,
    name: "Monty",
    species: "Ball Python",
    age: 8,
    weight: 1200,
    length: 120,
    enclosure: 3,
    enclosureName: "Forest Terrarium",
    feedingSchedule: "Every 7 days",
    breederSource: "Snake Specialists",
    description: "Well-tempered ball python with beautiful patterns. Has never refused a meal and sheds regularly.",
    image: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800&auto=format&fit=crop&q=60",
    weightHistory: [
      { date: "2023-08-01", weight: 1150 },
      { date: "2023-09-01", weight: 1160 },
      { date: "2023-10-01", weight: 1180 },
      { date: "2023-11-01", weight: 1190 },
      { date: "2023-12-01", weight: 1195 },
      { date: "2024-01-01", weight: 1200 },
      { date: "2024-02-01", weight: 1200 },
    ]
  },
  {
    id: 4,
    name: "Leo",
    species: "Leopard Gecko",
    age: 2,
    weight: 28,
    length: 18,
    enclosure: 4,
    enclosureName: "Small Desert Setup",
    feedingSchedule: "Every 2 days",
    breederSource: "Local Breeder",
    description: "Young leopard gecko with vibrant spots. Still growing and has a great appetite for crickets.",
    image: "https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=800&auto=format&fit=crop&q=60",
    weightHistory: [
      { date: "2023-08-01", weight: 20 },
      { date: "2023-09-01", weight: 22 },
      { date: "2023-10-01", weight: 24 },
      { date: "2023-11-01", weight: 25 },
      { date: "2023-12-01", weight: 26 },
      { date: "2024-01-01", weight: 27 },
      { date: "2024-02-01", weight: 28 },
    ]
  },
];

const AnimalRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [newWeightDate, setNewWeightDate] = useState<Date | undefined>(new Date());
  const [newWeight, setNewWeight] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchingEnclosure, setIsSearchingEnclosure] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Find the animal with the matching ID
  const animalId = parseInt(id || "0");
  const [animalData, setAnimalData] = useState(() => 
    ANIMALS_DATA.find(animal => animal.id === animalId)
  );

  // Add animal notes state
  const [animalNotes, setAnimalNotes] = useState<{date: string, note: string}[]>([
    // Initial example note
    {date: format(new Date(), "yyyy-MM-dd"), note: "Initial health assessment complete. Animal appears in good condition."}
  ]);

  const animal = animalData;

  // Handle going back
  const handleBack = () => {
    navigate("/animals");
  };

  // Handle adding a new weight record
  const handleAddWeight = () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }

    if (animal && newWeightDate) {
      const newRecord = {
        date: format(newWeightDate, "yyyy-MM-dd"),
        weight: parseFloat(newWeight)
      };
      
      // In a real app, this would update the database
      const updatedAnimal = {
        ...animal,
        weight: parseFloat(newWeight),
        weightHistory: [...animal.weightHistory, newRecord].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      };
      
      setAnimalData(updatedAnimal);
      
      toast({
        title: "Weight record added",
        description: `New weight of ${newWeight}g recorded for ${animal.name}`,
      });
      
      setIsAddingWeight(false);
      setNewWeight("");
    }
  };

  // Handle photo upload button click
  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && animal) {
          const imageUrl = event.target.result as string;
          setImagePreview(imageUrl);
          
          // In a real app, this would upload the file to a server and get a URL back
          // For now, we'll just update the local state
          setAnimalData({
            ...animal,
            image: imageUrl
          });
          
          toast({
            title: "Photo updated",
            description: `${animal.name}'s photo has been updated successfully`,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle adding a new note
  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({
        title: "Invalid note",
        description: "Please enter a valid note",
        variant: "destructive"
      });
      return;
    }

    const newNoteEntry = {
      date: format(new Date(), "yyyy-MM-dd"),
      note: newNote.trim()
    };
    
    setAnimalNotes([...animalNotes, newNoteEntry]);
    
    toast({
      title: "Note added",
      description: `New note added for ${animal?.name}`,
    });
    
    setIsAddingNote(false);
    setNewNote("");
  };

  // Handle editing the animal details
  const form = useForm({
    defaultValues: {
      name: animal?.name || "",
      species: animal?.species || "",
      age: animal?.age.toString() || "",
      length: animal?.length.toString() || "",
      feedingSchedule: animal?.feedingSchedule || "",
      breederSource: animal?.breederSource || "",
      description: animal?.description || ""
    }
  });

  const handleEditSubmit = (data: any) => {
    if (animal) {
      const updatedAnimal = {
        ...animal,
        name: data.name,
        species: data.species,
        age: parseInt(data.age),
        length: parseInt(data.length),
        feedingSchedule: data.feedingSchedule,
        breederSource: data.breederSource,
        description: data.description
      };
      
      setAnimalData(updatedAnimal);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Animal details updated",
        description: `${data.name}'s details have been updated successfully`,
      });
    }
  };

  // Filter enclosures for search
  const ENCLOSURES = [
    { id: 1, name: "Desert Terrarium" },
    { id: 2, name: "Large Rock Habitat" },
    { id: 3, name: "Forest Terrarium" },
    { id: 4, name: "Small Desert Setup" },
    { id: 5, name: "Tropical Vivarium" },
    { id: 6, name: "Arid Environment" },
  ];

  const filteredEnclosures = ENCLOSURES.filter(enclosure => 
    enclosure.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!animal) {
    return (
      <MainLayout pageTitle="Animal Not Found">
        <div className="max-w-[1200px] mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Animal Not Found</h2>
            <p className="mb-6">We couldn't find an animal with the ID {id}.</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Animals
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle={`${animal.name} - Animal Record`}>
      <div className="max-w-[1200px] mx-auto py-6 animate-fade-up">
        <div className="mb-6 flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{animal.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Image and Basic Info */}
          <Card className="lg:col-span-1">
            <div className="relative">
              <img 
                src={imagePreview || animal.image} 
                alt={animal.name} 
                className="w-full h-[300px] object-cover rounded-t-lg"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button size="sm" variant="secondary" className="h-8" onClick={handlePhotoButtonClick}>
                  <Camera className="w-4 h-4 mr-1" />
                  Upload
                </Button>
                <Button size="sm" variant="secondary" className="h-8" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {/* Hidden file input */}
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Species:</span>
                  <span className="font-medium">{animal.species}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-medium">{animal.age} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Weight:</span>
                  <span className="font-medium">{animal.weight} g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Length:</span>
                  <span className="font-medium">{animal.length} cm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Feeding Schedule:</span>
                  <span className="font-medium">{animal.feedingSchedule}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Enclosure:</span>
                  <Popover open={isSearchingEnclosure} onOpenChange={setIsSearchingEnclosure}>
                    <PopoverTrigger asChild>
                      <Button variant="link" className="p-0 h-auto font-medium text-reptile-600">
                        {animal.enclosureName}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search enclosures..." 
                            className="h-8"
                          />
                        </div>
                        <ScrollArea className="h-72">
                          <div className="space-y-1">
                            {filteredEnclosures.map((enclosure) => (
                              <Button
                                key={enclosure.id}
                                variant="ghost"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                  setIsSearchingEnclosure(false);
                                  // In a real app, this would update the animal's enclosure
                                  if (animal) {
                                    setAnimalData({
                                      ...animal,
                                      enclosure: enclosure.id,
                                      enclosureName: enclosure.name
                                    });
                                    
                                    toast({
                                      title: "Enclosure updated",
                                      description: `${animal.name} has been moved to ${enclosure.name}`,
                                    });
                                  }
                                }}
                              >
                                {enclosure.name}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Breeder Source:</span>
                  <span className="font-medium">{animal.breederSource || "Unknown"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight History and Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Weight Records</CardTitle>
                <div className="flex space-x-2">
                  {isAddingWeight ? (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-9 w-auto justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newWeightDate ? format(newWeightDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newWeightDate}
                            onSelect={(date) => setNewWeightDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        placeholder="Weight (g)"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="w-24 h-9"
                      />
                      <Button size="sm" className="h-9" onClick={handleAddWeight}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" className="h-9" onClick={() => setIsAddingWeight(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setIsAddingWeight(true)}>
                      <Weight className="w-4 h-4 mr-2" />
                      Add Weight
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="pt-2">
                  <AnimalWeightChart weightHistory={animal.weightHistory} />
                </TabsContent>
                <TabsContent value="list">
                  <WeightHistoryList weightHistory={animal.weightHistory} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Description and Notes */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle>Notes & Description</CardTitle>
              <Button onClick={() => setIsAddingNote(true)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Static Description - Added more top margin */}
              <div className="p-4 bg-muted/40 rounded-md mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-sm">{animal.description}</p>
              </div>
              
              {/* Notes Log */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Notes Log</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {animalNotes.map((note, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4 py-1">
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-1 mr-2" />
                        <div>
                          <p className="text-sm text-muted-foreground">{note.date}</p>
                          <p className="text-sm mt-1">{note.note}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Add Note Form */}
              {isAddingNote && (
                <div className="border border-border rounded-md p-4 mt-4">
                  <h3 className="text-sm font-medium mb-2">Add a New Note</h3>
                  <Textarea
                    placeholder="Enter your note here (max 500 characters)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value.slice(0, 500))}
                    className="min-h-[100px] mb-2"
                  />
                  <div className="text-xs text-muted-foreground mb-4">
                    {newNote.length}/500 characters
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddNote}>
                      Save Note
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Animal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Animal Details</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Species</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (years)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (cm)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="feedingSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feeding Schedule</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="breederSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Breeder Source</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AnimalRecord;
