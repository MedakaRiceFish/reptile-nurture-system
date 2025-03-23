
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface NotesSectionProps {
  animal: any;
  animalNotes: {date: string, note: string}[];
  setAnimalNotes: React.Dispatch<React.SetStateAction<{date: string, note: string}[]>>;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  animal,
  animalNotes,
  setAnimalNotes,
}) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();

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

  return (
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
          <div className="p-4 bg-muted/40 rounded-md mt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="text-sm">{animal.description}</p>
          </div>
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
  );
};
