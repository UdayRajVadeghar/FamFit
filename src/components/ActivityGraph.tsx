"use client";

import { Calendar, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WorkoutDay {
  date: string;
  hasWorkout: boolean;
  workoutDetails?: {
    workoutType: string;
    caloriesBurnt: number;
    workoutDuration: number;
    overallRating: string;
  };
}

interface ActivityGraphProps {
  familyId: string;
  className?: string;
}

function localISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ActivityGraph({
  familyId,
  className = "",
}: ActivityGraphProps) {
  const [workoutData, setWorkoutData] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredDay, setHoveredDay] = useState<WorkoutDay | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  // Scroll to the end (latest data) when component mounts or data changes
  useEffect(() => {
    if (scrollContainerRef.current && !loading) {
      const scrollContainer = scrollContainerRef.current;
      // Small delay to ensure content is rendered
      setTimeout(() => {
        scrollContainer.scrollLeft =
          scrollContainer.scrollWidth - scrollContainer.clientWidth;
      }, 100);
    }
  }, [loading, workoutData]);

  const fetchWorkoutData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch real activity data from the backend
      const response = await fetch(
        `/api/family/progress/activity?familyId=${familyId}&months=12`
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Failed to load activity data");
        return;
      }

      const data = await response.json();
      console.log("Activity data received:", data);

      if (data.success && data.activityData) {
        setWorkoutData(data.activityData);
      } else {
        setError("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Error fetching activity data:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate last 365 days
  const generateLastYearDays = () => {
    const days: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(localISODate(d));
    }
    return days;
  };

  const getIntensityLevel = (hasWorkout: boolean, calories?: number) => {
    if (!hasWorkout) return 0;
    if (!calories) return 2;
    if (calories < 250) return 1;
    if (calories < 350) return 2;
    if (calories < 450) return 3;
    return 4;
  };

  const getIntensityColor = (level: number) => {
    const colors = [
      "bg-gray-100 hover:bg-gray-200", // No activity
      "bg-green-400 hover:bg-green-500", // Level 1 - darker green
      "bg-green-500 hover:bg-green-600", // Level 2 - darker green
      "bg-green-600 hover:bg-green-700", // Level 3 - darker green
      "bg-green-700 hover:bg-green-800", // Level 4 - darkest green
    ];
    return colors[level] || colors[0];
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Activity Graph
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchWorkoutData}
              disabled={loading}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              title="Refresh activity data"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <div className="text-sm text-gray-600">Past year</div>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading activity...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Activity Graph
            </h3>
          </div>
          <div className="text-sm text-gray-600">Past year</div>
        </div>
        <div className="text-center text-red-600 py-4">
          <p>{error}</p>
          <button
            onClick={fetchWorkoutData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const allDays = generateLastYearDays();
  const workoutMap = new Map(workoutData.map((d) => [d.date, d]));

  // Handle empty workout data gracefully
  if (!workoutData || workoutData.length === 0) {
    console.log("No workout data available");
  }

  // Calculate the grid layout properly
  const firstDayStr = allDays[0];
  const [fy, fm, fd] = firstDayStr.split("-").map(Number);
  const firstDay = new Date(fy, fm - 1, fd);

  // Calculate how many empty cells we need at the beginning
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Build weeks array
  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [];

  // Add empty cells for days before the first day
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Add all the actual days
  for (const day of allDays) {
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add the last week if it's not complete
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const workoutsCount = workoutData.filter((day) => day.hasWorkout).length;

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Activity Graph
          </h3>
        </div>
      </div>

      <div className="relative">
        <div className="flex justify-center">
          {/* Scrollable Activity grid container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
            style={{
              maxWidth: "calc(100vw - 200px)",
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5db #f3f4f6",
            }}
          >
            {/* Activity grid */}
            <div className="flex space-x-0.5 min-w-max">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col space-y-0.5">
                  {week.map((dayStr, dayIndex) => {
                    if (!dayStr) {
                      return (
                        <div
                          key={`empty-${weekIndex}-${dayIndex}`}
                          className="w-3 h-3"
                        />
                      );
                    }

                    const dayData = workoutMap.get(dayStr);
                    const intensityLevel = getIntensityLevel(
                      dayData?.hasWorkout || false,
                      dayData?.workoutDetails?.caloriesBurnt
                    );
                    const colorClass = getIntensityColor(intensityLevel);

                    return (
                      <button
                        key={dayStr}
                        type="button"
                        className={`w-3 h-3 ${colorClass} border border-gray-200 rounded-sm transition-all duration-200 hover:scale-110 hover:border-gray-400`}
                        onMouseEnter={() => {
                          setHoveredDay(
                            dayData || { date: dayStr, hasWorkout: false }
                          );
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        onMouseMove={handleMouseMove}
                        onClick={() => {
                          if (window.innerWidth < 640) {
                            setHoveredDay(
                              dayData || { date: dayStr, hasWorkout: false }
                            );
                            setTimeout(() => setHoveredDay(null), 3000);
                          }
                        }}
                        aria-label={
                          dayData?.hasWorkout
                            ? `Workout on ${formatDate(dayStr)}`
                            : `No workout on ${formatDate(dayStr)}`
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats only */}
        <div className="flex justify-center mt-4">
          <div className="text-xs text-gray-500">
            {workoutsCount} workout{workoutsCount !== 1 ? "s" : ""} in the last
            year
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm pointer-events-none max-w-xs"
            style={{
              left: Math.min(mousePosition.x + 12, window.innerWidth - 240),
              top: Math.max(mousePosition.y - 80, 10),
            }}
          >
            <div className="font-semibold mb-1">
              {formatDate(hoveredDay.date)}
            </div>
            {hoveredDay.hasWorkout && hoveredDay.workoutDetails ? (
              <div className="space-y-1">
                <div className="text-green-300">
                  {hoveredDay.workoutDetails.workoutType} workout
                </div>
                <div className="text-xs text-gray-300">
                  {hoveredDay.workoutDetails.workoutDuration} minutes •{" "}
                  {hoveredDay.workoutDetails.caloriesBurnt} calories
                </div>
                <div className="text-xs text-yellow-300">
                  Rating: {hoveredDay.workoutDetails.overallRating}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-xs">No workout recorded</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
