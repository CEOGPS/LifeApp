// Hook to get current user email from Supabase auth

import { useEffect, useState } from "react";
import { supabase } from "@/platform/supabase/client";

export function useUserEmail(): string | null {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setEmail(session?.user?.email || null);
        setLoading(false);
      }
    };

    loadEmail();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setEmail(session?.user?.email || null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return loading ? null : email;
}

export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUserId(session?.user?.id || null);
        setLoading(false);
      }
    };

    loadUserId();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUserId(session?.user?.id || null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return loading ? null : userId;
}