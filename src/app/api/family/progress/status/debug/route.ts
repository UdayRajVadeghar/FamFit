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

    if (!familyId) {
      return NextResponse.json(
        { error: "Family ID is required" },
        { status: 400 }
      );
    }

    // Debug info
    const debugInfo = {
      userId,
      familyId,
      timestamp: new Date().toISOString(),
      databaseConnection: null,
      familyMember: null,
      familyMembers: null,
      progressRecords: null,
      errors: [],
    };

    try {
      // Test database connection
      await prisma.$connect();
      debugInfo.databaseConnection = "Connected successfully";
    } catch (error) {
      debugInfo.errors.push(`Database connection failed: ${error}`);
      debugInfo.databaseConnection = "Failed";
    }

    try {
      // Check family member
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
      
      debugInfo.familyMember = familyMember ? {
        id: familyMember.id,
        role: familyMember.role,
        familyName: familyMember.family?.name,
        familyIsActive: familyMember.family?.isActive,
        familyCreatedAt: familyMember.family?.createdAt?.toISOString(),
      } : null;

      if (!familyMember) {
        debugInfo.errors.push("User is not a member of this family");
      }

    } catch (error) {
      debugInfo.errors.push(`Failed to fetch family member: ${error}`);
    }

    try {
      // Check family members
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

      debugInfo.familyMembers = {
        count: familyMembers.length,
        members: familyMembers.map(m => ({
          id: m.id,
          role: m.role,
          userId: m.user?.id,
          userName: m.user?.name,
          userEmail: m.user?.email,
        })),
      };

    } catch (error) {
      debugInfo.errors.push(`Failed to fetch family members: ${error}`);
    }

    try {
      // Check progress records
      const progressRecords = await prisma.progress.findMany({
        where: {
          familyId: familyId,
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
        take: 5, // Just first 5 for debugging
        orderBy: {
          createdAt: "desc",
        },
      });

      debugInfo.progressRecords = {
        count: progressRecords.length,
        sample: progressRecords.map(p => ({
          id: p.id,
          userId: p.userId,
          workoutType: p.workoutType,
          createdAt: p.createdAt.toISOString(),
        })),
      };

    } catch (error) {
      debugInfo.errors.push(`Failed to fetch progress records: ${error}`);
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });

  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error in debug endpoint",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}