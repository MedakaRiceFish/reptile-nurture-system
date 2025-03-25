
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for redirects from OAuth or email confirmations
    const handleHashParams = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // This indicates we have an OAuth or email confirmation redirect
        // Let Supabase handle it via the auth state change
        console.log("Auth redirect detected, waiting for auth state change");
        
        // Clear the hash to avoid redirect loops
        window.location.hash = '';
      }
    };
    
    handleHashParams();
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast.success("Successfully signed in");
          navigate("/");
        } else if (event === 'SIGNED_OUT') {
          toast.success("Successfully signed out");
          navigate("/login");
        } else if (event === 'USER_UPDATED') {
          toast.success("Your account has been updated");
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // Navigation happens in the auth state change listener
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Use the current URL as the redirect URL for email confirmation
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (error) throw error;
      
      if (data.user?.identities?.length === 0) {
        toast.error("This email is already registered. Please log in instead.");
        navigate("/login");
        return;
      }
      
      toast.success("Signup successful! Please check your email to confirm your account.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Make sure we have a valid session before signing out
      if (!session) {
        console.log("No active session found, redirecting to login");
        setUser(null);
        setSession(null);
        navigate("/login");
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      
      // Force clear the session state immediately
      setUser(null);
      setSession(null);
      
      // Navigation happens in the auth state change listener
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Failed to sign out");
      
      // Even if there's an error, force navigation to login
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
