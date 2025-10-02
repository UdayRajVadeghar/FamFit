"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useUserSync() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!userLoaded || !authLoaded || !user || synced) return;

    const syncUser = async () => {
      try {
        // Use server-side API endpoint for user sync
        // This avoids RLS issues by using Prisma with service-level access
        const response = await fetch("/api/user/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("User sync failed:", errorData);
          return;
        }

        const data = await response.json();
        console.log("User synced successfully:", data.user);
        setSynced(true);
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    };

    syncUser();
  }, [user, userLoaded, authLoaded, synced]);

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
