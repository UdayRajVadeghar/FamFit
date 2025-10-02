import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sync user to database using Prisma (which handles both Postgres and Supabase)
    const userRecord = await prisma.users.upsert({
      where: { id: userId },
      update: {
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : null,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
      },
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      {
        error: "Failed to sync user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
