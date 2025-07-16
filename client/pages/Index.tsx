import { useState } from "react";
import { X, Home, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { ScheduleCard } from "../components/ScheduleCard";
import { AwayModeBar } from "../components/AwayModeBar";
import { ScheduleBadge } from "../components/ScheduleBadge";
import { ModeSelector } from "../components/ModeSelector";
import { WeekdayPicker } from "../components/WeekdayPicker";
import { TimeInput } from "../components/TimeInput";

interface PresetSchedule {
  id: string;
  name: string;
  days: string[];
  time: { hour: string; minute: string; period: string };
  mode: string;
  temperature?: number;
  heatTemp?: number;
  coolTemp?: number;
  backgroundColor: string;
  textColor: string;
}

const PRESET_SCHEDULES: PresetSchedule[] = [
  {
    id: "preset-1",
    name: "New Schedule",
    days: ["mon", "tue", "wed", "thu", "fri"],
    time: { hour: "8", minute: "00", period: "AM" },
    mode: "auto",
    heatTemp: 68,
    coolTemp: 75,
    backgroundColor: "#F3E9F6",
    textColor: "#9D4BB5",
  },
  {
    id: "preset-2",
    name: "Summer Energy Saver, Heat",
    days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    time: { hour: "6", minute: "00", period: "PM" },
    mode: "heat",
    temperature: 68,
    backgroundColor: "rgba(249, 217, 210, 0.75)",
    textColor: "#A23110",
  },
  {
    id: "preset-3",
    name: "Summer Energy Saver, Cool",
    days: ["sat", "sun"],
    time: { hour: "8", minute: "00", period: "AM" },
    mode: "cool",
    temperature: 73,
    backgroundColor: "rgba(226, 238, 252, 0.75)",
    textColor: "#1772D6",
  },
  {
    id: "preset-4",
    name: "Night",
    days: ["mon", "wed", "fri"],
    time: { hour: "11", minute: "00", period: "PM" },
    mode: "off",
    backgroundColor: "rgba(237, 239, 242, 0.75)",
    textColor: "#1D2025",
  },
];

export default function Index() {
  const [isAwayMode, setIsAwayMode] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSmartScheduleExpanded, setIsSmartScheduleExpanded] = useState(false);
  const [expandedSmartSchedules, setExpandedSmartSchedules] = useState(
    new Set(),
  );

  const updateSchedule = (id: number, updates: any) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, ...updates } : schedule,
      ),
    );
  };

  const deleteSchedule = (id: number) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
  };

  const createNewSchedule = () => {
    const newId = Math.max(...schedules.map((s) => s.id), 0) + 1;
    const newSchedule = {
      id: newId,
      mode: null,
      temperature: null,
      days: [],
      time: { hour: "", minute: "", period: "AM" },
      enabled: true,
      fanMode: null,
    };
    setSchedules((prev) => [newSchedule, ...prev]);
  };

  const createPresetSchedule = (preset: PresetSchedule) => {
    const newId = Math.max(...schedules.map((s) => s.id), 0) + 1;
    const newSchedule = {
      id: newId,
      mode: preset.mode,
      temperature: preset.temperature || null,
      heatTemp: preset.heatTemp || null,
      coolTemp: preset.coolTemp || null,
      days: preset.days,
      time: preset.time,
      enabled: true,
      fanMode: "auto",
      saved: true,
      isSmartSchedule: true,
      smartScheduleName: preset.name,
    };
    setSchedules((prev) => [newSchedule, ...prev]);
  };

  const formatDaysDisplay = (days: string[]) => {
    if (days.length === 0) return "No days selected";
    if (days.length === 7) return "Everyday";

    const weekdays = ["mon", "tue", "wed", "thu", "fri"];
    const weekends = ["sat", "sun"];

    const hasAllWeekdays = weekdays.every((day) => days.includes(day));
    const hasAllWeekends = weekends.every((day) => days.includes(day));

    if (hasAllWeekdays && days.length === 5) {
      return "Weekdays";
    }

    if (hasAllWeekends && days.length === 2) {
      return "Weekends";
    }

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

  const formatScheduleTitle = (preset: PresetSchedule) => {
    if (preset.mode === "auto") {
      return `AUTO ${preset.heatTemp}-${preset.coolTemp}°`;
    }
    if (preset.mode === "cool") {
      return `${preset.temperature}°`;
    }
    if (preset.mode === "heat") {
      return `${preset.temperature}°`;
    }
    if (preset.mode === "off") {
      return "OFF";
    }
    return "";
  };

  return (
    <div className="h-[800px] bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm h-full">
        <div className="w-full h-full bg-white rounded-t-[10px] shadow-lg overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-center h-11 px-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <button className="p-0 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                Schedules
              </h1>
              <div className="w-6 h-6"></div>
            </div>
          </div>

          {/* Schedules Section */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Away Mode Bar */}
            <AwayModeBar isAwayMode={isAwayMode} onToggle={setIsAwayMode} />

            {/* My Schedules Section */}
            {schedules.filter((s) => !s.isSmartSchedule).length > 0 && (
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2.5 font-rubik">
                MY SCHEDULES
              </h2>
            )}

            {schedules.filter((s) => !s.isSmartSchedule).length > 0 && (
              <div className="space-y-4 mb-6">
                {schedules
                  .filter((s) => !s.isSmartSchedule)
                  .map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      isAwayModeActive={isAwayMode}
                      onUpdate={(updates) =>
                        updateSchedule(schedule.id, updates)
                      }
                      onDelete={() => deleteSchedule(schedule.id)}
                    />
                  ))}
              </div>
            )}

            {/* SMRT Schedules Section */}
            {schedules.filter((s) => s.isSmartSchedule).length > 0 && (
              <>
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2.5 font-rubik">
                  SMRT SCHEDULES
                </h2>
                <div className="space-y-4 mb-6">
                  {schedules
                    .filter((s) => s.isSmartSchedule)
                    .map((schedule) => {
                      const isCollapsed = !expandedSmartSchedules.has(
                        schedule.id,
                      );
                      return (
                        <div
                          key={schedule.id}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative"
                        >
                          {/* Summary Section */}
                          <div className="flex items-start justify-between">
                            <div
                              className={`flex flex-col gap-2 ${isAwayMode ? "opacity-70" : ""}`}
                            >
                              {/* Schedule Name on its own line with increased spacing (16px) */}
                              <div className="flex items-center gap-2 h-6 mb-2">
                                {/* SMRT Schedule Icon */}
                                <div className="w-6 h-6 flex items-center justify-center">
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M6.44238 3H5.44238V0H6.44238V3Z"
                                      fill="#1D2025"
                                    />
                                    <path
                                      d="M1.44238 3C1.44238 2.72386 1.66624 2.5 1.94238 2.5H4.44238V1.5H1.94238C1.11396 1.5 0.442383 2.17157 0.442383 3V18.5C0.442383 19.3284 1.11395 20 1.94238 20H18.9424C19.7708 20 20.4424 19.3284 20.4424 18.5V3C20.4424 2.17157 19.7708 1.5 18.9424 1.5H16.4424V2.5H18.9424C19.2185 2.5 19.4424 2.72386 19.4424 3V5H1.44238V3ZM1.44238 6H19.4424V18.5C19.4424 18.7761 19.2185 19 18.9424 19H1.94238C1.66624 19 1.44238 18.7761 1.44238 18.5V6Z"
                                      fill="#1D2025"
                                    />
                                    <path
                                      d="M7.44238 2.5H13.4424V1.5H7.44238V2.5Z"
                                      fill="#1D2025"
                                    />
                                    <path
                                      d="M14.4424 3H15.4424V0H14.4424V3Z"
                                      fill="#1D2025"
                                    />
                                    <path
                                      d="M7.44395 14.8408C5.20541 12.2596 6.64148 8.13417 10.0992 7.57649L15.9526 6.63239C16.053 6.61618 16.1399 6.70305 16.1237 6.80351L15.1796 12.6569C14.6219 16.1146 10.4965 17.5507 7.91536 15.3122L7.1999 16.0276C7.06973 16.1578 6.85867 16.1578 6.7285 16.0276C6.59832 15.8974 6.59832 15.6864 6.7285 15.5562L7.44395 14.8408ZM8.38826 14.8393C10.5833 16.6941 14.0504 15.4713 14.5214 12.5508L15.3515 7.40462L10.2053 8.23465C7.28481 8.70569 6.06197 12.1728 7.91685 14.3678L8.51648 13.7682L8.51648 11.0779C8.51648 10.8938 8.66572 10.7445 8.84982 10.7445C9.03391 10.7445 9.18315 10.8938 9.18315 11.0779V13.1015L12.3854 9.89935C12.5155 9.76917 12.7266 9.76917 12.8568 9.89935C12.9869 10.0295 12.9869 10.2406 12.8568 10.3708L9.65456 13.573H11.6782C11.8623 13.573 12.0116 13.7222 12.0116 13.9063C12.0116 14.0904 11.8623 14.2396 11.6782 14.2396H8.98789L8.38826 14.8393Z"
                                      fill="#1D2025"
                                      stroke="#1D2025"
                                      strokeWidth="0.35"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                  {schedule.smartScheduleName}
                                </span>
                              </div>

                              {/* Mode and temperature info */}
                              <div className="flex items-center gap-3 h-6">
                                <div className="flex items-center gap-2 h-6">
                                  {schedule.mode && (
                                    <ScheduleBadge
                                      mode={schedule.mode}
                                      isAwayModeActive={isAwayMode}
                                    />
                                  )}
                                  <span
                                    className="text-sm font-semibold uppercase tracking-wide leading-6"
                                    style={{
                                      color:
                                        schedule.mode === "auto"
                                          ? "#9D4BB5"
                                          : schedule.mode === "cool"
                                            ? "#1772D6"
                                            : schedule.mode === "heat"
                                              ? "#A23110"
                                              : "#1D2025",
                                    }}
                                  >
                                    {schedule.mode === "auto"
                                      ? `AUTO ${schedule.heatTemp}-${schedule.coolTemp}°`
                                      : schedule.mode === "cool"
                                        ? `${schedule.temperature}°`
                                        : schedule.mode === "heat"
                                          ? `${schedule.temperature}°`
                                          : "OFF"}
                                  </span>
                                </div>
                              </div>
                              {/* Days and time info */}
                              <div
                                className={`flex items-center gap-1 text-sm leading-5 h-5 ${isAwayMode ? "text-[#95A0AC]" : "text-foreground"}`}
                              >
                                <span>{formatDaysDisplay(schedule.days)}</span>
                                <span className="font-semibold">•</span>
                                <span>
                                  {schedule.time.hour}:{schedule.time.minute}{" "}
                                  {schedule.time.period}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div
                                className={
                                  isAwayMode
                                    ? "opacity-60 pointer-events-none"
                                    : ""
                                }
                              >
                                <div className="flex items-center">
                                  <button
                                    onClick={() =>
                                      updateSchedule(schedule.id, {
                                        enabled: !schedule.enabled,
                                      })
                                    }
                                    className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${schedule.enabled ? "bg-[#1D2025]" : "bg-[#BCC5CF]"}`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${schedule.enabled ? "translate-x-4" : "translate-x-0"}`}
                                    />
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(
                                    expandedSmartSchedules,
                                  );
                                  if (isCollapsed) {
                                    newExpanded.add(schedule.id);
                                  } else {
                                    newExpanded.delete(schedule.id);
                                  }
                                  setExpandedSmartSchedules(newExpanded);
                                }}
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

                          {/* Expanded Controls Section - Disabled State */}
                          {!isCollapsed && (
                            <>
                              <div className="mt-4 space-y-4 opacity-50 pointer-events-none">
                                {/* Mode Selection - Disabled */}
                                <div className="space-y-2.5">
                                  <label className="text-sm font-semibold text-gray-400">
                                    Mode
                                  </label>
                                  <div className="flex gap-1">
                                    <button
                                      className={`flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold cursor-not-allowed ${schedule.mode === "cool" ? "bg-[#E2EEFC] text-[#1772D6]" : "bg-secondary text-gray-400"}`}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          d="M14.7575 11.3471L11.2367 9.32124L13.0883 8.50686C13.2787 8.42177 13.4043 8.23134 13.4043 8.02471C13.4043 7.81807 13.2827 7.62765 13.0883 7.54256L11.2245 6.72007L14.7494 4.67804C14.9804 4.54433 15.0614 4.24451 14.9277 4.01357C14.794 3.78262 14.4942 3.70159 14.2632 3.83529L10.7464 5.87328L10.9652 3.86365C10.9854 3.65702 10.8842 3.45444 10.7059 3.34909C10.5276 3.24375 10.3007 3.25591 10.1305 3.38151L8.48557 4.58485L8.47747 0.512932C8.47747 0.245523 8.25868 0.0267334 7.99127 0.0267334C7.72386 0.0267334 7.50507 0.245523 7.50507 0.512932L7.51318 4.57675L5.88036 3.38151C5.71019 3.25996 5.48735 3.2478 5.30502 3.34909C5.1227 3.45038 5.02141 3.65297 5.04572 3.86365L5.26451 5.88948L1.73146 3.8596C1.49646 3.7259 1.20069 3.80693 1.06699 4.03788C0.933283 4.27287 1.01432 4.56864 1.24526 4.70235L4.76615 6.72818L2.91454 7.54661C2.72412 7.6317 2.59851 7.82213 2.59851 8.02876C2.59851 8.23945 2.72006 8.42582 2.91454 8.51091L4.77831 9.33339L1.25336 11.3754C1.02242 11.5091 0.941386 11.809 1.07509 12.0399C1.16423 12.1939 1.32629 12.283 1.49646 12.283C1.5775 12.283 1.66258 12.2627 1.73956 12.2182L5.2564 10.1802L5.03761 12.1898C5.01735 12.3964 5.11865 12.599 5.29692 12.7044C5.47519 12.8097 5.70209 12.7976 5.87225 12.672L7.51723 11.4686L7.52533 15.5405C7.52533 15.8079 7.74412 16.0267 8.01153 16.0267C8.27894 16.0267 8.49773 15.8079 8.49773 15.5405L8.49368 11.4767L10.1265 12.672C10.2197 12.7408 10.3291 12.7733 10.4385 12.7733C10.5276 12.7733 10.6208 12.7489 10.7018 12.7044C10.8842 12.599 10.9854 12.4005 10.9611 12.1898L10.7423 10.164L14.2754 12.1939C14.3524 12.2384 14.4334 12.2587 14.5185 12.2587C14.6887 12.2587 14.8507 12.1696 14.9399 12.0156C15.0695 11.7806 14.9885 11.4848 14.7575 11.3471Z"
                                          fill="currentColor"
                                        />
                                      </svg>
                                      Cool
                                    </button>
                                    <button
                                      className={`flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold cursor-not-allowed ${schedule.mode === "heat" ? "bg-[#F9D9D2] text-[#A23110]" : "bg-secondary text-gray-400"}`}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          d="M13.384 9.74259C13.384 10.2286 13.3603 10.6989 13.2259 11.1652C13.2101 11.1691 13.0678 11.3232 13.0678 11.3232C12.7873 11.446 12.4553 11.3548 12.2775 11.1652C12.1432 11.0229 11.9693 10.7898 11.9614 10.691V9.58453L11.3291 10.3748C9.78406 12.1017 9.0056 12.5166 8.80011 12.5877C8.77245 12.4494 8.72701 12.0185 8.90878 11.2005L9.11624 10.5329L8.32592 10.691C8.04141 10.774 7.53953 10.7974 6.90727 10.5761C6.04583 10.2758 5.56969 9.6396 5.43138 9.35904L4.91767 8.52526L4.69046 9.42647C4.65884 9.56477 4.3743 10.2482 3.78947 10.5169C3.70253 10.5564 3.4931 10.6512 3.22439 10.6236C2.97939 10.5998 2.78971 10.4852 2.66326 10.3786C2.61584 9.82138 2.65536 9.18122 2.8806 8.52526C3.16907 7.68357 3.63931 7.20542 4.14116 6.70357C4.69438 6.1464 5.15675 5.57761 5.48078 4.52649C5.6744 3.89028 5.70997 3.02093 5.63884 2.3136C6.6544 3.29359 7.11674 4.23012 7.06141 4.68455C7.01795 5.0402 6.79666 5.32076 6.58722 5.63294C6.2948 6.07156 5.99843 6.47463 6.11303 7.21357C6.25924 8.16196 6.93496 8.97203 8.0098 9.2684C8.91076 9.51735 9.8868 9.33953 10.5388 8.79421C11.1197 8.31212 11.4556 7.62849 11.4872 6.73938C11.4991 6.38769 11.3291 5.63294 11.4872 5.63294C11.6453 5.63294 12.5936 6.73938 12.9098 7.5297C13.1745 8.20542 13.384 9.05106 13.384 9.74259Z"
                                          fill="currentColor"
                                        />
                                      </svg>
                                      Heat
                                    </button>
                                    <button
                                      className={`flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold cursor-not-allowed ${schedule.mode === "auto" ? "bg-[#F3E9F6] text-[#9D4BB5]" : "bg-secondary text-gray-400"}`}
                                    >
                                      A Auto
                                    </button>
                                    <button
                                      className={`flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold cursor-not-allowed ${schedule.mode === "off" ? "bg-[#CCD1D8] text-[#676F79]" : "bg-secondary text-gray-400"}`}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          d="M9.35012 6.18804L7.5 8L7.22654 6.78932H6L7 1.5H10L9.35012 6.18804Z"
                                          fill="currentColor"
                                        />
                                        <path
                                          d="M13.8833 2.40663C14.0411 2.24884 14.0378 1.9937 13.88 1.83592C13.7222 1.67814 13.467 1.68149 13.3093 1.83928L10.0059 5.16953L10.4725 1H6.60512L5.71549 7.39529H6.78976L6.85691 8.35206L2.11667 13.1259C1.95889 13.2836 1.96225 13.5388 2.12003 13.6966C2.19724 13.7738 2.30131 13.8141 2.40538 13.8141C2.50945 13.8141 2.61352 13.7738 2.69074 13.6966L6.93076 9.41962L7.29669 14.6903L10.9861 6.58622H9.84809L9.86152 6.4553L13.8833 2.40663Z"
                                          fill="currentColor"
                                        />
                                      </svg>
                                      Off
                                    </button>
                                  </div>
                                </div>

                                {/* Temperature Controls - Disabled */}
                                {schedule.mode && schedule.mode !== "off" && (
                                  <div className="space-y-2.5">
                                    <div className="flex gap-3">
                                      <div className="flex-1 h-10 px-3 flex items-center justify-between bg-secondary rounded-lg">
                                        <button className="p-0 cursor-not-allowed opacity-50">
                                          <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                          >
                                            <path
                                              d="M1.66675 7.25241C1.66631 7.40053 1.72303 7.54272 1.82434 7.64748L9.63785 15.6708C9.848 15.8876 10.1883 15.8876 10.3984 15.6708L18.1708 7.62169C18.3098 7.48171 18.3651 7.27529 18.3156 7.08137C18.2662 6.88745 18.1196 6.73604 17.9319 6.68505C17.7443 6.63406 17.5446 6.69138 17.4093 6.83508L10.0157 14.4897L2.5844 6.85785C2.43017 6.69958 2.19899 6.65269 1.99833 6.73897C1.79766 6.82525 1.66687 7.02778 1.66675 7.25241Z"
                                              fill="#E5E7EB"
                                            />
                                          </svg>
                                        </button>
                                        <span className="text-base font-semibold text-gray-400">
                                          {schedule.mode === "auto"
                                            ? `${schedule.heatTemp || 68}° - ${schedule.coolTemp || 75}°`
                                            : `${schedule.temperature || 73}°`}
                                        </span>
                                        <button className="p-0 cursor-not-allowed opacity-50">
                                          <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                          >
                                            <path
                                              d="M1.66675 14.4143C1.66631 14.2661 1.72303 14.1239 1.82434 14.0192L9.63785 5.99582C9.848 5.77906 10.1883 5.77906 10.3984 5.99582L18.1708 14.045C18.3097 14.185 18.3651 14.3914 18.3156 14.5853C18.2662 14.7792 18.1196 14.9306 17.9319 14.9816C17.7443 15.0326 17.5446 14.9753 17.4093 14.8316L10.0157 7.17699L2.5844 14.8088C2.93017 14.9671 2.69899 15.014 2.49833 14.9277C2.29766 14.8414 2.16687 14.6389 2.16675 14.4143Z"
                                              fill="#E5E7EB"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Fan Mode - Disabled */}
                                <div className="space-y-2.5">
                                  <label className="text-sm font-semibold text-gray-400">
                                    Fan Mode
                                  </label>
                                  <div className="flex gap-1">
                                    <button className="flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold bg-secondary text-gray-400 cursor-not-allowed">
                                      Auto
                                    </button>
                                    <button className="flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold bg-secondary text-gray-400 cursor-not-allowed">
                                      On
                                    </button>
                                  </div>
                                </div>

                                {/* Schedule Details - Disabled */}
                                <div className="space-y-6 pt-2">
                                  <div className="space-y-2.5">
                                    <label className="text-sm font-semibold text-gray-400">
                                      Schedule
                                    </label>
                                    <div className="space-y-4">
                                      {/* Days - Disabled */}
                                      <div className="flex gap-1">
                                        {[
                                          "S",
                                          "M",
                                          "T",
                                          "W",
                                          "T",
                                          "F",
                                          "S",
                                        ].map((day, index) => {
                                          const dayKey = [
                                            "sun",
                                            "mon",
                                            "tue",
                                            "wed",
                                            "thu",
                                            "fri",
                                            "sat",
                                          ][index];
                                          const isSelected =
                                            schedule.days.includes(dayKey);
                                          return (
                                            <button
                                              key={index}
                                              className={`flex-1 h-10 flex items-center justify-center rounded-lg text-sm font-semibold cursor-not-allowed ${
                                                isSelected
                                                  ? "bg-gray-300 text-gray-500"
                                                  : "bg-gray-100 text-gray-400"
                                              }`}
                                            >
                                              {day}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      {/* Time - Disabled */}
                                      <div className="flex gap-2">
                                        <div className="flex-1 h-10 px-3 flex items-center bg-secondary rounded-lg">
                                          <input
                                            type="text"
                                            value={schedule.time.hour || ""}
                                            className="bg-transparent border-none outline-none text-center w-full text-gray-400 cursor-not-allowed"
                                            disabled
                                          />
                                        </div>
                                        <span className="flex items-center text-gray-400">
                                          :
                                        </span>
                                        <div className="flex-1 h-10 px-3 flex items-center bg-secondary rounded-lg">
                                          <input
                                            type="text"
                                            value={schedule.time.minute || ""}
                                            className="bg-transparent border-none outline-none text-center w-full text-gray-400 cursor-not-allowed"
                                            disabled
                                          />
                                        </div>
                                        <div className="flex gap-1">
                                          <button
                                            className={`px-3 h-10 rounded-lg text-sm font-semibold cursor-not-allowed ${
                                              schedule.time.period === "AM"
                                                ? "bg-gray-300 text-gray-500"
                                                : "bg-gray-100 text-gray-400"
                                            }`}
                                          >
                                            AM
                                          </button>
                                          <button
                                            className={`px-3 h-10 rounded-lg text-sm font-semibold cursor-not-allowed ${
                                              schedule.time.period === "PM"
                                                ? "bg-gray-300 text-gray-500"
                                                : "bg-gray-100 text-gray-400"
                                            }`}
                                          >
                                            PM
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Delete Button - Only Available Action */}
                              <div className="pt-4 flex justify-center">
                                <button
                                  className="flex items-center gap-3 px-6 py-1 text-destructive font-semibold rounded-2xl hover:bg-red-50 transition-colors"
                                  onClick={() => deleteSchedule(schedule.id)}
                                >
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5"
                                  >
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                                    <line
                                      x1="10"
                                      y1="11"
                                      x2="10"
                                      y2="17"
                                    ></line>
                                    <line
                                      x1="14"
                                      y1="11"
                                      x2="14"
                                      y2="17"
                                    ></line>
                                  </svg>
                                  Delete Schedule
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              </>
            )}

            {schedules.length === 0 ? (
              <div className="flex flex-col items-center gap-10 py-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fac2618f3fd3f41d5b7751e606dc09be1%2F708f518822fc47f582102ed662428101?format=webp&width=800"
                  alt="No schedules illustration"
                  className="w-[186px] h-[379px]"
                />
                <div className="flex flex-col items-center gap-2 text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    No Schedules set up yet
                  </h3>
                  <p className="text-sm text-foreground">
                    Schedules allow you to automate a device on certain times
                    and days
                  </p>
                </div>
              </div>
            ) : (
              <div className="pb-20" />
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="absolute bottom-4 right-4 w-14 h-14 bg-[#32BDCD] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{
            filter: "drop-shadow(0px 4px 8px rgba(45, 50, 57, 0.20))",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="text-black"
          >
            <path
              d="M25.6667 14C25.6667 14.3796 25.3588 14.6875 24.9792 14.6875H14.6875V24.9792C14.6875 25.3588 14.3796 25.6667 14 25.6667C13.6204 25.6667 13.3125 25.3588 13.3125 24.9792V14.6875H3.02083C2.64124 14.6875 2.33334 14.3796 2.33334 14C2.33334 13.6204 2.64124 13.3126 3.02083 13.3126H13.3125V3.02086C13.3125 2.64127 13.6204 2.33337 14 2.33337C14.3796 2.33337 14.6875 2.64127 14.6875 3.02086V13.3126H24.9792C25.3588 13.3126 25.6667 13.6204 25.6667 14Z"
              fill="black"
            />
          </svg>
        </button>

        {/* Create Schedule Modal */}
        {showCreateModal && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end items-center p-4 pb-10 bg-white/75 backdrop-blur-[12.5px]">
            <div className="flex flex-col items-center gap-10 w-full">
              {/* Content */}
              <div className="flex flex-col gap-2 w-full">
                {/* Header */}
                <div className="mb-2">
                  <h2 className="text-xl font-semibold text-[#1D2025] font-rubik">
                    Create New
                  </h2>
                </div>

                {/* Schedule Options */}
                <div className="flex flex-col gap-2 w-full">
                  {/* Custom Schedule */}
                  <button
                    onClick={() => {
                      createNewSchedule();
                      setShowCreateModal(false);
                    }}
                    className="flex items-center gap-4 p-4 pl-4 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <div className="flex-shrink-0">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#1D2025]"
                      >
                        <path
                          d="M7.99988 5H6.99988V2H7.99988V5Z"
                          fill="currentColor"
                        />
                        <path
                          d="M5.49988 10C5.22374 10 4.99988 10.2239 4.99988 10.5V13.5C4.99988 13.7761 5.22374 14 5.49988 14H8.49988C8.77602 14 8.99988 13.7761 8.99988 13.5V10.5C8.99988 10.2239 8.77602 10 8.49988 10H5.49988ZM5.99988 11H7.99988V13H5.99988V11Z"
                          fill="currentColor"
                        />
                        <path
                          d="M4.99988 15.5C4.99988 15.2239 5.22374 15 5.49988 15H8.49988C8.77602 15 8.99988 15.2239 8.99988 15.5V18.5C8.99988 18.7761 8.77602 19 8.49988 19H5.49988C5.22374 19 4.99988 18.7761 4.99988 18.5V15.5ZM5.99988 18H7.99988V16H5.99988V18Z"
                          fill="currentColor"
                        />
                        <path
                          d="M10.4999 10C10.2237 10 9.99988 10.2239 9.99988 10.5V13.5C9.99988 13.7761 10.2237 14 10.4999 14H13.4999C13.776 14 13.9999 13.7761 13.9999 13.5V10.5C13.9999 10.2239 13.776 10 13.4999 10H10.4999ZM10.9999 11H12.9999V13H10.9999V11Z"
                          fill="currentColor"
                        />
                        <path
                          d="M9.99988 15.5C9.99988 15.2239 10.2237 15 10.4999 15H13.4999C13.776 15 13.9999 15.2239 13.9999 15.5V18.5C13.9999 18.7761 13.776 19 13.4999 19H10.4999C10.2237 19 9.99988 18.7761 9.99988 18.5V15.5ZM10.9999 18H12.9999V16H10.9999V18Z"
                          fill="currentColor"
                        />
                        <path
                          d="M15.4999 10C15.2237 10 14.9999 10.2239 14.9999 10.5V13.5C14.9999 13.7761 15.2237 14 15.4999 14H18.4999C18.776 14 18.9999 13.7761 18.9999 13.5V10.5C18.9999 10.2239 18.776 10 18.4999 10H15.4999ZM15.9999 11H17.9999V13H15.9999V11Z"
                          fill="currentColor"
                        />
                        <path
                          d="M14.9999 15.5C14.9999 15.2239 15.2237 15 15.4999 15H18.4999C18.776 15 18.9999 15.2239 18.9999 15.5V18.5C18.9999 18.7761 18.776 19 18.4999 19H15.4999C15.2237 19 14.9999 18.7761 14.9999 18.5V15.5ZM15.9999 18H17.9999V16H15.9999V18Z"
                          fill="currentColor"
                        />
                        <path
                          d="M2.99988 5C2.99988 4.72386 3.22374 4.5 3.49988 4.5H5.99988V3.5H3.49988C2.67145 3.5 1.99988 4.17157 1.99988 5V20.5C1.99988 21.3284 2.67145 22 3.49988 22H20.4999C21.3283 22 21.9999 21.3284 21.9999 20.5V5C21.9999 4.17157 21.3283 3.5 20.4999 3.5H17.9999V4.5H20.4999C20.776 4.5 20.9999 4.72386 20.9999 5V7H2.99988V5ZM2.99988 8H20.9999V20.5C20.9999 20.7761 20.776 21 20.4999 21H3.49988C3.22374 21 2.99988 20.7761 2.99988 20.5V8Z"
                          fill="currentColor"
                        />
                        <path
                          d="M8.99988 4.5H14.9999V3.5H8.99988V4.5Z"
                          fill="currentColor"
                        />
                        <path
                          d="M15.9999 5H16.9999V2H15.9999V5Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#1D2025] leading-5">
                        Custom Schedule
                      </h3>
                      <p className="text-sm text-[#1D2025] leading-5">
                        Create your own schedule that's personalized to you and
                        your home
                      </p>
                    </div>
                  </button>

                  {/* SMRT Schedule */}
                  <button
                    onClick={() =>
                      setIsSmartScheduleExpanded(!isSmartScheduleExpanded)
                    }
                    className="flex items-center gap-4 p-4 pl-4 w-full hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6.44238 3H5.44238V0H6.44238V3Z"
                          fill="#1D2025"
                        />
                        <path
                          d="M1.44238 3C1.44238 2.72386 1.66624 2.5 1.94238 2.5H4.44238V1.5H1.94238C1.11396 1.5 0.442383 2.17157 0.442383 3V18.5C0.442383 19.3284 1.11395 20 1.94238 20H18.9424C19.7708 20 20.4424 19.3284 20.4424 18.5V3C20.4424 2.17157 19.7708 1.5 18.9424 1.5H16.4424V2.5H18.9424C19.2185 2.5 19.4424 2.72386 19.4424 3V5H1.44238V3ZM1.44238 6H19.4424V18.5C19.4424 18.7761 19.2185 19 18.9424 19H1.94238C1.66624 19 1.44238 18.7761 1.44238 18.5V6Z"
                          fill="#1D2025"
                        />
                        <path
                          d="M7.44238 2.5H13.4424V1.5H7.44238V2.5Z"
                          fill="#1D2025"
                        />
                        <path
                          d="M14.4424 3H15.4424V0H14.4424V3Z"
                          fill="#1D2025"
                        />
                        <path
                          d="M7.44395 14.8408C5.20541 12.2596 6.64148 8.13417 10.0992 7.57649L15.9526 6.63239C16.053 6.61618 16.1399 6.70305 16.1237 6.80351L15.1796 12.6569C14.6219 16.1146 10.4965 17.5507 7.91536 15.3122L7.1999 16.0276C7.06973 16.1578 6.85867 16.1578 6.7285 16.0276C6.59832 15.8974 6.59832 15.6864 6.7285 15.5562L7.44395 14.8408ZM8.38826 14.8393C10.5833 16.6941 14.0504 15.4713 14.5214 12.5508L15.3515 7.40462L10.2053 8.23465C7.28481 8.70569 6.06197 12.1728 7.91685 14.3678L8.51648 13.7682L8.51648 11.0779C8.51648 10.8938 8.66572 10.7445 8.84982 10.7445C9.03391 10.7445 9.18315 10.8938 9.18315 11.0779V13.1015L12.3854 9.89935C12.5155 9.76917 12.7266 9.76917 12.8568 9.89935C12.9869 10.0295 12.9869 10.2406 12.8568 10.3708L9.65456 13.573H11.6782C11.8623 13.573 12.0116 13.7222 12.0116 13.9063C12.0116 14.0904 11.8623 14.2396 11.6782 14.2396H8.98789L8.38826 14.8393Z"
                          fill="#1D2025"
                          stroke="#1D2025"
                          strokeWidth="0.35"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0 text-left">
                      <h3 className="text-base font-semibold text-[#1D2025] leading-5">
                        Smart Schedule
                      </h3>
                      <p className="text-sm text-[#1D2025] leading-5">
                        Select an energy-saving preset recommended by your
                        community
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        className="text-[#6A6E79]"
                      >
                        <path
                          d="M9.44086 16.5C7.43761 16.5 5.5531 15.7206 4.13743 14.3019C2.72176 12.8832 1.94238 11.0048 1.94238 9.00152C1.94238 6.99827 2.72176 5.11376 4.14047 3.69809C5.55919 2.28242 7.43761 1.5 9.44086 1.5C11.4441 1.5 13.3286 2.27938 14.7443 3.69809C16.16 5.11681 16.9424 6.99827 16.9424 9.00152C16.9424 11.0048 16.16 12.8862 14.7443 14.3019C13.3286 15.7176 11.4441 16.5 9.44086 16.5ZM9.44086 2.23067C7.63246 2.23067 5.93366 2.93394 4.65499 4.2126C3.37632 5.49127 2.67305 7.19008 2.67305 8.99848C2.67305 10.8069 3.37632 12.5057 4.65499 13.7844C5.93366 15.063 7.63246 15.7663 9.44086 15.7663C11.2493 15.7663 12.9481 15.0661 14.2267 13.7874C15.5054 12.5087 16.2087 10.8099 16.2087 9.00152C16.2087 7.19312 15.5054 5.49432 14.2267 4.21565C12.9481 2.93698 11.2493 2.23067 9.44086 2.23067Z"
                          fill="#6A6E79"
                        />
                        <path
                          d="M9.43784 13.6169C9.11817 13.6169 8.85939 13.3581 8.85939 13.0384L8.86852 7.6315C8.86852 7.31183 9.1273 7.05305 9.44697 7.05305C9.76664 7.05305 10.0254 7.31183 10.0254 7.6315L10.0163 13.0384C10.0163 13.3581 9.7575 13.6169 9.43784 13.6169Z"
                          fill="#6A6E79"
                        />
                        <path
                          d="M9.44695 5.46996C9.76642 5.46996 10.0254 5.21099 10.0254 4.89152C10.0254 4.57205 9.76642 4.31307 9.44695 4.31307C9.12749 4.31307 8.86851 4.57205 8.86851 4.89152C8.86851 5.21099 9.12749 5.46996 9.44695 5.46996Z"
                          fill="#6A6E79"
                        />
                      </svg>
                      {isSmartScheduleExpanded ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="w-6 h-6 text-[#1D2025]"
                        >
                          <path
                            d="M18.6889 15.5554C18.5147 15.7058 18.2516 15.6866 18.1012 15.5124L10.4998 6.71089L2.89852 15.5124C2.74811 15.6866 2.48499 15.7058 2.31083 15.5554C2.13668 15.405 2.11743 15.1419 2.26783 14.9677L10.0268 5.98364C10.2761 5.69499 10.7236 5.69499 10.9729 5.98364L18.7319 14.9677C18.8823 15.1419 18.863 15.405 18.6889 15.5554Z"
                            fill="currentColor"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="w-6 h-6 text-[#1D2025]"
                        >
                          <path
                            d="M2.17308 6.1216C2.38207 5.9411 2.69781 5.96421 2.8783 6.1732L11.9999 16.735L21.1215 6.1732C21.302 5.96421 21.6177 5.9411 21.8267 6.1216C22.0357 6.30209 22.0588 6.61783 21.8783 6.82682L12.5675 17.6077C12.2684 17.9541 11.7314 17.9541 11.4323 17.6077L2.12147 6.82682C1.94098 6.61783 1.96409 6.30209 2.17308 6.1216Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Expanded SMRT Schedule Section */}
                  {isSmartScheduleExpanded && (
                    <div className="px-4 pb-4">
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-[#1D2025] uppercase tracking-wide font-rubik">
                          COMMUNITY RECOMMENDATIONS
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {PRESET_SCHEDULES.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              createPresetSchedule(preset);
                              setShowCreateModal(false);
                            }}
                            className="w-full p-2 rounded-xl border border-transparent hover:border-gray-200 transition-colors"
                            style={{ backgroundColor: preset.backgroundColor }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col items-start gap-1">
                                <h5 className="text-sm font-semibold text-[#1D2025] leading-5">
                                  {preset.name}
                                </h5>
                                <div className="flex items-center gap-1 text-xs text-[#676F79]">
                                  <span>{formatDaysDisplay(preset.days)}</span>
                                  <span className="font-semibold">•</span>
                                  <span>
                                    {preset.time.hour}:{preset.time.minute}{" "}
                                    {preset.time.period}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: preset.textColor }}
                                >
                                  {formatScheduleTitle(preset)}
                                </span>
                                {preset.mode !== "off" && (
                                  <ScheduleBadge mode={preset.mode} />
                                )}
                                {preset.mode === "off" && (
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: "#CCD1D8" }}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          opacity="0.4"
                                          d="M9.35012 6.18804L7.5 8L7.22654 6.78932H6L7 1.5H10L9.35012 6.18804Z"
                                          fill="#676F79"
                                        />
                                        <path
                                          opacity="0.4"
                                          d="M10.5 7L7.38623 13L7.38622 8.62351L9.47461 7L9.46806 7.01972L10.5 7Z"
                                          fill="#676F79"
                                        />
                                        <path
                                          d="M13.8833 2.40663C14.0411 2.24884 14.0378 1.9937 13.88 1.83592C13.7222 1.67814 13.467 1.68149 13.3093 1.83928L10.0059 5.16953L10.4725 1H6.60512L5.71549 7.39529H6.78976L6.85691 8.35206L2.11667 13.1259C1.95889 13.2836 1.96225 13.5388 2.12003 13.6966C2.19724 13.7738 2.30131 13.8141 2.40538 13.8141C2.50945 13.8141 2.61352 13.7738 2.69074 13.6966L6.93076 9.41962L7.29669 14.6903L10.9861 6.58622H9.84809L9.86152 6.4553L13.8833 2.40663Z"
                                          fill="#40464E"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-1 border border-[#1D2025] rounded-xl text-base font-semibold text-[#1D2025] hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
