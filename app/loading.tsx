export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo SVG */}
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="60"
            viewBox="0 0 620 180"
            fill="none"
            className="animate-pulse"
          >
            <defs>
              <linearGradient id="mainGrad" x1="0%" y1="20%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="50%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="accentGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <g transform="translate(20, 20)">
              <text
                x="0"
                y="35"
                fontFamily="Inter, Arial Black, sans-serif"
                fontSize="40"
                fontWeight="900"
                fill="url(#mainGrad)"
                letterSpacing="-2"
              >
                ECIRAP
              </text>
            </g>
          </svg>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-orange-500 animate-spin" />
            {/* Inner pulsing circle */}
            <div className="absolute inset-2 rounded-full border border-blue-500/30 animate-pulse" />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Loading ECIRAP</h1>
          <p className="text-slate-400">Initializing your commercial intelligence platform...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full animate-[width_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  )
}
