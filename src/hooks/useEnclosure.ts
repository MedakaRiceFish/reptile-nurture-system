
import { useEnclosureData } from "./enclosure/useEnclosureData";
import { useEnclosureImage } from "./enclosure/useEnclosureImage";
import { useEnclosureUpdate } from "./enclosure/useEnclosureUpdate";
import { getTemperatureColor, getHumidityColor, getStatusColor } from "./enclosure/useEnclosureUtils";

interface UseEnclosureProps {
  id?: string;
}

export const useEnclosure = (props?: UseEnclosureProps) => {
  const { enclosure, setEnclosure, isLoading } = useEnclosureData(props?.id);
  
  const {
    imagePreview,
    imageError,
    fileInputRef,
    getPlaceholderImage,
    handlePhotoButtonClick,
    handleImageError,
    handleFileChange
  } = useEnclosureImage(enclosure, setEnclosure);
  
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleDetailsUpdate
  } = useEnclosureUpdate(enclosure, setEnclosure);

  return {
    enclosure,
    isLoading,
    imagePreview,
    imageError,
    isEditDialogOpen,
    fileInputRef,
    setIsEditDialogOpen,
    getPlaceholderImage,
    handlePhotoButtonClick,
    handleImageError,
    getTemperatureColor,
    getHumidityColor,
    getStatusColor,
    handleFileChange,
    handleDetailsUpdate
  };
};
