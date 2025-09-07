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

    if (!checkInTime || !checkInTime.match(/^\d{2}:\d{2}$/)) {
      return NextResponse.json(
        { error: "Invalid check-in time format. Expected HH:MM" },
        { status: 400 }
      );
    }

    const today = new Date();
    const [hours, minutes] = checkInTime.split(":").map(Number);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return NextResponse.json(
        { error: "Invalid time values in check-in time" },
        { status: 400 }
      );
    }

    const checkInDateTime = new Date(today);
    checkInDateTime.setHours(hours, minutes, 0, 0);

    const istResponse = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata"
    );
    if (!istResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch current time" },
        { status: 500 }
      );
    }

    const istData = await istResponse.json();

    const currentISTDate = new Date(
      Date.UTC(
        istData.year,
        istData.month - 1,
        istData.day,
        istData.hour,
        istData.minute,
        istData.seconds,
        istData.milliSeconds
      )
    );

    const todayISTDateString = `${istData.year}-${String(
      istData.month
    ).padStart(2, "0")}-${String(istData.day).padStart(2, "0")}`;

    console.log("IST API Response:", istData);
    console.log("UTC stored Date:", currentISTDate.toISOString());
    console.log("IST Date String:", todayISTDateString);

    const lastProgress = await prisma.progress.findFirst({
      where: {
        userId: userId,
        familyId: familyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (lastProgress) {
      const lastProgressDateString = lastProgress.createdAt.toLocaleDateString(
        "en-CA",
        { timeZone: "Asia/Kolkata" }
      );

      if (lastProgressDateString === todayISTDateString) {
        return NextResponse.json(
          { error: "You have already updated today's progress." },
          { status: 400 }
        );
      }
    }

    const workoutProgress = await prisma.progress.create({
      data: {
        userId: userId,
        familyId: familyId,
        progressDetails: progress.trim(),
        checkInTime: checkInDateTime,
        workoutType: workoutType.trim(),
        workoutDuration: durationInt,
        caloriesBurnt: caloriesInt,
        overallRating: rating.trim(),
        createdAt: currentISTDate,
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

    const whereClause: {
      userId: string;
      familyId?: string;
    } = { userId: userId };

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
