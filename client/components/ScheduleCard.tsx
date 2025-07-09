import { ChevronUp, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ScheduleBadge } from "./ScheduleBadge";
import { ModeSelector } from "./ModeSelector";
import { WeekdayPicker } from "./WeekdayPicker";
import { TimeInput } from "./TimeInput";
import { Switch } from "./Switch";

interface Schedule {
  id: number;
  mode: string | null;
  temperature: number | null;
  days: string[];
  time: { hour: string; minute: string; period: string };
  enabled: boolean;
  fanMode: string;
  saved?: boolean;
  isDraft?: boolean;
}

interface ScheduleCardProps {
  schedule: Schedule;
  onUpdate: (updates: Partial<Schedule>) => void;
  onDelete: () => void;
}

export function ScheduleCard({
  schedule,
  onUpdate,
  onDelete,
}: ScheduleCardProps) {
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [originalSchedule, setOriginalSchedule] = useState<Schedule | null>(
    null,
  );

  // Track original values when schedule is first saved (not a new schedule)
  useState(() => {
    if (schedule.saved && !originalSchedule) {
      setOriginalSchedule(schedule);
    }
  });
  const formatDays = (days: string[]) => {
    if (days.length === 0) return "No days selected";
    if (days.length === 7) return "Everyday";
    const dayNames = {
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
    };
    return days.map((day) => dayNames[day as keyof typeof dayNames]).join(", ");
  };

  const formatTime = (time: {
    hour: string;
    minute: string;
    period: string;
  }) => {
    if (!time.hour || !time.minute) return "No time set";
    return `${time.hour}:${time.minute} ${time.period}`;
  };

  const getScheduleStatus = () => {
    // Use original schedule for summary if it exists (during editing), otherwise use current schedule
    const displaySchedule =
      originalSchedule && schedule.saved ? originalSchedule : schedule;

    if (!displaySchedule.mode) {
      return {
        text: "NO MODE SELECTED",
        badge: null,
        color: "text-foreground",
      };
    }

    if (displaySchedule.mode === "cool" && displaySchedule.temperature) {
      return {
        text: `COOL TO ${displaySchedule.temperature}°`,
        badge: displaySchedule.mode,
        color: "#1772D6",
      };
    }

    if (displaySchedule.mode === "heat" && displaySchedule.temperature) {
      return {
        text: `HEAT TO ${displaySchedule.temperature}°`,
        badge: displaySchedule.mode,
        color: "#A23110",
      };
    }

    if (displaySchedule.mode === "auto") {
      return {
        text: "AUTO 68-75°",
        badge: displaySchedule.mode,
        color: "#9D4BB5",
      };
    }

    if (displaySchedule.mode === "off") {
      return {
        text: "OFF",
        badge: displaySchedule.mode,
        color: "text-foreground",
      };
    }

    return {
      text: "NO MODE SELECTED",
      badge: null,
      color: "text-foreground",
    };
  };

  const status = getScheduleStatus();

  // Check if schedule is complete and can be saved
  const isScheduleComplete = () => {
    return (
      schedule.mode &&
      schedule.mode !== null &&
      schedule.days.length > 0 &&
      schedule.time.hour &&
      schedule.time.minute
    );
  };

  // Check if schedule has unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalSchedule || !schedule.saved) return false;

    return (
      originalSchedule.mode !== schedule.mode ||
      originalSchedule.temperature !== schedule.temperature ||
      JSON.stringify(originalSchedule.days) !== JSON.stringify(schedule.days) ||
      JSON.stringify(originalSchedule.time) !== JSON.stringify(schedule.time) ||
      originalSchedule.fanMode !== schedule.fanMode ||
      originalSchedule.enabled !== schedule.enabled
    );
  };

  const handleSave = () => {
    // Mark the schedule as saved/complete and clear draft state
    onUpdate({ saved: true, isDraft: false });

    // Update original schedule to current values
    setOriginalSchedule({ ...schedule, saved: true, isDraft: false });

    // Show success banner
    setShowSuccessBanner(true);

    // Hide banner after 3 seconds
    setTimeout(() => {
      setShowSuccessBanner(false);
    }, 3000);
  };

  // Wrapper function to handle updates and set draft state
  const handleUpdate = (updates: Partial<Schedule>) => {
    // If this is a saved schedule and we're making changes, mark as draft
    if (schedule.saved && originalSchedule) {
      const newSchedule = { ...schedule, ...updates };
      const willHaveChanges =
        originalSchedule.mode !== newSchedule.mode ||
        originalSchedule.temperature !== newSchedule.temperature ||
        JSON.stringify(originalSchedule.days) !==
          JSON.stringify(newSchedule.days) ||
        JSON.stringify(originalSchedule.time) !==
          JSON.stringify(newSchedule.time) ||
        originalSchedule.fanMode !== newSchedule.fanMode ||
        originalSchedule.enabled !== newSchedule.enabled;

      if (willHaveChanges) {
        updates.isDraft = true;
      } else {
        updates.isDraft = false;
      }
    }

    onUpdate(updates);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="absolute -top-2 left-0 right-0 z-10 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#E8FCE8] rounded-lg shadow-lg border border-green-200">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.47726 2 2 6.47726 2 12C2 17.5227 6.47726 22 12 22C17.5227 22 22 17.5227 22 12C22 6.47726 17.5227 2 12 2ZM18.4756 8.94891L10.5158 16.7305C10.5073 16.739 10.4988 16.7471 10.4902 16.7553C10.4877 16.7578 10.4851 16.7604 10.4821 16.7625C10.474 16.7702 10.4655 16.7774 10.4569 16.7843C10.4493 16.7911 10.4416 16.7971 10.4339 16.803C10.4258 16.8094 10.4177 16.8154 10.4096 16.8214C10.3985 16.8295 10.3874 16.8372 10.3759 16.8444C10.3643 16.8521 10.3528 16.859 10.3409 16.8658C10.3174 16.8799 10.2931 16.8922 10.2683 16.9033C10.2564 16.9089 10.2444 16.914 10.2325 16.9187C10.2193 16.9238 10.206 16.9289 10.1928 16.9336C10.1813 16.9375 10.1693 16.9413 10.1574 16.9447C10.1446 16.9486 10.1318 16.952 10.119 16.955C10.1062 16.958 10.0934 16.9609 10.0806 16.9631C10.0289 16.9729 9.976 16.978 9.92354 16.978C9.88041 16.978 9.83783 16.9746 9.79553 16.9678C9.78439 16.9665 9.77326 16.9644 9.76271 16.9622C9.75074 16.9601 9.73884 16.9575 9.72721 16.9545C9.72077 16.9533 9.71441 16.9516 9.70854 16.9494C9.69993 16.9477 9.69184 16.9452 9.68374 16.9426C9.65773 16.9349 9.63159 16.9259 9.60655 16.9153C9.58899 16.908 9.57149 16.9003 9.55439 16.8918C9.53729 16.8833 9.52026 16.8743 9.50409 16.8645C9.50021 16.8624 9.49637 16.8602 9.49253 16.8577C9.48144 16.8508 9.47077 16.844 9.4601 16.8368C9.44858 16.8291 9.43748 16.8214 9.42639 16.8129C9.40633 16.7984 9.38713 16.7826 9.36878 16.7659C9.36067 16.7587 9.35299 16.7514 9.34574 16.7442C9.34318 16.742 9.34104 16.7399 9.33891 16.7378L9.32867 16.7275L5.5026 12.95C5.17573 12.6274 5.17231 12.1004 5.49535 11.7735C5.81796 11.4462 6.34497 11.4428 6.67184 11.7658L9.92654 15.0292L17.3124 7.75873C17.6409 7.4374 18.1675 7.44337 18.4889 7.77196C18.8102 8.10055 18.8042 8.62757 18.4756 8.94891Z"
                fill="#056121"
              />
            </svg>
            <span className="text-sm font-normal text-[#2E3237]">
              Schedule saved successfully
            </span>
          </div>
        </div>
      )}
      {/* Summary Section */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 h-6">
            <div className="flex items-center gap-2 h-6">
              {status.badge && <ScheduleBadge mode={status.badge} />}
              <span
                className="text-sm font-semibold uppercase tracking-wide leading-6"
                style={{
                  color:
                    typeof status.color === "string" &&
                    status.color.startsWith("#")
                      ? status.color
                      : undefined,
                }}
              >
                {status.text}
              </span>
            </div>
            <div className="flex items-center h-6">
              {!schedule.enabled && (
                <div className="px-5 py-0.5 bg-[#D9EBFC] rounded-full h-5 flex items-center">
                  <span className="text-xs font-semibold text-[#034F8C] leading-none">
                    Paused
                  </span>
                </div>
              )}
              {schedule.isDraft && schedule.enabled && (
                <div className="px-5 py-0.5 bg-[#FAE5C6] rounded-full h-5 flex items-center">
                  <span className="text-xs font-semibold text-[#663500] leading-none">
                    Draft
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-foreground leading-5 h-5">
            <span>
              {formatDays(
                originalSchedule && schedule.saved
                  ? originalSchedule.days
                  : schedule.days,
              )}
            </span>
            <span className="font-semibold">•</span>
            <span>
              {formatTime(
                originalSchedule && schedule.saved
                  ? originalSchedule.time
                  : schedule.time,
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Switch
            checked={schedule.enabled}
            onCheckedChange={(enabled) => handleUpdate({ enabled })}
          />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isCollapsed ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="w-5 h-5 text-foreground"
              >
                <path
                  d="M2.16651 7.90885C2.16607 8.05697 2.22279 8.19916 2.3241 8.30392L10.1376 16.3273C10.3478 16.544 10.688 16.544 10.8982 16.3273L18.6706 8.27812C18.8095 8.13815 18.8648 7.93172 18.8154 7.73781C18.7659 7.54389 18.6193 7.39247 18.4317 7.34148C18.244 7.29049 18.0444 7.34781 17.909 7.49151L10.5154 15.1461L3.08416 7.51428C2.92993 7.35601 2.69875 7.30912 2.49809 7.3954C2.29742 7.48168 2.16663 7.68421 2.16651 7.90885Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="w-5 h-5 text-foreground"
              >
                <path
                  d="M18.6889 15.5554C18.5147 15.7058 18.2516 15.6866 18.1012 15.5124L10.4998 6.71089L2.89852 15.5124C2.74811 15.6866 2.48499 15.7058 2.31083 15.5554C2.13668 15.405 2.11743 15.1419 2.26783 14.9677L10.0268 5.98364C10.2761 5.69499 10.7236 5.69499 10.9729 5.98364L18.7319 14.9677C18.8823 15.1419 18.863 15.405 18.6889 15.5554Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Controls Section */}
      {!isCollapsed && (
        <>
          <div
            className={`mt-4 space-y-4 ${!schedule.enabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            {/* Mode Selection */}
            <div className="space-y-2.5">
              <label
                className={`text-sm font-semibold ${!schedule.enabled ? "text-gray-400" : "text-muted-foreground"}`}
              >
                Mode
              </label>
              <ModeSelector
                selectedMode={schedule.mode}
                onModeSelect={(mode) => {
                  if (!schedule.enabled) return;
                  // Set default temperature when mode is selected
                  const updates: Partial<Schedule> = { mode };
                  if (mode === "cool" && !schedule.temperature) {
                    updates.temperature = 73;
                  } else if (mode === "heat" && !schedule.temperature) {
                    updates.temperature = 68;
                  } else if (mode === "auto" && !schedule.temperature) {
                    updates.temperature = 70;
                  } else if (mode === "off") {
                    updates.temperature = null;
                  }
                  handleUpdate(updates);
                }}
              />
            </div>

            {/* Temperature Controls */}
            {schedule.mode && schedule.mode !== "off" && (
              <div className="space-y-2.5">
                <label
                  className={`text-sm font-semibold ${!schedule.enabled ? "text-gray-400" : "text-muted-foreground"}`}
                >
                  Temperature
                </label>
                <div className="flex gap-3">
                  {schedule.mode === "auto" ? (
                    <>
                      {/* Heat Control */}
                      <div className="flex-1 h-10 px-3 flex items-center justify-between bg-secondary rounded-lg">
                        <button
                          onClick={() => {
                            const currentHeat = 68;
                            const newTemp = Math.max(50, currentHeat - 1);
                            handleUpdate({ temperature: newTemp });
                          }}
                          className="p-0 hover:bg-gray-200 rounded transition-colors"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M1.66675 7.25241C1.66631 7.40053 1.72303 7.54272 1.82434 7.64748L9.63785 15.6708C9.848 15.8876 10.1883 15.8876 10.3984 15.6708L18.1708 7.62169C18.3098 7.48171 18.3651 7.27529 18.3156 7.08137C18.2662 6.88745 18.1196 6.73604 17.9319 6.68505C17.7443 6.63406 17.5446 6.69138 17.4093 6.83508L10.0157 14.4897L2.5844 6.85785C2.43017 6.69958 2.19899 6.65269 1.99833 6.73897C1.79766 6.82525 1.66687 7.02778 1.66675 7.25241Z"
                              fill="#E96549"
                            />
                          </svg>
                        </button>
                        <span
                          className="text-base font-semibold"
                          style={{ color: "#A23110" }}
                        >
                          68°
                        </span>
                        <button
                          onClick={() => {
                            const currentHeat = 68;
                            const newTemp = Math.min(85, currentHeat + 1);
                            handleUpdate({ temperature: newTemp });
                          }}
                          className="p-0 hover:bg-gray-200 rounded transition-colors"
                        >
                          <svg
                            width="21"
                            height="20"
                            viewBox="0 0 21 20"
                            fill="none"
                          >
                            <path
                              d="M2.16675 14.4143C2.16631 14.2661 2.22303 14.1239 2.32434 14.0192L10.1379 5.99582C10.348 5.77906 10.6883 5.77906 10.8984 5.99582L18.6708 14.045C18.8097 14.185 18.8651 14.3914 18.8156 14.5853C18.7662 14.7792 18.6196 14.9306 18.4319 14.9816C18.2443 15.0326 18.0446 14.9753 17.9093 14.8316L10.5157 7.17699L3.0844 14.8088C2.93017 14.9671 2.69899 15.014 2.49833 14.9277C2.29766 14.8414 2.16687 14.6389 2.16675 14.4143Z"
                              fill="#E96549"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Cool Control */}
                      <div className="flex-1 h-10 px-3 flex items-center justify-between bg-secondary rounded-lg">
                        <button
                          onClick={() => {
                            const currentCool = 75;
                            const newTemp = Math.max(65, currentCool - 1);
                            handleUpdate({ temperature: newTemp });
                          }}
                          className="p-0 hover:bg-gray-200 rounded transition-colors"
                        >
                          <svg
                            width="21"
                            height="20"
                            viewBox="0 0 21 20"
                            fill="none"
                          >
                            <path
                              d="M2.16675 7.25241C2.16631 7.40053 2.22303 7.54272 2.32434 7.64748L10.1379 15.6708C10.348 15.8876 10.6883 15.8876 10.8984 15.6708L18.6708 7.62169C18.8098 7.48171 18.3651 7.27529 18.3156 7.08137C18.2662 6.88745 18.1196 6.73604 18.4319 6.68505C18.2443 6.63406 18.0446 6.69138 17.9093 6.83508L10.5157 14.4897L3.0844 6.85785C2.93017 6.69958 2.69899 6.65269 2.49833 6.73897C2.29766 6.82525 2.16687 7.02778 2.16675 7.25241Z"
                              fill="#1772D6"
                            />
                          </svg>
                        </button>
                        <span
                          className="text-base font-semibold"
                          style={{ color: "#1772D6" }}
                        >
                          75°F
                        </span>
                        <button
                          onClick={() => {
                            const currentCool = 75;
                            const newTemp = Math.min(90, currentCool + 1);
                            handleUpdate({ temperature: newTemp });
                          }}
                          className="p-0 hover:bg-gray-200 rounded transition-colors"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M1.66675 14.4143C1.66631 14.2661 1.72303 14.1239 1.82434 14.0192L9.63785 5.99582C9.848 5.77906 10.1883 5.77906 10.3984 5.99582L18.1708 14.045C18.3097 14.185 18.3651 14.3914 18.3156 14.5853C18.2662 14.7792 18.1196 14.9306 17.9319 14.9816C17.7443 15.0326 17.5446 14.9753 17.4093 14.8316L10.0157 7.17699L2.5844 14.8088C2.93017 14.9671 2.69899 15.014 2.49833 14.9277C2.29766 14.8414 2.16687 14.6389 2.16675 14.4143Z"
                              fill="#1772D6"
                            />
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Single mode control for heat or cool
                    <div className="flex-1 h-10 px-3 flex items-center justify-between bg-secondary rounded-lg">
                      <button
                        onClick={() => {
                          const currentTemp =
                            schedule.temperature ||
                            (schedule.mode === "cool" ? 73 : 68);
                          const newTemp = Math.max(50, currentTemp - 1);
                          handleUpdate({ temperature: newTemp });
                        }}
                        className="p-0 hover:bg-gray-200 rounded transition-colors"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M1.66675 7.25241C1.66631 7.40053 1.72303 7.54272 1.82434 7.64748L9.63785 15.6708C9.848 15.8876 10.1883 15.8876 10.3984 15.6708L18.1708 7.62169C18.3098 7.48171 18.3651 7.27529 18.3156 7.08137C18.2662 6.88745 18.1196 6.73604 17.9319 6.68505C17.7443 6.63406 17.5446 6.69138 17.4093 6.83508L10.0157 14.4897L2.5844 6.85785C2.43017 6.69958 2.19899 6.65269 1.99833 6.73897C1.79766 6.82525 1.66687 7.02778 1.66675 7.25241Z"
                            fill={
                              schedule.mode === "cool" ? "#1772D6" : "#E96549"
                            }
                          />
                        </svg>
                      </button>
                      <span
                        className="text-base font-semibold"
                        style={{
                          color:
                            schedule.mode === "cool" ? "#1772D6" : "#A23110",
                        }}
                      >
                        {schedule.temperature ||
                          (schedule.mode === "cool" ? 73 : 68)}
                        °{schedule.mode === "cool" ? "F" : ""}
                      </span>
                      <button
                        onClick={() => {
                          const currentTemp =
                            schedule.temperature ||
                            (schedule.mode === "cool" ? 73 : 68);
                          const newTemp = Math.min(90, currentTemp + 1);
                          handleUpdate({ temperature: newTemp });
                        }}
                        className="p-0 hover:bg-gray-200 rounded transition-colors"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M1.66675 14.4143C1.66631 14.2661 1.72303 14.1239 1.82434 14.0192L9.63785 5.99582C9.848 5.77906 10.1883 5.77906 10.3984 5.99582L18.1708 14.045C18.3097 14.185 18.3651 14.3914 18.3156 14.5853C18.2662 14.7792 18.1196 14.9306 17.9319 14.9816C17.7443 15.0326 17.5446 14.9753 17.4093 14.8316L10.0157 7.17699L2.5844 14.8088C2.93017 14.9671 2.69899 15.014 2.49833 14.9277C2.29766 14.8414 2.16687 14.6389 2.16675 14.4143Z"
                            fill={
                              schedule.mode === "cool" ? "#1772D6" : "#E96549"
                            }
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fan Mode Selection */}
            <div className="space-y-2.5">
              <label
                className={`text-sm font-semibold ${!schedule.enabled ? "text-gray-400" : "text-muted-foreground"}`}
              >
                Fan Mode
              </label>
              <div className="flex gap-1">
                <button
                  className={`flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-colors ${
                    schedule.fanMode === "auto"
                      ? "bg-foreground text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                  onClick={() => handleUpdate({ fanMode: "auto" })}
                >
                  <FanAutoIcon />
                  Auto
                </button>
                <button
                  className={`flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-colors ${
                    schedule.fanMode === "on"
                      ? "bg-foreground text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                  onClick={() => handleUpdate({ fanMode: "on" })}
                >
                  <FanOnIcon />
                  On
                </button>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="space-y-6 pt-2">
              <div className="space-y-2.5">
                <label
                  className={`text-sm font-semibold ${!schedule.enabled ? "text-gray-400" : "text-muted-foreground"}`}
                >
                  Schedule
                </label>
                <div className="space-y-4">
                  <WeekdayPicker
                    selectedDays={schedule.days}
                    onDaysChange={(days) => handleUpdate({ days })}
                  />
                  <TimeInput
                    time={schedule.time}
                    onTimeChange={(time) => handleUpdate({ time })}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                className={`w-full h-10 px-6 font-semibold rounded-lg transition-colors ${
                  !schedule.enabled
                    ? "bg-[#CCD1D8] text-[#95A0AC] cursor-not-allowed"
                    : (isScheduleComplete() && !schedule.saved) ||
                        (schedule.saved && hasUnsavedChanges())
                      ? "bg-[#1D2025] text-white hover:bg-gray-800"
                      : "bg-button-disabled-bg text-button-disabled-text cursor-not-allowed"
                }`}
                disabled={
                  !schedule.enabled ||
                  !isScheduleComplete() ||
                  (schedule.saved && !hasUnsavedChanges())
                }
                onClick={
                  schedule.enabled &&
                  ((isScheduleComplete() && !schedule.saved) ||
                    (schedule.saved && hasUnsavedChanges()))
                    ? handleSave
                    : undefined
                }
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Delete Button - Always Enabled */}
          <div className="pt-4 flex justify-center">
            <button
              className="flex items-center gap-3 px-6 py-1 text-destructive font-semibold rounded-2xl hover:bg-red-50 transition-colors"
              onClick={onDelete}
            >
              <Trash2 className="w-5 h-5" />
              Delete Schedule
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FanAutoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M6.23612 1.6566C6.29849 1.45862 6.48123 1.33331 6.6786 1.33331H8.59347C9.00959 1.33331 9.33184 1.57948 9.50301 1.88788C9.67274 2.19368 9.7131 2.59079 9.5478 2.94562C9.37396 3.3188 9.25193 3.69602 9.24998 4.0021C9.24706 4.46041 9.51069 4.96144 9.70385 5.25922C9.89686 5.55677 9.70371 5.99998 9.30662 5.99998H7.11742L7.02107 5.90895L7.02049 5.9084L7.01959 5.90755L7.01689 5.90497L7.00793 5.89632C7.00044 5.88902 6.98993 5.87869 6.97681 5.86552C6.95059 5.83918 6.91382 5.80136 6.86962 5.75354C6.78144 5.65815 6.6625 5.52166 6.53836 5.35601C6.2959 5.03249 6.00823 4.56462 5.92141 4.05608C5.84534 3.61055 5.90497 3.08388 5.98643 2.65034C6.06939 2.20887 6.18245 1.82696 6.23612 1.6566Z"
        fill="currentColor"
      />
      <path
        d="M14.9166 8.54095V6.75604C14.9166 6.56991 14.8053 6.39439 14.6212 6.32326C14.4463 6.25569 14.024 6.10013 13.5415 5.97818C13.0715 5.85939 12.4929 5.75856 12.0272 5.83807C11.4925 5.92937 11.0561 6.2819 10.7723 6.57192C10.626 6.7214 10.5098 6.86517 10.4299 6.97168C10.3899 7.02514 10.3586 7.06973 10.3368 7.10165C10.326 7.11763 10.3175 7.13047 10.3115 7.1397L10.3043 7.1508L10.3021 7.15423L10.3014 7.15539L10.3009 7.15617L10.25 7.23738V8.27734C10.4616 8.18486 10.6848 8.11373 10.9166 8.06666V7.43553C10.9298 7.41695 10.9454 7.39544 10.9634 7.37155C11.0303 7.28229 11.1276 7.16198 11.2488 7.03818C11.4998 6.78165 11.8134 6.5509 12.1394 6.49523C12.4579 6.44085 12.9196 6.50864 13.3781 6.62452C13.7307 6.71362 14.051 6.823 14.25 6.89591V8.54095C14.25 8.72784 14.0809 8.89591 13.8755 8.91319C14.049 9.07754 14.2048 9.26033 14.3398 9.45844C14.671 9.29213 14.9166 8.96416 14.9166 8.54095Z"
        fill="currentColor"
      />
      <path
        d="M6.97947 9.99998H8.52734C8.43486 10.2116 8.36373 10.4348 8.31666 10.6666H7.30127C7.45413 10.9231 7.58588 11.2623 7.5833 11.6688C7.5798 12.2175 7.32466 12.9011 7.08777 13.4288C6.964 13.7045 7.17227 14 7.42051 14H9.32488C9.33771 13.9476 9.3519 13.8882 9.36692 13.8231C9.54572 13.9824 9.7418 14.1227 9.95198 14.2409C9.94448 14.2706 9.93768 14.2972 9.93175 14.3201C9.87717 14.5304 9.68806 14.6666 9.48194 14.6666H7.42051C6.63538 14.6666 6.18013 13.8229 6.47957 13.1558C6.71609 12.6289 6.91413 12.0593 6.91664 11.6645C6.9189 11.3095 6.75795 11.0202 6.60036 10.8235C6.46608 10.6559 6.47649 10.45 6.53368 10.3104C6.59115 10.1702 6.73926 9.99998 6.97947 9.99998Z"
        fill="currentColor"
      />
      <path
        d="M9.58331 7.99998C9.58331 8.73636 8.98636 9.33331 8.24998 9.33331C7.5136 9.33331 6.91665 8.73636 6.91665 7.99998C6.91665 7.2636 7.5136 6.66665 8.24998 6.66665C8.98636 6.66665 9.58331 7.2636 9.58331 7.99998ZM8.91665 7.99998C8.91665 7.63179 8.61817 7.33331 8.24998 7.33331C7.88179 7.33331 7.58331 7.63179 7.58331 7.99998C7.58331 8.36817 7.88179 8.66665 8.24998 8.66665C8.61817 8.66665 8.91665 8.36817 8.91665 7.99998Z"
        fill="currentColor"
      />
      <path
        d="M1.58331 9.24407C1.58331 9.43022 1.69468 9.60575 1.87881 9.67686C2.05371 9.74442 2.476 9.89993 2.95852 10.0219C3.42851 10.1406 4.00703 10.2414 4.47275 10.1619C5.00749 10.0706 5.4439 9.71805 5.72769 9.42803C5.87395 9.27856 5.99019 9.13478 6.07003 9.02827C6.11011 8.97482 6.1414 8.93022 6.16311 8.8983C6.17398 8.88233 6.18247 8.86949 6.18849 8.86026L6.19566 8.84915L6.19784 8.84573L6.19857 8.84457L6.19907 8.84378L6.24998 8.76257V6.93264C6.24998 6.54152 5.823 6.3523 5.52871 6.51749C5.28537 6.65408 4.87127 6.83619 4.41877 6.83331C4.03461 6.83086 3.52721 6.67961 3.05997 6.4953C2.39722 6.23386 1.58331 6.68866 1.58331 7.45906V9.24407Z"
        fill="currentColor"
      />
      <path
        d="M12.4067 12.0427L12.8294 13.3333H13.5833L11.978 8.66665H11.1916L9.58331 13.3333H10.3313L10.754 12.0427H12.4067ZM11.8124 10.1162L12.2234 11.3878H10.9521L11.366 10.1162C11.3798 10.0654 11.3995 9.99332 11.4251 9.90007C11.4527 9.80682 11.4803 9.70722 11.5079 9.60125C11.5375 9.49317 11.5621 9.39568 11.5818 9.30879C11.6015 9.38085 11.6262 9.46986 11.6557 9.57582C11.6853 9.67966 11.7149 9.78245 11.7444 9.88418C11.774 9.98378 11.7967 10.0611 11.8124 10.1162Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FanOnIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M11.3115 2.09036C11.4956 1.99448 11.7134 2.03508 11.853 2.17465L13.207 3.52867C13.5012 3.8229 13.555 4.22483 13.458 4.56395C13.3618 4.9002 13.1095 5.20953 12.7417 5.34355C12.3549 5.4845 12.0019 5.66495 11.7841 5.88001C11.458 6.20201 11.2901 6.74271 11.2161 7.08985C11.1422 7.43673 10.6922 7.61355 10.4114 7.33277L8.86343 5.78477L8.85966 5.65227C8.85966 5.65227 8.85966 5.65227 9.19286 5.6428L8.85966 5.65227L8.85964 5.65147L8.85961 5.65024L8.85952 5.6465L8.85931 5.63405C8.85917 5.62359 8.85904 5.60886 8.85908 5.59027C8.85917 5.5531 8.85991 5.50036 8.86246 5.43529C8.86757 5.30549 8.87997 5.12487 8.90932 4.91996C8.96664 4.51975 9.09406 3.98551 9.39227 3.56452C9.65352 3.1957 10.0681 2.86544 10.4322 2.61649C10.8031 2.36298 11.1531 2.17288 11.3115 2.09036Z"
        fill="currentColor"
      />
      <path
        d="M8.25004 9.33318C8.98642 9.33318 9.58338 8.73623 9.58338 7.99985C9.58338 7.26347 8.98642 6.66651 8.25004 6.66651C7.51366 6.66651 6.91671 7.26347 6.91671 7.99985C6.91671 8.73623 7.51366 9.33318 8.25004 9.33318ZM8.25004 8.66651C7.88185 8.66651 7.58338 8.36804 7.58338 7.99985C7.58338 7.63166 7.88185 7.33318 8.25004 7.33318C8.61823 7.33318 8.91671 7.63166 8.91671 7.99985C8.91671 8.36804 8.61823 8.66651 8.25004 8.66651Z"
        fill="currentColor"
      />
      <path
        d="M4.40714 13.5849C4.55289 13.7307 4.78293 13.7681 4.97028 13.6579C5.14413 13.5557 5.54811 13.3114 5.96884 13.0087C6.38017 12.7128 6.84449 12.3355 7.10784 11.9637C7.41634 11.5281 7.48093 11.0361 7.47628 10.6745C7.47392 10.4913 7.45374 10.3337 7.43403 10.2212C7.42414 10.1647 7.41426 10.1189 7.40656 10.0863C7.4027 10.0699 7.39938 10.0568 7.39686 10.0472L7.39371 10.0354L7.39264 10.0316L7.39224 10.0302L7.39194 10.0291L7.36817 9.9463L5.93746 8.51559C5.7676 8.34573 5.54251 8.36136 5.40272 8.41989C5.26359 8.47814 5.1106 8.6164 5.08705 8.82986C5.05941 9.08036 4.96866 9.39873 4.71602 9.64817C4.43506 9.92557 3.89227 10.1883 3.35247 10.3936C2.66906 10.6535 2.39432 11.5721 2.94949 12.1273L4.40714 13.5849Z"
        fill="currentColor"
      />
      <path
        d="M13.8437 11.8342L12.5816 13.0963C12.0368 13.6411 11.1397 13.3871 10.8559 12.7336C10.6559 12.2729 10.4041 11.8071 10.1342 11.5338C9.81627 11.2118 9.39469 11.0477 9.12604 10.9723C8.80113 10.881 8.63302 10.4453 8.90958 10.1687L10.2035 8.87473L10.297 8.85331C10.297 8.85331 10.297 8.85331 10.3715 9.17821L10.297 8.85331L10.2979 8.8531L10.2992 8.8528L10.3032 8.85192L10.3161 8.84914C10.3269 8.84686 10.342 8.84379 10.3609 8.84018C10.3989 8.83296 10.4525 8.82356 10.5187 8.81409C10.6504 8.79524 10.8343 8.77577 11.0434 8.7735C11.4491 8.76909 12.007 8.8284 12.4497 9.14196C12.8352 9.41506 13.173 9.89545 13.4214 10.3118C13.6763 10.7392 13.8649 11.1478 13.9408 11.3193C14.0207 11.4997 13.9753 11.7026 13.8437 11.8342Z"
        fill="currentColor"
      />
      <path
        d="M2.65634 4.16543C2.52471 4.29706 2.47934 4.49993 2.55925 4.68041C2.63516 4.85186 2.8238 5.26043 3.07878 5.68782C3.32714 6.10413 3.66495 6.58447 4.05048 6.85756C4.49316 7.17112 5.05103 7.23044 5.45677 7.22603C5.66589 7.22376 5.84975 7.20429 5.98152 7.18543C6.04765 7.17597 6.10131 7.16657 6.13924 7.15935C6.15822 7.15574 6.1733 7.15266 6.18409 7.15039L6.19701 7.14761L6.20097 7.14673L6.20231 7.14643L6.20321 7.14622L6.29664 7.1248L7.59059 5.83084C7.86716 5.55428 7.69904 5.11856 7.37413 5.02727C7.10548 4.95179 6.6839 4.78775 6.36597 4.46574C6.09606 4.19236 5.84422 3.72663 5.64416 3.26592C5.36039 2.61241 4.46328 2.35849 3.91853 2.90324L2.65634 4.16543Z"
        fill="currentColor"
      />
    </svg>
  );
}
