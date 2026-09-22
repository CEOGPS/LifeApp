// src/hooks/useUserEmail.ts
// Hook to get current user's email from Supabase auth

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useUserEmail(): { email: string | null; loading: boolean } {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEmail = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setEmail(session?.user?.email || null);
      } catch (e) {
        console.error("Failed to get user email:", e);
        setEmail(null);
      } finally {
        setLoading(false);
      }
    };

    getEmail();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { email, loading };
}

// Re-export from lib for backward compatibility
export function persistUserEmail(email: string | null): void {
  if (typeof window !== "undefined") {
    if (email) {
      localStorage.setItem("lifeos_user_email", email);
    } else {
      localStorage.removeItem("lifeos_user_email");
    }
  }
}

export function clearUserEmail(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lifeos_user_email");
  }
}

export function getCurrentUserEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lifeos_user_email");
  }
  return null;
}