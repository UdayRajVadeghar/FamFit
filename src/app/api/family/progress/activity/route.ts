import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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
    const months = parseInt(searchParams.get("months") || "3");

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

    const istResponse = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata"
    );

    let endDate: Date;
    if (istResponse.ok) {
      const istData = await istResponse.json();
      endDate = new Date(
        Date.UTC(istData.year, istData.month - 1, istData.day, 23, 59, 59, 999)
      );
    } else {
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364);
    startDate.setHours(0, 0, 0, 0);

    console.log("Activity fetch range:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      userId,
      familyId,
    });
    const progressRecords = await prisma.progress.findMany({
      where: {
        userId: userId,
        familyId: familyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        workoutType: true,
        workoutDuration: true,
        caloriesBurnt: true,
        overallRating: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found progress records:", progressRecords.length);

    const generateDateRange = (start: Date, end: Date): string[] => {
      const dates: string[] = [];
      const currentDate = new Date(start);

      while (currentDate <= end) {
        // Convert to IST date string
        const istDateString = currentDate.toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });
        dates.push(istDateString);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    };

    const allDates = generateDateRange(startDate, endDate);

    const workoutMap = new Map();

    progressRecords.forEach((record) => {
      const istDateString = record.createdAt.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      workoutMap.set(istDateString, {
        date: istDateString,
        hasWorkout: true,
        workoutDetails: {
          workoutType: record.workoutType,
          caloriesBurnt: record.caloriesBurnt,
          workoutDuration: record.workoutDuration,
          overallRating: record.overallRating,
        },
      });
    });

    const activityData = allDates.map((date) => {
      return (
        workoutMap.get(date) || {
          date,
          hasWorkout: false,
        }
      );
    });

    const totalWorkouts = progressRecords.length;
    const streakData = calculateStreaks(activityData);

    return NextResponse.json({
      success: true,
      activityData,
      statistics: {
        totalWorkouts,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          months,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
function calculateStreaks(activityData: any[]): {
  currentStreak: number;
  longestStreak: number;
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = activityData.length - 1; i >= 0; i--) {
    if (activityData[i].hasWorkout) {
      currentStreak++;
    } else {
      break;
    }
  }

  for (const day of activityData) {
    if (day.hasWorkout) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}
