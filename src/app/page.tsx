import Dashboard from "@/components/Dashboard";
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
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
              }}
            ></div>
          </div>

          {/* Minimal accent elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-px h-32 bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
            <div className="absolute bottom-40 left-10 w-px h-24 bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
          </div>

          {/* Profile Button - Top Right */}
          <div className="fixed top-6 right-6 z-50">
            <ProfileButton />
          </div>

          {/* Hero Section */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:pt-24 lg:pb-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  <div className="mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                      <span className="text-blue-600 text-sm font-medium">
                        ✨ New: Family Progress Tracking
                      </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 leading-[1.1] mb-6 font-serif tracking-tight">
                      The modern way to <br className="hidden sm:block" />
                      <span className="relative">
                        track family fitness
                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-blue-600 rounded-full"></div>
                      </span>
                    </h1>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl font-bold text-black font-sans tracking-tight">
                        FamFit
                      </span>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-gray-500 font-medium">
                        Professional Family Fitness
                      </span>
                    </div>
                  </div>

                  <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                    Enterprise-grade family fitness management with advanced
                    analytics,
                    <span className="text-gray-900 font-medium">
                      real-time progress tracking
                    </span>
                    , and seamless collaboration tools designed for modern
                    families.
                  </p>

                  {/* Professional CTA Section */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                    <button className="group bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-base border border-black hover:cursor-pointer">
                      <span className="flex items-center justify-center space-x-2">
                        <span>Get Started</span>
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
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Family Collaboration</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Advanced Analytics</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Real-time Sync</span>
                    </div>
                  </div>
                </div>

                {/* Professional Dashboard Preview */}
                <div className="relative hidden lg:block">
                  <div className="relative h-96">
                    {/* Main Dashboard Card */}
                    <div className="absolute top-0 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-80 transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900 text-base">
                          Family Dashboard
                        </h3>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>

                      {/* Progress Stats */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                I
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              Me
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="w-4/5 h-full bg-black rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              80%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                M
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              Mummy
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="w-full h-full bg-gray-800 rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              100%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                D
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              Daddy
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="w-3/5 h-full bg-gray-600 rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              60%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Weekly Summary */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            This Week
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            12 workouts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Card */}
                    <div className="absolute top-20 right-0 bg-black text-white rounded-lg p-5 w-64 transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            Weekly Report
                          </h4>
                          <p className="text-xs text-gray-300">
                            Family performance
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-300">
                            Goal completion
                          </span>
                          <span className="text-sm font-medium">87%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-300">
                            Active days
                          </span>
                          <span className="text-sm font-medium">5/7</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-300">Streak</span>
                          <span className="text-sm font-medium text-blue-400">
                            12 days
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Minimalist decorative elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-10 left-0 w-1 h-16 bg-gradient-to-b from-blue-600 to-transparent rounded-full"></div>
                      <div className="absolute bottom-10 right-4 w-1 h-12 bg-gradient-to-b from-gray-300 to-transparent rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Features Section */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-3xl font-light text-gray-900 mb-4 font-serif">
                  Everything your family needs to stay active
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Professional-grade tools designed for modern families who
                  prioritize health and wellness
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Family Collaboration
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Seamlessly coordinate family fitness goals with shared
                    progress tracking and unified motivation systems.
                  </p>
                </div>

                <div className="text-center group p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Advanced Analytics
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Comprehensive insights and performance metrics with detailed
                    reporting for data-driven fitness decisions.
                  </p>
                </div>

                <div className="text-center group p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
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
                        d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 11-15 0v-2a2 2 0 012-2h.5a.5.5 0 01.5.5v1.5a.5.5 0 00.5.5H8a.5.5 0 00.5-.5V7a2 2 0 012-2h3a2 2 0 012 2v10z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Real-time Sync
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Instant updates and notifications keep your family connected
                    and motivated across all devices.
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
