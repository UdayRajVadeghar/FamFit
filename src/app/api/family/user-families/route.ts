import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all families the user is a member of
    const familyMemberships = await prisma.familyMember.findMany({
      where: {
        userId,
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            description: true,
            goal: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    const families = familyMemberships.map((membership) => ({
      ...membership.family,
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));

    return NextResponse.json({ families });
  } catch (error) {
    console.error("Error fetching user families:", error);
    return NextResponse.json(
      { error: "Failed to fetch families" },
      { status: 500 }
    );
  }
}
