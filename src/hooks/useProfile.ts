"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "./useUser";
import type { Profile } from "@/types";

export function useProfile() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setProfile(data);
        setLoading(false);
      });
  }, [user, userLoading]);

  return { profile, loading: userLoading || loading, error };
}
