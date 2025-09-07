"use client";

import { useUserSync } from "@/lib/userSync";
import { useUser } from "@clerk/nextjs";
import { Home, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateFamilyModal } from "./CreateFamilyModal";
import { JoinFamilyModal } from "./JoinFamilyModal";
import ProfileButton from "./ProfileButton";
import { Highlighter } from "./magicui/highlighter";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Profile Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ProfileButton showWelcome={true} />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Hero Section */}
        <div className="text-center pt-16 pb-20">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 mb-8 leading-tight font-serif">
              Welcome to{" "}
              <Highlighter
                action="underline"
                color="#3b82f6"
                strokeWidth={2}
                animationDuration={800}
                padding={8}
                isView={true}
              >
                <span className="bg-black bg-clip-text text-transparent font-extrabold font-sans">
                  FamFit
                </span>
              </Highlighter>
              <span className="text-gray-600 font-medium">
                , {user.firstName}!
              </span>{" "}
              👋
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed font-light">
            Ready to start your fitness journey with your family?
          </p>
        </div>

        {/* Family Management Section */}
        <div className="mb-20">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Your Family Groups
                </h2>
                <p className="text-gray-600">
                  Manage and track your family&apos;s fitness journey together
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={18} />
                  <span className="font-medium">Create Family Group</span>
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Users size={18} />
                  <span className="font-medium">Join Family</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="text-gray-600 mt-4 text-lg">
                  Loading families...
                </p>
              </div>
            ) : families.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {families.map((family) => (
                  <div
                    key={family.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group transform hover:scale-105"
                    onClick={() => router.push(`/family/${family.id}`)}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                        <Home className="text-blue-600" size={28} />
                      </div>
                      <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-2 rounded-full font-medium uppercase tracking-wide">
                        {family.role}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                      {family.name}
                    </h3>
                    {family.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {family.description}
                      </p>
                    )}
                    {family.goal && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-blue-700 text-sm font-semibold">
                          🎯 Goal: {family.goal}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Users className="text-gray-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No Families Yet
                </h3>
                <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto leading-relaxed">
                  Create a new family or join an existing one to start your
                  fitness journey together.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Create Family Group
                  </button>
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Join Family
                  </button>
                </div>
              </div>
            )}
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
