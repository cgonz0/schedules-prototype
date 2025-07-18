import { ChevronUp, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ScheduleBadge } from "./ScheduleBadge";
import { ModeSelector } from "./ModeSelector";
import { WeekdayPicker } from "./WeekdayPicker";
import { TimeInput } from "./TimeInput";

interface Schedule {
  id: number;
  mode: string | null;
  temperature: number | null;
  heatTemp?: number;
  coolTemp?: number;
  days: string[];
  time: { hour: string; minute: string; period: string };
  enabled: boolean;
  fanMode: string;
  saved?: boolean;
  isDraft?: boolean;
}

interface ScheduleCardProps {
  schedule: Schedule;
  isAwayModeActive?: boolean;
  onUpdate: (updates: Partial<Schedule>) => void;
  onDelete: () => void;
}

export function ScheduleCard({
  schedule,
  isAwayModeActive = false,
  onUpdate,
  onDelete,
}: ScheduleCardProps) {
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

    const weekdays = ["mon", "tue", "wed", "thu", "fri"];
    const weekends = ["sat", "sun"];

    const hasAllWeekdays = weekdays.every((day) => days.includes(day));
    const hasAllWeekends = weekends.every((day) => days.includes(day));

    if (hasAllWeekdays && hasAllWeekends) {
      return "Everyday";
    }

    if (hasAllWeekdays && days.length === 5) {
      return "Weekdays";
    }

    if (hasAllWeekends && days.length === 2) {
      return "Weekends";
    }

    const dayOrder = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayNames = {
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
    };

    // Sort days according to week order
    const sortedDays = days.sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b),
    );
    return sortedDays
      .map((day) => dayNames[day as keyof typeof dayNames])
      .join(", ");
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
      // For auto mode, we'll use stored heat and cool temps or defaults
      const heatTemp = displaySchedule.heatTemp || 68;
      const coolTemp = displaySchedule.coolTemp || 75;
      return {
        text: `AUTO ${heatTemp}-${coolTemp}°`,
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
      schedule.time.minute &&
      schedule.fanMode &&
      schedule.fanMode !== null
    );
  };

  // Check if schedule has unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalSchedule || !schedule.saved) return false;

    return (
      originalSchedule.mode !== schedule.mode ||
      originalSchedule.temperature !== schedule.temperature ||
      originalSchedule.heatTemp !== schedule.heatTemp ||
      originalSchedule.coolTemp !== schedule.coolTemp ||
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
    // But exclude 'enabled' changes since pause/unpause should be immediate
    if (schedule.saved && originalSchedule && !("enabled" in updates)) {
      const newSchedule = { ...schedule, ...updates };
      const willHaveChanges =
        originalSchedule.mode !== newSchedule.mode ||
        originalSchedule.temperature !== newSchedule.temperature ||
        originalSchedule.heatTemp !== newSchedule.heatTemp ||
        originalSchedule.coolTemp !== newSchedule.coolTemp ||
        JSON.stringify(originalSchedule.days) !==
          JSON.stringify(newSchedule.days) ||
        JSON.stringify(originalSchedule.time) !==
          JSON.stringify(newSchedule.time) ||
        originalSchedule.fanMode !== newSchedule.fanMode;

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
        <div className="fixed bottom-14 left-0 right-0 z-50 flex justify-center px-4">
          <div
            className="flex items-center gap-2 px-4 bg-[#E8FCE8] rounded-lg h-16 shadow-sm"
            style={{
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              width: "352px",
            }}
          >
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
        <div
          className={`flex flex-col gap-2 ${isAwayModeActive ? "opacity-70" : ""}`}
        >
          <div className="flex items-center gap-2 h-6">
            <div className="flex items-center gap-2 h-6">
              {status.badge && (
                <ScheduleBadge
                  mode={status.badge}
                  isAwayModeActive={isAwayModeActive}
                />
              )}
              <span
                className={`text-sm font-semibold uppercase tracking-wide leading-6 ${
                  isAwayModeActive ? "text-[#95A0AC]" : ""
                }`}
                style={{
                  color:
                    !isAwayModeActive &&
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
          <div
            className={`flex items-center gap-1 text-sm leading-5 h-5 ${
              isAwayModeActive ? "text-[#95A0AC]" : "text-foreground"
            }`}
          >
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

        <div className="flex flex-col items-center gap-2">
          <div
            className={isAwayModeActive ? "opacity-60 pointer-events-none" : ""}
          >
            <div className="flex items-center">
              <button
                onClick={() => handleUpdate({ enabled: !schedule.enabled })}
                className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${schedule.enabled ? "bg-[#1D2025]" : "bg-[#BCC5CF]"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${schedule.enabled ? "translate-x-4" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>
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
                  } else if (mode === "auto") {
                    // Set default heat and cool temperatures for auto mode
                    if (!schedule.heatTemp) updates.heatTemp = 68;
                    if (!schedule.coolTemp) updates.coolTemp = 75;
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
                <div className="flex gap-3">
                  {schedule.mode === "auto" ? (
                    <>
                      {/* Heat Control */}
                      <div
                        className="flex-1 h-10 px-3 flex items-center justify-between rounded-lg"
                        style={{ backgroundColor: "#EDEFF2" }}
                      >
                        <button
                          onClick={() => {
                            const currentHeat = schedule.heatTemp || 68;
                            const newTemp = Math.max(50, currentHeat - 1);
                            handleUpdate({ heatTemp: newTemp });
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
                              fill={schedule.enabled ? "#E96549" : "#9B9FA6"}
                            />
                          </svg>
                        </button>
                        <span
                          className="text-base font-semibold"
                          style={{
                            color: schedule.enabled ? "#A23110" : "#9B9FA6",
                          }}
                        >
                          {schedule.heatTemp || 68}°
                        </span>
                        <button
                          onClick={() => {
                            const currentHeat = schedule.heatTemp || 68;
                            const newTemp = Math.min(85, currentHeat + 1);
                            handleUpdate({ heatTemp: newTemp });
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
                              fill={schedule.enabled ? "#E96549" : "#9B9FA6"}
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Cool Control */}
                      <div
                        className="flex-1 h-10 px-3 flex items-center justify-between rounded-lg"
                        style={{ backgroundColor: "#EDEFF2" }}
                      >
                        <button
                          onClick={() => {
                            const currentCool = schedule.coolTemp || 75;
                            const newTemp = Math.max(65, currentCool - 1);
                            handleUpdate({ coolTemp: newTemp });
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
                              fill={schedule.enabled ? "#1772D6" : "#9B9FA6"}
                            />
                          </svg>
                        </button>
                        <span
                          className="text-base font-semibold"
                          style={{
                            color: schedule.enabled ? "#1772D6" : "#9B9FA6",
                          }}
                        >
                          {schedule.coolTemp || 75}°F
                        </span>
                        <button
                          onClick={() => {
                            const currentCool = schedule.coolTemp || 75;
                            const newTemp = Math.min(90, currentCool + 1);
                            handleUpdate({ coolTemp: newTemp });
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
                              fill={schedule.enabled ? "#1772D6" : "#9B9FA6"}
                            />
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Single mode control for heat or cool
                    <div
                      className="flex-1 h-10 px-3 flex items-center justify-between rounded-lg"
                      style={{ backgroundColor: "#EDEFF2" }}
                    >
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
                              schedule.enabled
                                ? schedule.mode === "cool"
                                  ? "#1772D6"
                                  : "#E96549"
                                : "#9B9FA6"
                            }
                          />
                        </svg>
                      </button>
                      <span
                        className="text-base font-semibold"
                        style={{
                          color: schedule.enabled
                            ? schedule.mode === "cool"
                              ? "#1772D6"
                              : "#A23110"
                            : "#9B9FA6",
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
                              schedule.enabled
                                ? schedule.mode === "cool"
                                  ? "#1772D6"
                                  : "#E96549"
                                : "#9B9FA6"
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
                      : "text-foreground"
                  }`}
                  style={{
                    backgroundColor:
                      schedule.fanMode === "auto" ? undefined : "#EDEFF2",
                  }}
                  onClick={() => handleUpdate({ fanMode: "auto" })}
                >
                  <FanAutoIcon />
                  Auto
                </button>
                <button
                  className={`flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-colors ${
                    schedule.fanMode === "on"
                      ? "bg-foreground text-primary-foreground"
                      : "text-foreground"
                  }`}
                  style={{
                    backgroundColor:
                      schedule.fanMode === "on" ? undefined : "#EDEFF2",
                  }}
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
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-5 h-5" />
              Delete Schedule
            </button>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm h-[800px] z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[10px]"
            onClick={() => setShowDeleteDialog(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl p-6 w-full max-w-[327px] shadow-lg">
            <div className="flex flex-col items-center gap-5">
              {/* Title */}
              <h3 className="text-xl font-normal text-[#2D3238] text-center leading-7">
                Delete Schedule
              </h3>

              {/* Message */}
              <p className="text-base font-normal text-[#2D3238] text-center leading-6">
                Are you sure you want to delete this schedule?
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-5 w-full">
                {/* Delete Button */}
                <button
                  onClick={() => {
                    onDelete();
                    setShowDeleteDialog(false);
                  }}
                  className="w-full bg-[#1D2025] text-white font-semibold text-base px-6 py-4 rounded-lg shadow-sm hover:bg-[#1D2025]/90 transition-colors"
                >
                  Delete
                </button>

                {/* Cancel Button */}
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full text-[#1D2025] font-semibold text-base px-6 py-4 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
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
      viewBox="0 0 17 16"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M11.8114 2.09055C11.9955 1.99466 12.2133 2.03527 12.3529 2.17483L13.7069 3.52885C14.0012 3.82309 14.055 4.22502 13.9579 4.56413C13.8617 4.90038 13.6095 5.20972 13.2417 5.34374C12.8549 5.48469 12.5018 5.66513 12.284 5.88019C11.9579 6.2022 11.79 6.74289 11.716 7.09004C11.6421 7.43691 11.1921 7.61374 10.9114 7.33295L9.36337 5.78496L9.3596 5.65245C9.3596 5.65245 9.3596 5.65245 9.6928 5.64299L9.3596 5.65245L9.35958 5.65166L9.35955 5.65042L9.35946 5.64669L9.35925 5.63424C9.3591 5.62378 9.35898 5.60905 9.35902 5.59045C9.3591 5.55328 9.35985 5.50054 9.3624 5.43547C9.36751 5.30567 9.37991 5.12505 9.40926 4.92014C9.46658 4.51993 9.594 3.98569 9.8922 3.5647C10.1535 3.19588 10.568 2.86563 10.9322 2.61667C11.303 2.36317 11.653 2.17306 11.8114 2.09055Z"
        fill="currentColor"
      />
      <path
        d="M8.74998 9.33336C9.48636 9.33336 10.0833 8.73641 10.0833 8.00003C10.0833 7.26365 9.48636 6.6667 8.74998 6.6667C8.0136 6.6667 7.41665 7.26365 7.41665 8.00003C7.41665 8.73641 8.0136 9.33336 8.74998 9.33336ZM8.74998 8.6667C8.38179 8.6667 8.08332 8.36822 8.08332 8.00003C8.08332 7.63184 8.38179 7.33336 8.74998 7.33336C9.11817 7.33336 9.41665 7.63184 9.41665 8.00003C9.41665 8.36822 9.11817 8.6667 8.74998 8.6667Z"
        fill="currentColor"
      />
      <path
        d="M4.90708 13.5851C5.05282 13.7309 5.28287 13.7683 5.47022 13.6581C5.64407 13.5559 6.04805 13.3116 6.46878 13.0089C6.88011 12.713 7.34443 12.3356 7.60778 11.9638C7.91628 11.5283 7.98087 11.0363 7.97622 10.6747C7.97385 10.4915 7.95368 10.3339 7.93397 10.2214C7.92408 10.1649 7.9142 10.1191 7.9065 10.0864C7.90264 10.0701 7.89932 10.057 7.8968 10.0473L7.89364 10.0356L7.89258 10.0317L7.89218 10.0303L7.89188 10.0293L7.86811 9.94648L6.4374 8.51577C6.26754 8.34591 6.04245 8.36154 5.90266 8.42007C5.76353 8.47832 5.61054 8.61658 5.58699 8.83004C5.55935 9.08054 5.4686 9.39891 5.21596 9.64835C4.935 9.92576 4.39221 10.1885 3.85241 10.3938C3.169 10.6537 2.89426 11.5723 3.44943 12.1275L4.90708 13.5851Z"
        fill="currentColor"
      />
      <path
        d="M14.3437 11.8344L13.0815 13.0965C12.5368 13.6413 11.6396 13.3873 11.3559 12.7338C11.1558 12.273 10.904 11.8073 10.6341 11.534C10.3162 11.212 9.89463 11.0479 9.62598 10.9724C9.30107 10.8812 9.13296 10.4454 9.40952 10.1689L10.7035 8.87491L10.7969 8.85349C10.7969 8.85349 10.7969 8.85349 10.8714 9.17839L10.7969 8.85349L10.7978 8.85328L10.7991 8.85298L10.8031 8.8521L10.816 8.84932C10.8268 8.84705 10.8419 8.84397 10.8609 8.84036C10.8988 8.83314 10.9525 8.82374 11.0186 8.81428C11.1504 8.79542 11.3342 8.77595 11.5433 8.77368C11.9491 8.76927 12.507 8.82859 12.9496 9.14215C13.3352 9.41525 13.673 9.89563 13.9213 10.312C14.1763 10.7394 14.3649 11.148 14.4408 11.3194C14.5207 11.4999 14.4753 11.7028 14.3437 11.8344Z"
        fill="currentColor"
      />
      <path
        d="M3.15627 4.16562C3.02465 4.29724 2.97928 4.50011 3.05919 4.6806C3.1351 4.85204 3.32373 5.26061 3.57872 5.68801C3.82708 6.10431 4.16489 6.58466 4.55042 6.85774C4.9931 7.17131 5.55097 7.23062 5.95671 7.22621C6.16583 7.22394 6.34969 7.20447 6.48146 7.18562C6.54759 7.17615 6.60125 7.16675 6.63918 7.15953C6.65815 7.15592 6.67324 7.15285 6.68403 7.15057L6.69695 7.14779L6.70091 7.14691L6.70225 7.14661L6.70315 7.1464L6.79658 7.12498L8.09053 5.83102C8.3671 5.55446 8.19898 5.11874 7.87407 5.02745C7.60542 4.95197 7.18384 4.78793 6.86591 4.46592C6.596 4.19255 6.34416 3.72681 6.1441 3.2661C5.86033 2.6126 4.96322 2.35867 4.41847 2.90342L3.15627 4.16562Z"
        fill="currentColor"
      />
    </svg>
  );
}
