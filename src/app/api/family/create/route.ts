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
    const { name, description, goal, startDate, endDate } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Family name is required" },
        { status: 400 }
      );
    }

    // Create the family
    const family = await prisma.family.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        goal: goal?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: userId,
      },
    });

    // Add the creator as an admin member
    await prisma.familyMember.create({
      data: {
        userId,
        familyId: family.id,
        role: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      family: {
        id: family.id,
        name: family.name,
        description: family.description,
        goal: family.goal,
        inviteCode: family.inviteCode,
      },
    });
  } catch (error) {
    console.error("Error creating family:", error);
    return NextResponse.json(
      { error: "Failed to create family" },
      { status: 500 }
    );
  }
}
