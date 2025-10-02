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

    const email = user.emailAddresses[0]?.emailAddress || "";
    const name = user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : null;

    // Check if user exists by ID
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
    });

    let userRecord;

    if (existingUser) {
      // User exists, just update
      userRecord = await prisma.users.update({
        where: { id: userId },
        data: {
          email,
          name,
          updatedAt: new Date(),
        },
      });
    } else {
      // Check if email is already taken by another user
      const emailExists = await prisma.users.findUnique({
        where: { email },
      });

      if (emailExists) {
        // Email exists with different ID - this is a conflict
        // This can happen when switching from dev to prod Clerk

        // Check if the old user has any related data
        const hasData = await prisma.familyMember.count({
          where: { userId: emailExists.id },
        });

        if (hasData > 0) {
          // User has data - don't delete, return error
          console.error(
            `Email ${email} exists with different ID and has related data`
          );
          return NextResponse.json(
            {
              error: "Email conflict",
              details: `This email is already associated with a different account that has existing data. Please contact support or use the database cleanup endpoint.`,
            },
            { status: 409 }
          );
        }

        // Safe to delete old record and create new one
        await prisma.users.delete({
          where: { email },
        });

        userRecord = await prisma.users.create({
          data: {
            id: userId,
            email,
            name,
          },
        });
      } else {
        // Create new user
        userRecord = await prisma.users.create({
          data: {
            id: userId,
            email,
            name,
          },
        });
      }
    }

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
