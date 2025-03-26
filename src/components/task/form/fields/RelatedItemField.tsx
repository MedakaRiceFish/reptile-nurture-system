
import React, { useEffect } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { useRelatedItems } from '../useRelatedItems';

interface RelatedItemFieldProps {
  disabled?: boolean;
}

export function RelatedItemField({ disabled }: RelatedItemFieldProps) {
  const form = useFormContext();
  const relatedType = form.watch('related_type');
  const { items, isLoading } = useRelatedItems(relatedType);
  
  // Reset related_id when type changes
  useEffect(() => {
    form.setValue('related_id', undefined);
  }, [relatedType, form]);
  
  if (!relatedType) {
    return null;
  }
  
  return (
    <FormField
      control={form.control}
      name="related_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {relatedType === 'enclosure' ? 'Enclosure' : 
             relatedType === 'animal' ? 'Animal' : 
             relatedType === 'hardware' ? 'Hardware Device' : 
             'Related Item'}
          </FormLabel>
          <Select
            disabled={disabled || isLoading || items.length === 0}
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoading ? "Loading..." : 
                  items.length === 0 ? `No ${relatedType}s found` : 
                  `Select ${relatedType}`
                } />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item) => (
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
