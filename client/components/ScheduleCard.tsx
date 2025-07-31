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

interface ScheduleConflict {
  days: string[];
  time: { hour: string; minute: string; period: string };
}

interface ScheduleCardProps {
  schedule: Schedule;
  isAwayModeActive?: boolean;
  conflict?: ScheduleConflict | null;
  onUpdate: (updates: Partial<Schedule>) => void;
  onDelete: () => void;
}

export function ScheduleCard({
  schedule,
  isAwayModeActive = false,
  conflict,
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
      schedule.time.period &&
      schedule.fanMode &&
      schedule.fanMode !== null
    );
  };

  // Check if there are conflicts that prevent saving
  const hasConflicts = () => {
    return conflict !== null && conflict !== undefined;
  };

  // Format conflict message
  const getConflictMessage = () => {
    if (!conflict) return "";

    const dayNames = {
      sun: "Sunday",
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday"
    };

    // Convert all conflicting days to full names
    const conflictingDayNames = conflict.days.map(day => dayNames[day as keyof typeof dayNames]);

    // Format the day list with proper grammar
    let dayText = "";
    if (conflictingDayNames.length === 1) {
      dayText = conflictingDayNames[0];
    } else if (conflictingDayNames.length === 2) {
      dayText = `${conflictingDayNames[0]} and ${conflictingDayNames[1]}`;
    } else {
      const lastDay = conflictingDayNames.pop();
      dayText = `${conflictingDayNames.join(", ")} and ${lastDay}`;
    }

    const timeStr = `${conflict.time.hour}:${conflict.time.minute} ${conflict.time.period}`;
    const eventText = conflictingDayNames.length === 1 ? "has an event" : "have an event";

    return `${dayText} ${eventText} scheduled at ${timeStr}. Please select a different time to continue.`;
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
      originalSchedule.fanMode !== schedule.fanMode
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
        <div className="fixed bottom-[4.5rem] left-0 right-0 z-50 flex justify-center px-4">
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
            className={isAwayModeActive || !isScheduleComplete() ? "opacity-60 pointer-events-none" : ""}
          >
            <div className="flex items-center">
              <button
                onClick={() => handleUpdate({ enabled: !schedule.enabled })}
                disabled={!isScheduleComplete()}
                className={`relative inline-flex h-6 w-10 shrink-0 ${!isScheduleComplete() ? "cursor-not-allowed" : "cursor-pointer"} rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${schedule.enabled ? "bg-[#1D2025]" : "bg-[#BCC5CF]"}`}
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

            {/* Conflict Warning Banner */}
            {!isCollapsed && hasConflicts() && (
              <div className="flex items-center gap-2 p-2 bg-[#FAE5C6] rounded-xl">
                <div className="flex items-center p-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 5.15789C12.2907 5.15789 12.5263 5.39353 12.5263 5.68421V15.1579C12.5263 15.4486 12.2907 15.6842 12 15.6842C11.7093 15.6842 11.4737 15.4486 11.4737 15.1579V5.68421C11.4737 5.39353 11.7093 5.15789 12 5.15789ZM12.5263 18.3158C12.5263 18.6065 12.2907 18.8421 12 18.8421C11.7093 18.8421 11.4737 18.6065 11.4737 18.3158C11.4737 18.0251 11.7093 17.7895 12 17.7895C12.2907 17.7895 12.5263 18.0251 12.5263 18.3158Z"
                      fill="#663500"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#2E3237] leading-5">
                    {getConflictMessage()}
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4">
              <button
                className={`w-full h-10 px-6 font-semibold rounded-lg transition-colors ${
                  !schedule.enabled || hasConflicts()
                    ? "bg-[#CCD1D8] text-[#95A0AC] cursor-not-allowed"
                    : (isScheduleComplete() && !schedule.saved) ||
                        (schedule.saved && hasUnsavedChanges())
                      ? "bg-[#1D2025] text-white hover:bg-gray-800"
                      : "bg-button-disabled-bg text-button-disabled-text cursor-not-allowed"
                }`}
                disabled={
                  !schedule.enabled ||
                  !isScheduleComplete() ||
                  hasConflicts() ||
                  (schedule.saved && !hasUnsavedChanges())
                }
                onClick={
                  schedule.enabled &&
                  !hasConflicts() &&
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
      viewBox="0 0 16 16"
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

function FanOnIcon() {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M11.6353 2.09055C11.8194 1.99466 12.0373 2.03527 12.1768 2.17483L13.5308 3.52885C13.8251 3.82309 13.8789 4.22502 13.7818 4.56413C13.6856 4.90038 13.4334 5.20972 13.0656 5.34374C12.6788 5.48469 12.3258 5.66513 12.1079 5.88019C11.7818 6.2022 11.6139 6.74289 11.54 7.09004C11.466 7.43691 11.0161 7.61374 10.7353 7.33295L9.18728 5.78496L9.18352 5.65245C9.18352 5.65245 9.18352 5.65245 9.51672 5.64299L9.18352 5.65245L9.18349 5.65166L9.18346 5.65042L9.18338 5.64669L9.18316 5.63424C9.18302 5.62378 9.1829 5.60905 9.18294 5.59045C9.18302 5.55328 9.18376 5.50054 9.18632 5.43547C9.19142 5.30567 9.20382 5.12505 9.23317 4.92014C9.29049 4.51993 9.41792 3.98569 9.71612 3.5647C9.97737 3.19588 10.3919 2.86563 10.7561 2.61667C11.1269 2.36317 11.4769 2.17306 11.6353 2.09055ZM9.85098 5.50584L10.9703 6.6252C11.0812 6.24848 11.2822 5.75859 11.6395 5.40579C11.9607 5.08875 12.4226 4.86848 12.8373 4.71736C12.9839 4.66394 13.0971 4.53384 13.1409 4.38073C13.1839 4.2305 13.1523 4.09315 13.0594 4.00026L11.8115 2.75228C11.6426 2.84465 11.3922 2.9894 11.1323 3.16702C10.7849 3.40453 10.4509 3.68068 10.2601 3.95005C10.0536 4.24164 9.9453 4.65021 9.89311 5.01466C9.8677 5.19207 9.85689 5.34925 9.85247 5.46166C9.85185 5.47731 9.85136 5.49206 9.85098 5.50584Z"
        fill="currentColor"
      />
      <path
        d="M8.5739 9.33336C9.31028 9.33336 9.90723 8.73641 9.90723 8.00003C9.90723 7.26365 9.31028 6.6667 8.5739 6.6667C7.83752 6.6667 7.24056 7.26365 7.24056 8.00003C7.24056 8.73641 7.83752 9.33336 8.5739 9.33336ZM8.5739 8.6667C8.20571 8.6667 7.90723 8.36822 7.90723 8.00003C7.90723 7.63184 8.20571 7.33336 8.5739 7.33336C8.94209 7.33336 9.24056 7.63184 9.24056 8.00003C9.24056 8.36822 8.94209 8.6667 8.5739 8.6667Z"
        fill="currentColor"
      />
      <path
        d="M4.73099 13.5851C4.87674 13.7309 5.10678 13.7683 5.29413 13.6581C5.46798 13.5559 5.87196 13.3116 6.29269 13.0089C6.70402 12.713 7.16834 12.3356 7.4317 11.9638C7.74019 11.5283 7.80479 11.0363 7.80013 10.6747C7.79777 10.4915 7.77759 10.3339 7.75789 10.2214C7.74799 10.1649 7.73811 10.1191 7.73041 10.0864C7.72655 10.0701 7.72323 10.057 7.72071 10.0473L7.71756 10.0356L7.71649 10.0317L7.71609 10.0303L7.71579 10.0293L7.69202 9.94648L6.26131 8.51577C6.09145 8.34591 5.86636 8.36154 5.72657 8.42007C5.58744 8.47832 5.43445 8.61658 5.4109 8.83004C5.38326 9.08054 5.29252 9.39891 5.03987 9.64835C4.75891 9.92576 4.21612 10.1885 3.67633 10.3938C2.99291 10.6537 2.71817 11.5723 3.27334 12.1275L4.73099 13.5851ZM7.3954 10.1213L7.71579 10.0293C7.71579 10.0293 7.71579 10.0293 7.3954 10.1213ZM6.01745 9.21472L7.09246 10.2897C7.09525 10.3036 7.09821 10.3192 7.10121 10.3363C7.11618 10.4218 7.13171 10.5431 7.13352 10.6833C7.13719 10.9685 7.08393 11.3014 6.88768 11.5785C6.69374 11.8523 6.31027 12.175 5.90339 12.4677C5.59152 12.6921 5.28756 12.8836 5.09134 13.0027L3.74475 11.6561C3.56921 11.4805 3.63087 11.1243 3.91333 11.0169C4.45397 10.8113 5.11782 10.5083 5.50827 10.1227C5.79749 9.83718 5.9442 9.50415 6.01745 9.21472Z"
        fill="currentColor"
      />
      <path
        d="M14.1676 11.8344L12.9055 13.0965C12.3607 13.6413 11.4635 13.3873 11.1798 12.7338C10.9798 12.273 10.728 11.8073 10.4581 11.534C10.1401 11.212 9.71855 11.0479 9.44989 10.9724C9.12498 10.8812 8.95687 10.4454 9.23343 10.1689L10.5274 8.87491L10.6208 8.85349C10.6208 8.85349 10.6208 8.85349 10.6953 9.17839L10.6208 8.85349L10.6217 8.85328L10.6231 8.85298L10.627 8.8521L10.6399 8.84932C10.6507 8.84705 10.6658 8.84397 10.6848 8.84036C10.7227 8.83314 10.7764 8.82374 10.8425 8.81428C10.9743 8.79542 11.1581 8.77595 11.3673 8.77368C11.773 8.76927 12.3309 8.82859 12.7735 9.14215C13.1591 9.41525 13.4969 9.89563 13.7452 10.312C14.0002 10.7394 14.1888 11.148 14.2647 11.3194C14.3446 11.4999 14.2992 11.7028 14.1676 11.8344ZM10.8587 9.48643L9.91918 10.4259C10.226 10.5425 10.6105 10.7395 10.9325 11.0656C11.2943 11.4321 11.586 11.9954 11.7913 12.4683C11.9111 12.7442 12.2623 12.7969 12.4341 12.6251L13.5973 11.4619C13.5081 11.2696 13.359 10.9658 13.1727 10.6535C12.9304 10.2473 12.6519 9.87293 12.3882 9.68616C12.1183 9.49498 11.7334 9.43641 11.3745 9.44031C11.2013 9.44219 11.0474 9.45842 10.9369 9.47422C10.9074 9.47845 10.8811 9.48262 10.8587 9.48643Z"
        fill="currentColor"
      />
      <path
        d="M2.98019 4.16562C2.84856 4.29724 2.8032 4.50011 2.88311 4.6806C2.95901 4.85204 3.14765 5.26061 3.40263 5.68801C3.651 6.10431 3.9888 6.58466 4.37433 6.85774C4.81701 7.17131 5.37488 7.23062 5.78062 7.22621C5.98974 7.22394 6.1736 7.20447 6.30537 7.18562C6.3715 7.17615 6.42517 7.16675 6.46309 7.15953C6.48207 7.15592 6.49715 7.15284 6.50794 7.15057L6.52086 7.14779L6.52482 7.14691L6.52616 7.14661L6.52707 7.1464L6.62049 7.12498L7.91445 5.83102C8.19101 5.55446 8.02289 5.11874 7.69799 5.02745C7.42933 4.95197 7.00775 4.78793 6.68982 4.46592C6.41991 4.19255 6.16807 3.72681 5.96802 3.2661C5.68424 2.6126 4.78713 2.35867 4.24238 2.90342L2.98019 4.16562ZM6.45256 6.8215L6.52707 7.1464C6.52707 7.1464 6.52707 7.1464 6.45256 6.8215ZM7.22869 5.57396L6.2892 6.51346C6.26673 6.51727 6.24048 6.52144 6.21093 6.52567C6.1005 6.54148 5.94658 6.55771 5.77338 6.55959C5.4145 6.56348 5.02959 6.50491 4.75968 6.31373C4.496 6.12695 4.21744 5.75256 3.97515 5.34644C3.78886 5.03418 3.63966 4.73035 3.5505 4.53811L4.71379 3.37483C4.88554 3.20308 5.23669 3.25569 5.35651 3.53164C5.56186 4.00452 5.85357 4.56781 6.21543 4.93432C6.53733 5.26034 6.92183 5.45738 7.22869 5.57396Z"
        fill="currentColor"
      />
    </svg>
  );
}
