
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Turtle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InhabitantsCardProps {
  enclosureId: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  age: number;
}

export const InhabitantsCard: React.FC<InhabitantsCardProps> = ({ enclosureId }) => {
  const [inhabitants, setInhabitants] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInhabitants = async () => {
      if (!enclosureId || enclosureId.startsWith("sample-")) {
        setInhabitants([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('animals')
          .select('id, name, species, age')
          .eq('enclosure_id', enclosureId);
          
        if (error) throw error;
        
        setInhabitants(data || []);
      } catch (error: any) {
        console.error('Error fetching inhabitants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInhabitants();
    
    // Set up realtime subscription for animal changes
    const channel = supabase
      .channel('inhabitants-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'animals',
        filter: `enclosure_id=eq.${enclosureId}`
      }, () => {
        fetchInhabitants();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enclosureId]);

  if (loading) {
    return (
      <Card className="h-full">
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
          <div className="space-y-2 animate-pulse">
            {[1, 2].map((_, index) => (
              <div key={index} className="flex items-center p-2">
                <div className="h-10 w-10 rounded-full bg-muted mr-3"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
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
        {inhabitants.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No animals assigned to this enclosure yet.
          </div>
        ) : (
          <div className="space-y-4">
            {inhabitants.map((animal) => (
              <Link 
                key={animal.id} 
                to={`/animal/${animal.id}`}
                className="flex items-center p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-reptile-100 flex items-center justify-center mr-3">
                  <Turtle className="h-5 w-5 text-reptile-500" />
                </div>
                <div>
                  <h4 className="font-medium">{animal.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {animal.species} • {animal.age} {animal.age === 1 ? 'year' : 'years'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
