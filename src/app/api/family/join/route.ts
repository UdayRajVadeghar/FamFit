import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode || inviteCode.trim().length === 0) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find the family by invite code
    const family = await prisma.family.findUnique({
      where: {
        inviteCode: inviteCode.trim(),
        isActive: true,
      },
    });

    if (!family) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId,
          familyId: family.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this family" },
        { status: 400 }
      );
    }

    // Add user as a member
    await prisma.familyMember.create({
      data: {
        userId,
        familyId: family.id,
        role: "member",
      },
    });

    return NextResponse.json({
      success: true,
      family: {
        id: family.id,
        name: family.name,
        description: family.description,
        goal: family.goal,
      },
    });
  } catch (error) {
    console.error("Error joining family:", error);
    return NextResponse.json(
      { error: "Failed to join family" },
      { status: 500 }
    );
  }
}
