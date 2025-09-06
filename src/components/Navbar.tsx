"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Family Gym
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#"
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Home
          </a>
          <a
            href="#"
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Solutions
          </a>
          <a
            href="#"
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Integrations
          </a>
          <a
            href="#"
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Resources
          </a>
          <a
            href="#"
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Pricing
          </a>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <SignedOut>
            <SignInButton>
              <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 mt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-4">
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors"
              >
                Solutions
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors"
              >
                Integrations
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors"
              >
                Resources
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors"
              >
                Pricing
              </a>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <SignedOut>
                  <SignInButton>
                    <button className="text-gray-700 hover:text-gray-900 font-medium mb-3 block w-full text-left transition-colors">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full font-medium">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-center">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
