export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Simplify your workflow. <br className="hidden sm:block" />
                Amplify your impact.
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl">
                Connect all your data sources in one place and get real-time
                insights that drive smarter actions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <button className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium">
                  Get started
                </button>
                <button className="flex items-center text-gray-700 hover:text-gray-900 font-medium group">
                  Explore Features
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
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      4.9
                    </div>
                    <div className="text-sm text-gray-600">User Reviews</div>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      100K
                    </div>
                    <div className="text-sm text-gray-600">Active users</div>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      50+
                    </div>
                    <div className="text-sm text-gray-600">Data points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Decorative Elements */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Large geometric shape */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 border-2 border-gray-200 rounded-3xl transform rotate-12 opacity-60"></div>
                </div>

                {/* Centered icon/app mockup */}
                <div className="relative z-10 flex items-center justify-center h-80">
                  <div className="w-32 h-32 bg-white rounded-3xl shadow-lg flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
  );
}
