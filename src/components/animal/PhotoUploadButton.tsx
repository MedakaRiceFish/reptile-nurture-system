
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface PhotoUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  onFileChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button 
        size="sm" 
        variant="secondary" 
        className="h-8" 
        onClick={handlePhotoButtonClick}
      >
        <Camera className="w-4 h-4 mr-1" />
        Upload
      </Button>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
    </>
  );
};
