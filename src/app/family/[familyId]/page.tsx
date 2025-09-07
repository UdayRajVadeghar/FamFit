"use client";

import ActivityGraph from "@/components/ActivityGraph";
import ProfileButton from "@/components/ProfileButton";
import { Button } from "@/components/ui/button";
import WorkoutProgressModal from "@/components/WorkoutProgressModal";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Crown,
  Dumbbell,
  Flame,
  Settings,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface FamilyMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface FamilyData {
  id: string;
  name: string;
  description?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  inviteCode: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  members: FamilyMember[];
  userRole: string;
}

export default function FamilyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [todayProgressUpdated, setTodayProgressUpdated] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [progressHistory, setProgressHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const familyId = params.familyId as string;

  const fetchFamily = useCallback(async () => {
    try {
      const response = await fetch(`/api/family/${familyId}`);

      if (response.ok) {
        const data = await response.json();
        setFamily(data.family);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load family");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  const checkTodayProgress = useCallback(async () => {
    try {
      setCheckingProgress(true);
      const response = await fetch(
        `/api/family/progress?familyId=${familyId}&limit=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.progress && data.progress.length > 0) {
          const lastProgress = data.progress[0];

          // Get current IST date
          const istResponse = await fetch(
            "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata"
          );
          if (istResponse.ok) {
            const istData = await istResponse.json();
            const todayISTDateString = `${istData.year}-${String(
              istData.month
            ).padStart(2, "0")}-${String(istData.day).padStart(2, "0")}`;

            // Convert last progress createdAt to IST and compare dates
            const lastProgressIST = new Date(
              lastProgress.createdAt.toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
              })
            );
            const lastProgressDateString = lastProgressIST
              .toISOString()
              .split("T")[0];

            setTodayProgressUpdated(
              lastProgressDateString === todayISTDateString
            );
          }
        } else {
          setTodayProgressUpdated(false);
        }
      }
    } catch (error) {
      console.error("Error checking today's progress:", error);
      setTodayProgressUpdated(false);
    } finally {
      setCheckingProgress(false);
    }
  }, [familyId]);

  useEffect(() => {
    if (familyId) {
      fetchFamily();
      checkTodayProgress();
    }
  }, [familyId, fetchFamily, checkTodayProgress]);

  const handleProgressUpdate = () => {
    // Refresh the progress status after successful update
    checkTodayProgress();
    // Refresh history if it's currently shown
    if (showHistory) {
      fetchProgressHistory();
    }
  };

  const fetchProgressHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(
        `/api/family/progress?familyId=${familyId}&limit=30`
      );

      if (response.ok) {
        const data = await response.json();
        setProgressHistory(data.progress || []);
      } else {
        const errorData = await response.json();
        setHistoryError(errorData.error || "Failed to load progress history");
      }
    } catch {
      setHistoryError("Network error. Please try again.");
    } finally {
      setHistoryLoading(false);
    }
  }, [familyId]);

  const toggleHistory = () => {
    const newShowHistory = !showHistory;
    setShowHistory(newShowHistory);

    if (newShowHistory && progressHistory.length === 0) {
      fetchProgressHistory();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case "excellent":
        return "text-green-700 bg-green-50 border-green-200";
      case "good":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "average":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "poor":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const copyInviteCode = async () => {
    if (family?.inviteCode) {
      try {
        await navigator.clipboard.writeText(family.inviteCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error("Failed to copy invite code:", error);
      }
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading family...</p>
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
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!family) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {family.name}
                </h1>
                <p className="text-gray-600">Family Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {family.userRole === "admin" && (
                <Button variant="outline" size="sm">
                  <Settings size={16} className="mr-2" />
                  Settings
                </Button>
              )}
              <ProfileButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Family Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Family Information
              </h2>

              {family.description && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-600">{family.description}</p>
                </div>
              )}

              {family.goal && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Target size={16} className="mr-2" />
                    Fitness Goal
                  </label>
                  <p className="text-gray-600">{family.goal}</p>
                </div>
              )}

              {(family.startDate || family.endDate) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {family.startDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Calendar size={16} className="mr-2" />
                        Start Date
                      </label>
                      <p className="text-gray-600">
                        {new Date(family.startDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}

                  {family.endDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Calendar size={16} className="mr-2" />
                        End Date
                      </label>
                      <p className="text-gray-600">
                        {new Date(family.endDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Activity Graph */}
            <ActivityGraph familyId={familyId} className="mb-6" />

            {/* Workout Progress Update */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Today&apos;s Workout
                    </h3>
                    <p className="text-gray-600">
                      Track your progress and share with family
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {checkingProgress ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">Checking...</span>
                    </div>
                  ) : todayProgressUpdated ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">
                        Updated Today ✓
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">
                        Update Pending
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <WorkoutProgressModal
                  familyId={familyId}
                  onSuccess={handleProgressUpdate}
                  disabled={todayProgressUpdated}
                  trigger={
                    <Button className="w-full" disabled={todayProgressUpdated}>
                      <Activity className="mr-2 h-4 w-4" />
                      {todayProgressUpdated
                        ? "Already Updated"
                        : "Update Progress"}
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={toggleHistory}
                >
                  <Target className="mr-2 h-4 w-4" />
                  {showHistory ? "Hide History" : "View History"}
                </Button>
              </div>
            </div>

            {/* Progress History Display */}
            {showHistory && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Target className="mr-2 h-5 w-5 text-blue-600" />
                    Your Progress History
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Recent workout sessions and progress updates
                  </p>
                </div>

                <div className="p-6">
                  {historyLoading ? (
                    <div className="text-center py-12">
                      <div className="relative mx-auto w-12 h-12 mb-4">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 animate-spin">
                          <div className="absolute inset-1 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Loading your progress history...
                      </p>
                    </div>
                  ) : historyError ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-lg">⚠️</span>
                      </div>
                      <p className="text-red-600 font-medium mb-4">
                        {historyError}
                      </p>
                      <Button
                        onClick={fetchProgressHistory}
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : progressHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="text-slate-400" size={24} />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">
                        No Progress History Yet
                      </h4>
                      <p className="text-slate-600">
                        Start logging your workouts to see your progress here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progressHistory.map((record, index) => (
                        <div
                          key={record.id}
                          className="border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Date & Time */}
                            <div className="flex items-center gap-3 lg:w-48">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="text-blue-600" size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 text-sm truncate">
                                  {formatDate(record.createdAt)}
                                </p>
                                <p className="text-slate-500 text-xs flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatTime(record.checkInTime)}
                                </p>
                              </div>
                            </div>

                            {/* Workout Details */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <Dumbbell
                                  className="text-blue-600 flex-shrink-0"
                                  size={14}
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Type
                                  </p>
                                  <p className="font-semibold text-slate-900 text-sm truncate">
                                    {record.workoutType}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Clock
                                  className="text-emerald-600 flex-shrink-0"
                                  size={14}
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Duration
                                  </p>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {record.workoutDuration} min
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Flame
                                  className="text-orange-600 flex-shrink-0"
                                  size={14}
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Calories
                                  </p>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {record.caloriesBurnt}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Rating */}
                            <div className="lg:w-20">
                              <div
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getRatingColor(
                                  record.overallRating
                                )} text-center`}
                              >
                                {record.overallRating}
                              </div>
                            </div>
                          </div>

                          {/* Progress Details */}
                          {record.progressDetails && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Progress Notes
                              </p>
                              <p className="text-slate-700 text-sm leading-relaxed">
                                {record.progressDetails}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {progressHistory.length >= 30 && (
                        <div className="text-center pt-4">
                          <p className="text-sm text-slate-500">
                            Showing last 30 workout sessions
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* View Family Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Button
                onClick={() => router.push(`/family/${familyId}/status`)}
                className="w-full bg-blue-600 hover:blue-500"
              >
                <TrendingUp size={16} className="mr-2" />
                View Family Group Status
              </Button>
            </div>

            {/* Invite Code */}
            <div className="bg-white rounded-xl shadow-sm p-6 ">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Invite Code
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <code className="text-sm text-gray-800 font-mono">
                  {family.inviteCode}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyInviteCode}
                className="w-full"
              >
                <Copy size={16} className="mr-2" />
                {copySuccess ? "Copied!" : "Copy Code"}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Share this code with family members to invite them.
              </p>
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users size={20} className="mr-2" />
                Members ({family.members.length})
              </h3>

              <div className="space-y-3">
                {family.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {member.user.name?.charAt(0) ||
                            member.user.email.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined{" "}
                          {new Date(member.joinedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.role === "admin" && (
                        <Crown size={14} className="text-yellow-500" />
                      )}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
