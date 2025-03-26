
import React, { useState, useEffect } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { TaskFormSchema } from "../TaskFormSchema";

interface RelatedItem {
  id: string;
  name: string;
}

interface RelatedItemFieldProps {
  control: Control<TaskFormSchema>;
  relatedType: "enclosure" | "hardware" | "animal";
}

export function RelatedItemField({ control, relatedType }: RelatedItemFieldProps) {
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  
  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        let data: RelatedItem[] = [];
        let tableName = "";
        
        switch (relatedType) {
          case "enclosure":
            tableName = "enclosures";
            break;
          case "animal":
            tableName = "animals";
            break;
          case "hardware":
            tableName = "hardware_devices";
            break;
        }
        
        const { data: fetchedData } = await supabase
          .from(tableName)
          .select('id, name');
        
        if (fetchedData) {
          data = fetchedData;
        }
        
        setRelatedItems(data);
      } catch (error) {
        console.error(`Error fetching ${relatedType} items:`, error);
      }
    };
    
    fetchRelatedItems();
  }, [relatedType]);

  return (
    <FormField
      control={control}
      name="related_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select {relatedType}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${relatedType}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {relatedItems.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
