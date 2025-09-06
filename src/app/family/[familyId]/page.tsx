"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  Calendar,
  Copy,
  Crown,
  Settings,
  Target,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const familyId = params.familyId as string;

  useEffect(() => {
    if (familyId) {
      fetchFamily();
    }
  }, [familyId]);

  const fetchFamily = async () => {
    try {
      const response = await fetch(`/api/family/${familyId}`);

      if (response.ok) {
        const data = await response.json();
        setFamily(data.family);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load family");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💪</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start Workout
                </h3>
                <p className="text-gray-600 mb-4">Begin your fitness routine</p>
                <Button className="w-full">Get Started</Button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Family Progress
                </h3>
                <p className="text-gray-600 mb-4">
                  View collective achievements
                </p>
                <Button variant="outline" className="w-full">
                  View Progress
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Code */}
            <div className="bg-white rounded-xl shadow-sm p-6">
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
