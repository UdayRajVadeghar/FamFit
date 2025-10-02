"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useUserSync() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const [synced, setSynced] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!userLoaded || !authLoaded || !user || synced) return;

    const syncUser = async () => {
      try {
        console.log("Syncing user to database...");

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

          // Retry up to 3 times for 409 conflicts (duplicate email)
          if (errorData.error === "Email conflict" && retryCount < 3) {
            console.log(`Retrying user sync (attempt ${retryCount + 1}/3)...`);
            setRetryCount((prev) => prev + 1);
            setTimeout(() => {
              syncUser();
            }, 2000 * (retryCount + 1)); // Exponential backoff
          }
          return;
        }

        const data = await response.json();
        console.log("✅ User synced successfully:", data.user);
        setSynced(true);
      } catch (error) {
        console.error("Failed to sync user:", error);

        // Retry on network errors
        if (retryCount < 3) {
          console.log(
            `Retrying user sync after error (attempt ${retryCount + 1}/3)...`
          );
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            syncUser();
          }, 2000 * (retryCount + 1));
        }
      }
    };

    syncUser();
  }, [user, userLoaded, authLoaded, synced, retryCount]);

  return { user, synced };
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
