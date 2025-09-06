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
    const period = searchParams.get("period") || "30d";

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
            createdAt: true,
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

    let startDate: Date = new Date();
    let daysToSubtract: number;

    switch (period) {
      case "7d":
        daysToSubtract = 6;
        break;
      case "30d":
        daysToSubtract = 29;
        break;
      case "90d":
        daysToSubtract = 89;
        break;
      case "1m":
        daysToSubtract = 29;
        break;
      case "2m":
        daysToSubtract = 59;
        break;
      case "3m":
        daysToSubtract = 89;
        break;
      case "all":
        startDate = new Date(familyMember.family.createdAt || new Date());
        startDate.setHours(0, 0, 0, 0);
        daysToSubtract = 0;
        break;
      default:
        daysToSubtract = 29;
    }

    if (period !== "all") {
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - daysToSubtract);
      startDate.setHours(0, 0, 0, 0);
    }

    console.log("Status fetch range:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      familyId,
      period,
    });

    const familyMembers = await prisma.familyMember.findMany({
      where: {
        familyId: familyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const progressRecords = await prisma.progress.findMany({
      where: {
        familyId: familyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        userId: true,
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
    const membersProgress = familyMembers.map((member) => {
      const memberProgress = progressRecords.filter(
        (record) => record.userId === member.user.id
      );

      const totalWorkouts = memberProgress.length;
      const totalCalories = memberProgress.reduce(
        (sum, record) => sum + record.caloriesBurnt,
        0
      );
      const totalDuration = memberProgress.reduce(
        (sum, record) => sum + record.workoutDuration,
        0
      );

      let avgRating = 0;
      if (totalWorkouts > 0) {
        const ratingSum = memberProgress.reduce((sum, record) => {
          const numericRating = parseFloat(record.overallRating);
          if (!isNaN(numericRating)) {
            return sum + numericRating;
          }
          const lowerRating = record.overallRating.toLowerCase();
          if (
            lowerRating.includes("excellent") ||
            lowerRating.includes("amazing")
          )
            return sum + 5;
          if (lowerRating.includes("great") || lowerRating.includes("good"))
            return sum + 4;
          if (lowerRating.includes("okay") || lowerRating.includes("average"))
            return sum + 3;
          if (lowerRating.includes("poor") || lowerRating.includes("bad"))
            return sum + 2;
          return sum + 3; // Default to 3 for unknown ratings
        }, 0);
        avgRating = ratingSum / totalWorkouts;
      }

      let currentStreak = 0;
      if (memberProgress.length > 0) {
        const sortedProgress = [...memberProgress].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const workoutDates = new Set(
          sortedProgress.map((record) =>
            record.createdAt.toLocaleDateString("en-CA", {
              timeZone: "Asia/Kolkata",
            })
          )
        );

        const today = new Date();
        let checkDate = new Date(today);

        while (true) {
          const dateString = checkDate.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          });

          if (workoutDates.has(dateString)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      const lastWorkout =
        memberProgress.length > 0
          ? memberProgress[0].createdAt.toISOString()
          : null;

      return {
        userId: member.user.id,
        userName: member.user.name,
        userEmail: member.user.email,
        role: member.role,
        totalWorkouts,
        totalCalories,
        totalDuration,
        avgRating,
        currentStreak,
        lastWorkout,
        progressEntries: memberProgress.map((record) => ({
          id: record.id,
          workoutType: record.workoutType,
          workoutDuration: record.workoutDuration,
          caloriesBurnt: record.caloriesBurnt,
          overallRating: record.overallRating,
          createdAt: record.createdAt.toISOString(),
        })),
      };
    });

    const familyStats = {
      totalWorkouts: progressRecords.length,
      totalCalories: progressRecords.reduce(
        (sum, record) => sum + record.caloriesBurnt,
        0
      ),
      totalDuration: progressRecords.reduce(
        (sum, record) => sum + record.workoutDuration,
        0
      ),
      activeMembers: membersProgress.filter(
        (member) => member.totalWorkouts > 0
      ).length,
    };

    const responseData = {
      familyName: familyMember.family.name,
      familyCreatedAt: familyMember.family.createdAt?.toISOString(),
      totalMembers: familyMembers.length,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      membersProgress: membersProgress.sort(
        (a, b) => b.totalWorkouts - a.totalWorkouts
      ),
      familyStats,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching family status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
