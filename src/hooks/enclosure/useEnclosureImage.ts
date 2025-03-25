
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EnclosureState } from "./useEnclosureData";

export const useEnclosureImage = (
  enclosure: EnclosureState | null,
  setEnclosure: React.Dispatch<React.SetStateAction<EnclosureState | null>>
) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlaceholderImage = () => {
    return "https://images.unsplash.com/photo-1585858229735-7be23558d95e?q=80&w=2070&auto=format&fit=crop";
  };

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (enclosure?.id && enclosure.id !== "not-found" && !String(enclosure.id).startsWith("sample-")) {
      const { uploadImage } = await import("@/lib/supabase-storage");
      await uploadImage(file, `enclosures/${enclosure.id}`, async (url) => {
        try {
          const { error } = await supabase
            .from('enclosures')
            .update({ image_url: url })
            .eq('id', enclosure.id);
            
          if (error) throw error;
          
          setEnclosure({
            ...enclosure,
            image_url: url
          });
          
          toast.success("Enclosure image updated successfully!");
        } catch (error: any) {
          console.error('Error updating enclosure image URL:', error);
          toast.error(`Failed to update enclosure: ${error.message}`);
        }
      });
    } else {
      toast.error("Cannot upload image for this enclosure. Please save the enclosure first.");
      setImagePreview(null);
    }
  };

  return {
    imagePreview,
    imageError,
    fileInputRef,
    getPlaceholderImage,
    handlePhotoButtonClick,
    handleImageError,
    handleFileChange
  };
};
