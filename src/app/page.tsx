import Dashboard from "@/components/Dashboard";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                    Welcome to <br className="hidden sm:block" />
                    Family Gym
                  </h1>

                  <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl">
                    Track your fitness journey, manage workouts, and stay
                    motivated with your family's fitness goals all in one place.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <SignUpButton>
                      <button className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium">
                        Get started
                      </button>
                    </SignUpButton>
                    <SignInButton>
                      <button className="flex items-center text-gray-700 hover:text-gray-900 font-medium group">
                        Sign In
                        <svg
                          className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </SignInButton>
                  </div>

                  {/* Statistics */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                          500+
                        </div>
                        <div className="text-sm text-gray-600">Families</div>
                      </div>
                      <div className="text-center border-l border-gray-200">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                          10K+
                        </div>
                        <div className="text-sm text-gray-600">Workouts</div>
                      </div>
                      <div className="text-center border-l border-gray-200">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                          24/7
                        </div>
                        <div className="text-sm text-gray-600">Support</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Fitness Icon */}
                <div className="relative hidden lg:block">
                  <div className="relative">
                    {/* Large geometric shape */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-80 h-80 border-2 border-gray-200 rounded-3xl transform rotate-12 opacity-60"></div>
                    </div>

                    {/* Centered fitness icon */}
                    <div className="relative z-10 flex items-center justify-center h-80">
                      <div className="w-32 h-32 bg-white rounded-3xl shadow-lg flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22 14.86 20.57 16.29 22 18.43 19.86 19.86 21.29 21.29 19.86 19.86 18.43 22 16.29 20.57 14.86zM6.14 6.14L7.57 7.57 6.14 9 4.71 7.57 6.14 6.14zM12 12L13.43 13.43 12 14.86 10.57 13.43 12 12z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Additional decorative lines */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-96 h-96 border border-gray-200 rounded-full opacity-30"></div>
                    </div>
                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2">
                      <div className="w-64 h-64 border border-gray-200 rounded-full opacity-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
