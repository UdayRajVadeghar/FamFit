"use client";

import ProfileButton from "@/components/ProfileButton";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  RefreshCw,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface ProgressEntry {
  id: string;
  workoutType: string;
  workoutDuration: number;
  caloriesBurnt: number;
  overallRating: string;
  createdAt: string;
}

interface MemberProgress {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;
  avgRating: number;
  currentStreak: number;
  lastWorkout: string | null;
  progressEntries: ProgressEntry[];
}

interface FamilyStatusData {
  familyName: string;
  familyCreatedAt: string;
  totalMembers: number;
  dateRange: {
    start: string;
    end: string;
  };
  membersProgress: MemberProgress[];
  familyStats: {
    totalWorkouts: number;
    totalCalories: number;
    totalDuration: number;
    activeMembers: number;
  };
}

type TimePeriod = "7d" | "30d" | "90d" | "1m" | "2m" | "3m" | "all";

interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  description: string;
}

export default function FamilyStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [statusData, setStatusData] = useState<FamilyStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30d");

  const familyId = params.familyId as string;

  const timePeriodOptions: TimePeriodOption[] = [
    { value: "7d", label: "7 Days", description: "Last 7 days" },
    { value: "30d", label: "30 Days", description: "Last 30 days" },
    { value: "90d", label: "90 Days", description: "Last 3 months" },
    { value: "1m", label: "1 Month", description: "Last month" },
    { value: "2m", label: "2 Months", description: "Last 2 months" },
    { value: "3m", label: "3 Months", description: "Last 3 months" },
    { value: "all", label: "All Time", description: "Since family creation" },
  ];

  const fetchFamilyStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/family/progress/status?familyId=${familyId}&period=${selectedPeriod}`
      );

      if (response.ok) {
        const data = await response.json();
        setStatusData(data);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load family status");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [familyId, selectedPeriod]);

  useEffect(() => {
    if (familyId) {
      fetchFamilyStatus();
    }
  }, [familyId, fetchFamilyStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFamilyStatus();
    setRefreshing(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-orange-600";
  };

  const getActivityLevel = (workouts: number) => {
    if (workouts >= 20)
      return {
        label: "Very Active",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (workouts >= 15)
      return { label: "Active", color: "text-blue-600", bg: "bg-blue-100" };
    if (workouts >= 10)
      return {
        label: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    if (workouts >= 5)
      return { label: "Light", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "Starting", color: "text-gray-600", bg: "bg-gray-100" };
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading family status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
            <Button
              onClick={() => router.push(`/family/${familyId}`)}
              variant="outline"
            >
              Back to Family
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/family/${familyId}`)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {statusData.familyName} - Family Status
                </h1>
                <p className="text-gray-600">
                  {
                    timePeriodOptions.find(
                      (opt) => opt.value === selectedPeriod
                    )?.description
                  }{" "}
                  Progress Overview
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Time Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(e.target.value as TimePeriod)
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || refreshing}
              >
                {timePeriodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
              >
                <RefreshCw
                  size={16}
                  className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              <ProfileButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Overview Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Workouts
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusData.familyStats.totalWorkouts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Calories Burned
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusData.familyStats.totalCalories.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(statusData.familyStats.totalDuration)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Members
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusData.familyStats.activeMembers}/
                    {statusData.totalMembers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Info */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Progress Period:{" "}
                {new Date(statusData.dateRange.start).toLocaleDateString()} -{" "}
                {new Date(statusData.dateRange.end).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {statusData.familyCreatedAt && (
                <span className="text-xs text-gray-500">
                  Family created:{" "}
                  {new Date(statusData.familyCreatedAt).toLocaleDateString()}
                </span>
              )}
              <span className="text-sm text-gray-500">
                {
                  timePeriodOptions.find((opt) => opt.value === selectedPeriod)
                    ?.description
                }
              </span>
            </div>
          </div>
        </div>

        {/* Member Progress Cards */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="mr-2" />
            Member Progress
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {statusData.membersProgress.map((member) => {
              const activityLevel = getActivityLevel(member.totalWorkouts);

              return (
                <div
                  key={member.userId}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  {/* Member Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {member.userName?.charAt(0) ||
                            member.userEmail.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.userName || member.userEmail}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {member.role}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${activityLevel.bg} ${activityLevel.color}`}
                          >
                            {activityLevel.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {member.currentStreak > 0 && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <Flame size={16} />
                        <span className="text-sm font-medium">
                          {member.currentStreak} day streak
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {member.totalWorkouts}
                      </p>
                      <p className="text-xs text-gray-600">Workouts</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {member.totalCalories.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Calories</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatDuration(member.totalDuration)}
                      </p>
                      <p className="text-xs text-gray-600">Duration</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p
                        className={`text-2xl font-bold ${getRatingColor(
                          member.avgRating
                        )}`}
                      >
                        {member.avgRating > 0
                          ? member.avgRating.toFixed(1)
                          : "N/A"}
                      </p>
                      <p className="text-xs text-gray-600">Avg Rating</p>
                    </div>
                  </div>

                  {/* Last Workout */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Last Workout:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {member.lastWorkout
                          ? new Date(member.lastWorkout).toLocaleDateString()
                          : "No workouts yet"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* No Data State */}
        {statusData.membersProgress.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Progress Data
            </h3>
            <p className="text-gray-600 mb-6">
              No family members have logged workouts in the{" "}
              {timePeriodOptions
                .find((opt) => opt.value === selectedPeriod)
                ?.description.toLowerCase()}
              .
            </p>
            <Button onClick={() => router.push(`/family/${familyId}`)}>
              Back to Family Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
