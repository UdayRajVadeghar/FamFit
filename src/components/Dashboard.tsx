"use client";

import { useUserSync } from "@/lib/userSync";
import { useUser } from "@clerk/nextjs";
import { Home, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateFamilyModal } from "./CreateFamilyModal";
import { JoinFamilyModal } from "./JoinFamilyModal";
import ProfileButton from "./ProfileButton";

interface Family {
  id: string;
  name: string;
  description?: string;
  goal?: string;
  role: string;
  joinedAt: string;
}

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useUserSync();

  useEffect(() => {
    fetchUserFamilies();
  }, []);

  const fetchUserFamilies = async () => {
    try {
      const response = await fetch("/api/family/user-families");
      if (response.ok) {
        const data = await response.json();
        setFamilies(data.families || []);
      }
    } catch (error) {
      console.error("Error fetching families:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Profile Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ProfileButton showWelcome={true} />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Family Gym, {user.firstName}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ready to start your fitness journey?
          </p>
        </div>

        {/* Family Management Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Families</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Create Family</span>
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Users size={16} />
                <span>Join Family</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading families...</p>
            </div>
          ) : families.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family) => (
                <div
                  key={family.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/family/${family.id}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Home className="text-blue-600" size={24} />
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {family.role}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {family.name}
                  </h3>
                  {family.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {family.description}
                    </p>
                  )}
                  {family.goal && (
                    <p className="text-blue-600 text-sm font-medium">
                      Goal: {family.goal}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Families Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create a new family or join an existing one to get started.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Family
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Join Family
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💪</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Start Workout
            </h3>
            <p className="text-gray-600 mb-4">Begin your fitness routine</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Track Progress
            </h3>
            <p className="text-gray-600 mb-4">Monitor your achievements</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              View Stats
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Achievements
            </h3>
            <p className="text-gray-600 mb-4">View your milestones</p>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateFamilyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinFamilyModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
}
