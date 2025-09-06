import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      progress,
      checkInTime,
      caloriesBurned,
      workoutType,
      duration,
      rating,
      familyId,
    } = body;

    if (
      !progress ||
      !checkInTime ||
      !caloriesBurned ||
      !workoutType ||
      !duration ||
      !rating
    ) {
      return NextResponse.json(
        { error: "All workout progress fields are required" },
        { status: 400 }
      );
    }

    if (!familyId) {
      return NextResponse.json(
        { error: "Family ID is required" },
        { status: 400 }
      );
    }
    const familyMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: userId,
          familyId: familyId,
        },
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    if (!familyMember.family.isActive) {
      return NextResponse.json(
        { error: "This family is not active" },
        { status: 400 }
      );
    }

    const caloriesInt = parseInt(caloriesBurned);
    const durationInt = parseInt(duration);

    if (isNaN(caloriesInt) || caloriesInt < 0) {
      return NextResponse.json(
        { error: "Invalid calories burned value" },
        { status: 400 }
      );
    }

    if (isNaN(durationInt) || durationInt < 0) {
      return NextResponse.json(
        { error: "Invalid workout duration value" },
        { status: 400 }
      );
    }

    const today = new Date();
    const [hours, minutes] = checkInTime.split(":").map(Number);
    const checkInDateTime = new Date(today);
    checkInDateTime.setHours(hours, minutes, 0, 0);

    const workoutProgress = await prisma.progress.create({
      data: {
        userId: userId,
        familyId: familyId,
        progressDetails: progress,
        checkInTime: checkInDateTime,
        workoutType: workoutType,
        workoutDuration: durationInt,
        caloriesBurnt: caloriesInt,
        overallRating: rating,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Workout progress saved successfully",
        progress: workoutProgress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving workout progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    let whereClause: any = { userId: userId };

    if (familyId) {
      const familyMember = await prisma.familyMember.findUnique({
        where: {
          userId_familyId: {
            userId: userId,
            familyId: familyId,
          },
        },
      });

      if (!familyMember) {
        return NextResponse.json(
          { error: "You are not a member of this family" },
          { status: 403 }
        );
      }

      whereClause.familyId = familyId;
    }

    const skip = (page - 1) * limit;

    const [progressRecords, totalCount] = await Promise.all([
      prisma.progress.findMany({
        where: whereClause,
        include: {
          family: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.progress.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      progress: progressRecords,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching workout progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
