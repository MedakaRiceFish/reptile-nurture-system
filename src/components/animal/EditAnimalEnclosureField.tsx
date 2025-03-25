
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Control } from "react-hook-form";

interface EditAnimalEnclosureFieldProps {
  control: Control<any>;
}

export const EditAnimalEnclosureField: React.FC<EditAnimalEnclosureFieldProps> = ({ control }) => {
  const [enclosures, setEnclosures] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEnclosures = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('enclosures')
          .select('id, name')
          .order('name', { ascending: true });
          
        if (error) {
          console.error('Error fetching enclosures:', error);
          throw error;
        }
        
        if (data) {
          console.log('Fetched enclosures:', data);
          setEnclosures(data);
        }
      } catch (error) {
        console.error('Error fetching enclosures:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnclosures();
  }, []);

  return (
    <FormField
      control={control}
      name="enclosure_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Enclosure</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an enclosure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {enclosures.length > 0 ? (
                  enclosures.map((enclosure) => (
                    <SelectItem key={enclosure.id} value={enclosure.id}>
                      {enclosure.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="loading">
                    {loading ? "Loading enclosures..." : "No enclosures available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
