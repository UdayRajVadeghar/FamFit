"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  Calendar,
  Clock,
  Flame,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

interface WorkoutProgressModalProps {
  trigger?: React.ReactNode;
  familyId: string;
}

interface WorkoutData {
  progress: string;
  checkInTime: string;
  caloriesBurned: string;
  workoutType: string;
  duration: string;
  rating: "good" | "bad" | "";
}

const workoutTypes = [
  { value: "chest", label: "Chest", icon: "💪" },
  { value: "legs", label: "Legs", icon: "🦵" },
  { value: "shoulders", label: "Shoulders", icon: "🏋️" },
  { value: "arms", label: "Arms", icon: "💪" },
  { value: "triceps", label: "Triceps", icon: "💪" },
  { value: "back", label: "Back", icon: "🏋️" },
  { value: "biceps", label: "Biceps", icon: "💪" },
  { value: "core", label: "Core/Abs", icon: "🏃" },
  { value: "cardio", label: "Cardio", icon: "❤️" },
  { value: "fullBody", label: "Full Body", icon: "🏃" },
];

export default function WorkoutProgressModal({
  trigger,
  familyId,
}: WorkoutProgressModalProps) {
  const [open, setOpen] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    progress: "",
    checkInTime: new Date().toTimeString().slice(0, 5), // Current time in HH:MM format
    caloriesBurned: "",
    workoutType: "",
    duration: "",
    rating: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof WorkoutData,
    value: string | "good" | "bad"
  ) => {
    setWorkoutData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/family/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: workoutData.progress,
          checkInTime: workoutData.checkInTime,
          caloriesBurned: workoutData.caloriesBurned,
          workoutType: workoutData.workoutType,
          duration: workoutData.duration,
          rating: workoutData.rating,
          familyId: familyId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Workout progress saved successfully:", data);

        // Reset form and close modal
        setWorkoutData({
          progress: "",
          checkInTime: new Date().toTimeString().slice(0, 5),
          caloriesBurned: "",
          workoutType: "",
          duration: "",
          rating: "",
        });
        setOpen(false);
      } else {
        setError(data.error || "Failed to save workout progress");
      }
    } catch (error) {
      console.error("Network error while saving workout progress:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      workoutData.progress.trim() !== "" &&
      workoutData.checkInTime !== "" &&
      workoutData.caloriesBurned !== "" &&
      workoutData.workoutType !== "" &&
      workoutData.duration !== "" &&
      workoutData.rating !== ""
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <Activity className="mr-2 h-4 w-4" />
            Update Workout Progress
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-blue-600" />
            Today's Workout Progress
          </DialogTitle>
          <DialogDescription>
            Track your fitness journey and share your progress with family.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Today's Progress */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Activity className="h-4 w-4" />
              Today's Progress
            </label>
            <Textarea
              placeholder="Describe your workout achievements, how you felt, or any milestones reached..."
              value={workoutData.progress}
              onChange={(e) => handleInputChange("progress", e.target.value)}
              rows={3}
            />
          </div>

          {/* Check-in Time & Calories in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                Check-in Time
              </label>
              <Input
                type="time"
                value={workoutData.checkInTime}
                onChange={(e) =>
                  handleInputChange("checkInTime", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Flame className="h-4 w-4" />
                Calories Burned
              </label>
              <Input
                type="number"
                placeholder="e.g. 350"
                value={workoutData.caloriesBurned}
                onChange={(e) =>
                  handleInputChange("caloriesBurned", e.target.value)
                }
              />
            </div>
          </div>

          {/* Workout Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Target className="h-4 w-4" />
              Workout Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {workoutTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange("workoutType", type.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    workoutData.workoutType === type.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workout Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              Workout Duration (minutes)
            </label>
            <Input
              type="number"
              placeholder="e.g. 45"
              value={workoutData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
            />
          </div>

          {/* Overall Rating */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Star className="h-4 w-4" />
              Overall Rating
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleInputChange("rating", "good")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  workoutData.rating === "good"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="font-medium">Good Day</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("rating", "bad")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  workoutData.rating === "bad"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="font-medium">Bad Day</span>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              "Save Progress"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
