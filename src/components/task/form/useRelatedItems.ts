
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type RelatedItem = {
  id: string;
  name: string;
};

export const useRelatedItems = (type: "animal" | "enclosure" | "hardware") => {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchItems = async () => {
      if (!user?.id) return;
      setLoading(true);

      try {
        switch (type) {
          case "animal": {
            const { data, error } = await supabase
              .from("animals")
              .select("id, name")
              .eq("owner_id", user.id);

            if (error) throw error;
            setItems(data || []);
            break;
          }
          case "enclosure": {
            const { data, error } = await supabase
              .from("enclosures")
              .select("id, name")
              .eq("owner_id", user.id);

            if (error) throw error;
            setItems(data || []);
            break;
          }
          case "hardware": {
            const { data, error } = await supabase
              .from("hardware_devices")
              .select("id, name")
              .eq("owner_id", user.id);

            if (error) throw error;
            setItems(data || []);
            break;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${type} items:`, error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type, user?.id]);

  return { items, loading };
};
