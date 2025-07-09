import { ChevronUp, Trash2, X } from "lucide-react";
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
  const formatDays = (days: string[]) => {
    if (days.length === 0) return "No days selected";
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
    if (!schedule.mode) {
      return {
        text: "NO MODE SELECTED",
        badge: null,
        color: "text-foreground",
      };
    }

    if (schedule.mode === "cool" && schedule.temperature) {
      return {
        text: `COOL TO ${schedule.temperature}°`,
        badge: schedule.mode,
        color: "#1772D6",
      };
    }

    if (schedule.mode === "heat" && schedule.temperature) {
      return {
        text: `HEAT TO ${schedule.temperature}°`,
        badge: schedule.mode,
        color: "#A23110",
      };
    }

    if (schedule.mode === "auto") {
      return {
        text: "AUTO 68-75°",
        badge: schedule.mode,
        color: "#9D4BB5",
      };
    }

    if (schedule.mode === "off") {
      return {
        text: "OFF",
        badge: schedule.mode,
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

  const handleSave = () => {
    // Mark the schedule as saved/complete by updating it
    onUpdate({ saved: true });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Summary Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {status.badge && <ScheduleBadge mode={status.badge} />}
              <span
                className="text-sm font-semibold uppercase tracking-wide"
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
          </div>
          <div className="flex items-center gap-1 text-sm text-foreground">
            <span>{formatDays(schedule.days)}</span>
            <span className="font-semibold">•</span>
            <span>{formatTime(schedule.time)}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Switch
            checked={schedule.enabled}
            onCheckedChange={(enabled) => onUpdate({ enabled })}
          />
          <ChevronUp className="w-5 h-5 text-foreground" />
        </div>
      </div>

      {/* Temperature Controls - Show for Auto, Cool, Heat modes */}
      {schedule.mode && schedule.mode !== "off" && (
        <div className="flex gap-3">
          {schedule.mode === "auto" ? (
            <>
              {/* Heat Control */}
              <div className="flex-1 h-10 px-3 flex items-center justify-between bg-secondary rounded-lg">
                <button
                  onClick={() => {
                    const currentHeat = 68;
                    const newTemp = Math.max(50, currentHeat - 1);
                    onUpdate({ temperature: newTemp });
                  }}
                  className="p-0 hover:bg-gray-200 rounded transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
                    onUpdate({ temperature: newTemp });
                  }}
                  className="p-0 hover:bg-gray-200 rounded transition-colors"
                >
                  <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
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
                    onUpdate({ temperature: newTemp });
                  }}
                  className="p-0 hover:bg-gray-200 rounded transition-colors"
                >
                  <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
                    <path
                      d="M2.16675 7.25241C2.16631 7.40053 2.22303 7.54272 2.32434 7.64748L10.1379 15.6708C10.348 15.8876 10.6883 15.8876 10.8984 15.6708L18.6708 7.62169C18.8098 7.48171 18.8651 7.27529 18.8156 7.08137C18.7662 6.88745 18.6196 6.73604 18.4319 6.68505C18.2443 6.63406 18.0446 6.69138 17.9093 6.83508L10.5157 14.4897L3.0844 6.85785C2.93017 6.69958 2.69899 6.65269 2.49833 6.73897C2.29766 6.82525 2.16687 7.02778 2.16675 7.25241Z"
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
                    onUpdate({ temperature: newTemp });
                  }}
                  className="p-0 hover:bg-gray-200 rounded transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
                  onUpdate({ temperature: newTemp });
                }}
                className="p-0 hover:bg-gray-200 rounded transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M1.66675 7.25241C1.66631 7.40053 1.72303 7.54272 1.82434 7.64748L9.63785 15.6708C9.848 15.8876 10.1883 15.8876 10.3984 15.6708L18.1708 7.62169C18.3098 7.48171 18.3651 7.27529 18.3156 7.08137C18.2662 6.88745 18.1196 6.73604 17.9319 6.68505C17.7443 6.63406 17.5446 6.69138 17.4093 6.83508L10.0157 14.4897L2.5844 6.85785C2.43017 6.69958 2.19899 6.65269 1.99833 6.73897C1.79766 6.82525 1.66687 7.02778 1.66675 7.25241Z"
                    fill={schedule.mode === "cool" ? "#1772D6" : "#E96549"}
                  />
                </svg>
              </button>
              <span
                className="text-base font-semibold"
                style={{
                  color: schedule.mode === "cool" ? "#1772D6" : "#A23110",
                }}
              >
                {schedule.temperature || (schedule.mode === "cool" ? 73 : 68)}°
                {schedule.mode === "cool" ? "F" : ""}
              </span>
              <button
                onClick={() => {
                  const currentTemp =
                    schedule.temperature ||
                    (schedule.mode === "cool" ? 73 : 68);
                  const newTemp = Math.min(90, currentTemp + 1);
                  onUpdate({ temperature: newTemp });
                }}
                className="p-0 hover:bg-gray-200 rounded transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M1.66675 14.4143C1.66631 14.2661 1.72303 14.1239 1.82434 14.0192L9.63785 5.99582C9.848 5.77906 10.1883 5.77906 10.3984 5.99582L18.1708 14.045C18.3097 14.185 18.3651 14.3914 18.3156 14.5853C18.2662 14.7792 18.1196 14.9306 17.9319 14.9816C17.7443 15.0326 17.5446 14.9753 17.4093 14.8316L10.0157 7.17699L2.5844 14.8088C2.93017 14.9671 2.69899 15.014 2.49833 14.9277C2.29766 14.8414 2.16687 14.6389 2.16675 14.4143Z"
                    fill={schedule.mode === "cool" ? "#1772D6" : "#E96549"}
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Controls Section */}
      <div className="space-y-4">
        {/* Mode Selection */}
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-muted-foreground">
            Mode
          </label>
          <ModeSelector
            selectedMode={schedule.mode}
            onModeSelect={(mode) => {
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
              onUpdate(updates);
            }}
          />
        </div>

        {/* Fan Mode Selection */}
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-muted-foreground">
            Fan Mode
          </label>
          <div className="flex gap-1">
            <button
              className={`flex-1 h-10 px-2.5 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-colors ${
                schedule.fanMode === "auto"
                  ? "bg-foreground text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
              onClick={() => onUpdate({ fanMode: "auto" })}
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
              onClick={() => onUpdate({ fanMode: "on" })}
            >
              <FanOnIcon />
              On
            </button>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="space-y-6 pt-2">
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-muted-foreground">
              Schedule
            </label>
            <div className="space-y-4">
              <WeekdayPicker
                selectedDays={schedule.days}
                onDaysChange={(days) => onUpdate({ days })}
              />
              <TimeInput
                time={schedule.time}
                onTimeChange={(time) => onUpdate({ time })}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-4">
          <button
            className={`w-full h-10 px-6 font-semibold rounded-lg transition-colors ${
              isScheduleComplete()
                ? "bg-[#32BDCD] text-black hover:bg-[#2BA8B7]"
                : "bg-button-disabled-bg text-button-disabled-text cursor-not-allowed"
            }`}
            disabled={!isScheduleComplete()}
            onClick={isScheduleComplete() ? handleSave : undefined}
          >
            Save Changes
          </button>

          <div className="flex justify-center">
            <button
              className="flex items-center gap-3 px-6 py-1 text-destructive font-semibold rounded-2xl hover:bg-red-50 transition-colors"
              onClick={onDelete}
            >
              <Trash2 className="w-5 h-5" />
              Delete Schedule
            </button>
          </div>
        </div>
      </div>
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
        d="M6.76276 11.5604C6.80473 11.5476 6.85081 11.5637 6.87539 11.6001C7.02688 11.8243 7.19857 12.0347 7.38711 12.2297C7.40497 12.2483 7.41507 12.2735 7.4151 12.2993V12.9471C7.41498 13.1463 7.25291 13.3082 7.05377 13.3084C6.85442 13.3084 6.69257 13.1464 6.69244 12.9471V11.6561C6.69252 11.6122 6.72084 11.5733 6.76276 11.5604Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6814 3.03434C10.8717 2.92602 11.0969 3.02915 11.1768 3.21273C11.502 3.96197 12.091 4.54235 12.7256 5.13981C12.8093 5.21857 12.895 5.29841 12.9815 5.37874C13.9503 6.2779 15.0708 7.31193 15.0408 8.92562C14.9988 11.1633 13.2257 12.9816 10.9828 12.9816C8.74953 12.9816 6.74277 11.1634 6.92487 8.91585C6.97587 8.28725 7.13127 7.81164 7.40208 7.38981C7.67132 6.97056 8.05154 6.6091 8.5401 6.20296C8.7688 6.01319 9.10154 6.18473 9.11627 6.46598C9.15035 7.12716 9.25025 7.60291 9.37604 7.93278C9.50249 8.26419 9.65214 8.43984 9.77773 8.51611C9.89913 8.58972 9.99539 8.57137 10.0557 8.52067C10.1205 8.46601 10.1676 8.35355 10.1417 8.19775C10.0853 7.86016 9.93521 7.47872 9.77057 7.06234C9.51828 6.4243 9.23297 5.70713 9.26862 5.00635C9.3051 4.29147 9.67341 3.60873 10.6814 3.03434Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.11823 8.51221C6.15635 8.53099 6.1787 8.57224 6.17356 8.61442C6.16386 8.69215 6.15604 8.77188 6.14948 8.8527C6.13518 9.02913 6.1306 9.20275 6.13711 9.37288C6.13812 9.40062 6.12807 9.42811 6.10846 9.44775L3.62083 11.936C3.49751 12.0592 3.30711 12.0745 3.16705 11.9823L3.11041 11.936C2.96952 11.795 2.96957 11.5666 3.11041 11.4256L6.00364 8.53174C6.03378 8.50163 6.07992 8.49361 6.11823 8.51221Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.8819 3.81494C3.00537 3.69151 3.19607 3.676 3.33632 3.76872L3.39296 3.81494L6.61692 7.03955C6.64829 7.07118 6.65491 7.11977 6.6332 7.15869C6.54483 7.31644 6.46988 7.47984 6.40599 7.64958C6.39851 7.6694 6.38404 7.68503 6.36692 7.69645C6.37367 7.71687 6.37468 7.7394 6.36757 7.76025C6.31196 7.92352 6.26628 8.09277 6.23086 8.27002C6.22149 8.31661 6.18005 8.3506 6.13255 8.35075H2.09283C1.89368 8.3506 1.73174 8.18855 1.73151 7.98942C1.73151 7.79009 1.89354 7.62824 2.09283 7.62809H6.18398L2.8819 4.32601C2.74092 4.185 2.74092 3.95595 2.8819 3.81494Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.05377 2.66455C7.25289 2.6648 7.41495 2.82674 7.4151 3.02588V6.12353C7.41502 6.14998 7.40452 6.17581 7.3858 6.1945C7.19902 6.38066 7.02558 6.57474 6.87278 6.78499C6.84739 6.81991 6.80254 6.83462 6.76145 6.82145C6.72031 6.80808 6.69252 6.76965 6.69244 6.7264V3.02588C6.69259 2.82658 6.85444 2.66455 7.05377 2.66455Z"
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
