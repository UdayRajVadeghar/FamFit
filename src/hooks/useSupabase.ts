"use client";

import type { Database } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useAuth, useSession } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function useSupabase() {
  const { getToken } = useAuth();
  const { isLoaded } = useSession();
  const [authenticatedClient, setAuthenticatedClient] =
    useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    const createAuthenticatedClient = async () => {
      if (!isLoaded) return;

      let accessToken: string | null = null;
      try {
        accessToken = await getToken({ template: "supabase" });
        if (!accessToken) {
          console.warn(
            "Clerk JWT template 'supabase' returned null. Please configure the template in Clerk Dashboard."
          );
        }
      } catch (error) {
        console.error("Failed to get Supabase token from Clerk:", error);
        console.error(
          "Make sure you have a JWT template named 'supabase' configured in Clerk Dashboard"
        );
        // Return the singleton instance for unauthenticated usage
        setAuthenticatedClient(null);
        return;
      }

      if (accessToken) {
        // Create an authenticated client only when needed
        const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
          auth: {
            persistSession: false,
          },
        });
        setAuthenticatedClient(client);
      } else {
        setAuthenticatedClient(null);
      }
    };

    createAuthenticatedClient();
  }, [getToken, isLoaded]);

  // Return authenticated client if available, otherwise return singleton
  return authenticatedClient || supabase;
}
