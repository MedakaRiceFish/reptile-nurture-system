
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BUCKET_NAME = "reptile_images";

export const uploadImage = async (
  file: File, 
  folder: string,
  onSuccess?: (url: string) => void
): Promise<string | null> => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error("You must be logged in to upload images");
      return null;
    }
    
    const userId = session.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        upsert: true,
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      toast.error(`Error uploading image: ${error.message}`);
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);
    
    if (onSuccess) {
      onSuccess(publicUrl);
    }
    
    return publicUrl;
  } catch (error: any) {
    console.error('Error in uploadImage:', error);
    toast.error(`Failed to upload image: ${error.message}`);
    return null;
  }
};

export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl) return false;
    
    // Extract the path from the URL
    const urlObj = new URL(imageUrl);
    const pathMatch = urlObj.pathname.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
    
    if (!pathMatch || !pathMatch[1]) {
      console.error('Could not parse file path from URL:', imageUrl);
      return false;
    }
    
    const filePath = pathMatch[1];
    
    // Delete the file
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error in deleteImage:', error);
    return false;
  }
};
