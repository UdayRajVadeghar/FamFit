import Dashboard from "@/components/Dashboard";
import { Highlighter } from "@/components/magicui/highlighter";
import ProfileButton from "@/components/ProfileButton";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen bg-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gray-50 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute top-1/2 -left-16 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-50 rounded-full blur-3xl opacity-25"></div>
          </div>

          {/* Profile Button - Top Right */}
          <div className="fixed top-6 right-6 z-50">
            <ProfileButton />
          </div>

          {/* Hero Section */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 leading-tight mb-6 font-serif">
                      Welcome to <br className="hidden sm:block" />
                      <Highlighter
                        action="underline"
                        color="#2563eb"
                        strokeWidth={3}
                        animationDuration={800}
                        padding={8}
                        isView={true}
                      >
                        <span className="text-black font-extrabold font-sans">
                          FamFit
                        </span>
                      </Highlighter>
                    </h1>
                  </div>

                  <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                    Transform your family&apos;s fitness journey with seamless
                    workout tracking, goal management, and motivation tools
                    designed for families who thrive together.
                  </p>

                  {/* Call to Action Buttons - reduce margins and arrow icon */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-12">
                    <button className="group bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
                      <span className="flex items-center justify-center space-x-2">
                        <span>Get Started Free</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </span>
                    </button>
                    <button className="bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-base shadow-md hover:shadow-lg border-2 border-blue-600 hover:border-blue-700 transform hover:scale-105">
                      Watch Demo
                    </button>
                  </div>
                </div>

                {/* Right Side - Enhanced Visual - reduce card sizes */}
                <div className="relative hidden lg:block">
                  <div className="relative h-80">
                    {/* Main feature card - smaller */}
                    <div className="absolute top-6 left-6 bg-white rounded-2xl shadow-2xl p-6 w-72 transform rotate-3 hover:rotate-6 transition-transform duration-500 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            Family Progress
                          </h3>
                          <p className="text-xs text-gray-600">
                            Track together
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Dad - Workout
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-gray-800 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Mom - Yoga
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-black rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Kids - Sports
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-1/2 h-full bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Secondary card - smaller */}
                    <div className="absolute top-28 right-3 bg-black rounded-xl shadow-xl p-5 w-56 text-white transform -rotate-2 hover:-rotate-6 transition-transform duration-500">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">
                            Achievement Unlocked!
                          </h4>
                          <p className="text-xs opacity-90">
                            Family Streak: 7 days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 bg-white/30 rounded-full border-2 border-white"></div>
                          <div className="w-6 h-6 bg-white/30 rounded-full border-2 border-white"></div>
                          <div className="w-6 h-6 bg-white/30 rounded-full border-2 border-white"></div>
                        </div>
                        <span className="text-xs font-medium">+3 more</span>
                      </div>
                    </div>

                    {/* Background decorative elements - smaller */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-3 left-3 w-64 h-64 border-2 border-gray-200 rounded-2xl transform rotate-12"></div>
                      <div className="absolute bottom-6 right-6 w-56 h-56 border-2 border-gray-300 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-gray-200 rounded-full opacity-30"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature highlights section - reduce sizes */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center group">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Family Unity
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Bring your family together with shared goals and
                    achievements
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Smart Tracking
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Advanced analytics to monitor progress and celebrate
                    milestones
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Real-time Updates
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Stay motivated with instant notifications and family
                    challenges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
