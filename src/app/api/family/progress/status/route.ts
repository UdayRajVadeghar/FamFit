import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Fallback function to get current IST time if external API fails
function getCurrentISTTime() {
  const now = new Date();
  // Convert to IST (UTC + 5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  return {
    year: istTime.getUTCFullYear(),
    month: istTime.getUTCMonth() + 1, // JavaScript months are 0-indexed
    day: istTime.getUTCDate(),
    hour: istTime.getUTCHours(),
    minute: istTime.getUTCMinutes(),
    seconds: istTime.getUTCSeconds(),
    milliSeconds: istTime.getUTCMilliseconds()
  };
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
    const period = searchParams.get("period") || "30d";

    if (!familyId) {
      return NextResponse.json(
        { error: "Family ID is required" },
        { status: 400 }
      );
    }

    console.log("Fetching family status for:", { familyId, period, userId });

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

    // Try to get IST time, fallback to local calculation if external API fails
    let istData;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const istResponse = await fetch(
        "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata",
        { 
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (istResponse.ok) {
        istData = await istResponse.json();
        console.log("IST API Response:", istData);
      } else {
        throw new Error(`IST API request failed with status: ${istResponse.status}`);
      }
    } catch (error) {
      console.warn("Failed to fetch IST time from external API, using fallback:", error);
      istData = getCurrentISTTime();
    }

    let endDate: Date;
    try {
      endDate = new Date(
        Date.UTC(istData.year, istData.month - 1, istData.day, 23, 59, 59, 999)
      );
    } catch (error) {
      console.error("Error creating end date:", error);
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

    // Fetch family members with better error handling
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

    if (!familyMembers || familyMembers.length === 0) {
      return NextResponse.json(
        { error: "No family members found" },
        { status: 404 }
      );
    }

    console.log("Found family members:", familyMembers.length);

    // Fetch progress records with better error handling
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

    console.log("Found progress records:", progressRecords.length);
    const membersProgress = familyMembers.map((member) => {
      if (!member.user) {
        console.error("Member missing user data:", member);
        return null;
      }

      const memberProgress = progressRecords.filter(
        (record) => record.userId === member.user.id
      );

      const totalWorkouts = memberProgress.length;
      const totalCalories = memberProgress.reduce(
        (sum, record) => sum + (record.caloriesBurnt || 0),
        0
      );
      const totalDuration = memberProgress.reduce(
        (sum, record) => sum + (record.workoutDuration || 0),
        0
      );

      let avgRating = 0;
      if (totalWorkouts > 0) {
        const ratingSum = memberProgress.reduce((sum, record) => {
          if (!record.overallRating) return sum + 3; // Default rating
          
          const numericRating = parseFloat(record.overallRating);
          if (!isNaN(numericRating)) {
            return sum + Math.max(0, Math.min(5, numericRating)); // Clamp between 0-5
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
        try {
          const sortedProgress = [...memberProgress].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const workoutDates = new Set(
            sortedProgress.map((record) => {
              try {
                return record.createdAt.toLocaleDateString("en-CA", {
                  timeZone: "Asia/Kolkata",
                });
              } catch (error) {
                console.error("Error formatting date:", error, record.createdAt);
                return record.createdAt.toISOString().split('T')[0]; // Fallback
              }
            })
          );

          const today = new Date();
          const checkDate = new Date(today);

          while (true) {
            let dateString;
            try {
              dateString = checkDate.toLocaleDateString("en-CA", {
                timeZone: "Asia/Kolkata",
              });
            } catch (error) {
              console.error("Error formatting check date:", error);
              dateString = checkDate.toISOString().split('T')[0]; // Fallback
            }

            if (workoutDates.has(dateString)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        } catch (error) {
          console.error("Error calculating streak for member:", member.user.id, error);
          currentStreak = 0;
        }
      }

      const lastWorkout =
        memberProgress.length > 0
          ? memberProgress[0].createdAt.toISOString()
          : null;

      return {
        userId: member.user.id,
        userName: member.user.name || null,
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
          workoutType: record.workoutType || "Unknown",
          workoutDuration: record.workoutDuration || 0,
          caloriesBurnt: record.caloriesBurnt || 0,
          overallRating: record.overallRating || "N/A",
          createdAt: record.createdAt.toISOString(),
        })),
      };
    }).filter(Boolean); // Remove any null entries

    const familyStats = {
      totalWorkouts: progressRecords.length,
      totalCalories: progressRecords.reduce(
        (sum, record) => sum + (record.caloriesBurnt || 0),
        0
      ),
      totalDuration: progressRecords.reduce(
        (sum, record) => sum + (record.workoutDuration || 0),
        0
      ),
      activeMembers: membersProgress.filter(
        (member) => member && member.totalWorkouts > 0
      ).length,
    };

    const responseData = {
      familyName: familyMember.family.name || "Unknown Family",
      familyCreatedAt: familyMember.family.createdAt?.toISOString() || null,
      totalMembers: familyMembers.length,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      membersProgress: membersProgress
        .filter(Boolean) // Remove any null entries
        .sort((a, b) => (b?.totalWorkouts || 0) - (a?.totalWorkouts || 0)),
      familyStats,
    };

    console.log("Returning response data for family:", familyId);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching family status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
