"use client";

import type { Database } from "@/lib/supabase";
import { useAuth, useSession } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function useSupabase() {
  const { getToken } = useAuth();
  const { isLoaded } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(
    null
  );

  useEffect(() => {
    const createSupabaseClient = async () => {
      let accessToken: string | null = null;

      if (isLoaded) {
        try {
          accessToken = await getToken({ template: "supabase" });
        } catch (error) {
          console.log("No token available:", error);
        }
      }

      const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {},
        },
        auth: {
          persistSession: false,
        },
      });

      setSupabase(client);
    };

    createSupabaseClient();
  }, [getToken, isLoaded]);

  if (!supabase) {
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return supabase;
}
