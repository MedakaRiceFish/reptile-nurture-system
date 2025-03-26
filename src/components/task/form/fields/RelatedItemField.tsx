
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { useRelatedItems } from '../useRelatedItems';

export interface RelatedItem {
  id: string;
  name: string;
}

export interface RelatedItemFieldProps {
  control: Control<any>;
  relatedType: 'animal' | 'enclosure' | 'hardware';
}

export function RelatedItemField({ control, relatedType }: RelatedItemFieldProps) {
  const { items, loading } = useRelatedItems(relatedType);

  return (
    <FormField
      control={control}
      name="related_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Related Item</FormLabel>
          <Select
            disabled={loading}
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : "Select a related item"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
              {items.length === 0 && !loading && (
                <SelectItem value="none" disabled>
                  No items available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
