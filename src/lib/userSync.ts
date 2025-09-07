"use client";

import { useSupabase } from "@/hooks/useSupabase";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function useUserSync() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const supabase = useSupabase();

  useEffect(() => {
    if (!userLoaded || !authLoaded || !user) return;

    const syncUser = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const userRecord = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : null,
        };

        const { data: _data, error } = await (
          supabase as unknown as {
            from: (table: string) => {
              upsert: (
                data: unknown,
                options: { onConflict: string }
              ) => Promise<{ data?: unknown; error?: { message: string } }>;
            };
          }
        )
          .from("users")
          .upsert(userRecord, {
            onConflict: "id",
          });

        void _data; // Mark as intentionally unused

        if (error) {
          console.error("User sync failed:", error.message || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    };

    syncUser();
  }, [user, userLoaded, authLoaded, supabase]);

  return { user };
}

export async function syncUserToSupabase(
  user: {
    id: string;
    emailAddresses: Array<{ emailAddress: string }>;
    firstName?: string | null;
    lastName?: string | null;
  },
  supabase: {
    from: (table: string) => {
      upsert: (
        data: unknown,
        options: { onConflict: string }
      ) => Promise<{ data?: unknown; error?: unknown }>;
    };
  }
) {
  if (!user) return null;

  try {
    const userRecord = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: user.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : null,
    };

    const { data, error } = await (
      supabase as unknown as {
        from: (table: string) => {
          upsert: (
            data: unknown,
            options: { onConflict: string }
          ) => Promise<{ data?: unknown; error?: unknown }>;
        };
      }
    )
      .from("users")
      .upsert(userRecord, {
        onConflict: "id",
      });

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error syncing user to Supabase:", error);
    throw error;
  }
}
