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
  Copy,
  Crown,
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
                        {new Date(family.startDate).toLocaleDateString()}
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
                        {new Date(family.endDate).toLocaleDateString()}
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
                <Button variant="outline" className="w-full">
                  <Target className="mr-2 h-4 w-4" />
                  View History
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* View Family Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Button
                onClick={() => router.push(`/family/${familyId}/status`)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <TrendingUp size={16} className="mr-2" />
                View Family Status
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
                          {new Date(member.joinedAt).toLocaleDateString()}
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
