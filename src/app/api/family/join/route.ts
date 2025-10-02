import { executeWithRetry } from "@/lib/db-utils";
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

    // Find the family by invite code - with retry logic
    const family = await executeWithRetry(
      (db) =>
        db.family.findUnique({
          where: {
            inviteCode: inviteCode.trim(),
            isActive: true,
          },
        }),
      prisma
    );

    if (!family) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if user is already a member - with retry logic
    const existingMember = await executeWithRetry(
      (db) =>
        db.familyMember.findUnique({
          where: {
            userId_familyId: {
              userId,
              familyId: family.id,
            },
          },
        }),
      prisma
    );

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this family" },
        { status: 400 }
      );
    }

    // Add user as a member - with retry logic
    await executeWithRetry(
      (db) =>
        db.familyMember.create({
          data: {
            userId,
            familyId: family.id,
            role: "member",
          },
        }),
      prisma
    );

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
