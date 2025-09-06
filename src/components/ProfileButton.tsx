"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { User } from "lucide-react";

interface ProfileButtonProps {
  className?: string;
  showWelcome?: boolean;
}

export default function ProfileButton({ 
  className = "", 
  showWelcome = false 
}: ProfileButtonProps) {
  const { user } = useUser();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <SignedOut>
        <div className="flex items-center space-x-2">
          <SignInButton>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100">
              <User size={20} />
              <span className="text-sm font-medium">Sign In</span>
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center space-x-3">
          {showWelcome && (
            <span className="text-gray-700 font-medium text-sm">
              Hi, {user?.firstName || "User"}!
            </span>
          )}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "shadow-lg border border-gray-200",
                userButtonPopoverActions: "text-gray-700",
              }
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
}