import { X } from "lucide-react";

interface TimeInputProps {
  time: { hour: string; minute: string; period: string };
  onTimeChange: (time: {
    hour: string;
    minute: string;
    period: string;
  }) => void;
}

export function TimeInput({ time, onTimeChange }: TimeInputProps) {
  const hasTime = time.hour && time.minute;

  const clearTime = () => {
    onTimeChange({ hour: "", minute: "", period: "" });
  };

  const handleHourChange = (newHour: string) => {
    const updates = { ...time, hour: newHour };
    // Auto-default to AM if period is empty and hour is being set
    if (newHour && !time.period) {
      updates.period = "AM";
    }
    onTimeChange(updates);
  };

  const handleMinuteChange = (newMinute: string) => {
    const updates = { ...time, minute: newMinute };
    // Auto-default to AM if period is empty and minute is being set
    if (newMinute && !time.period) {
      updates.period = "AM";
    }
    onTimeChange(updates);
  };

  const handlePeriodToggle = () => {
    onTimeChange({ ...time, period: time.period === "AM" ? "PM" : "AM" });
  };

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );
  // Generate minute options (00, 15, 30, 45)
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className="relative">
      <div className="border border-border rounded-lg px-3 py-2 bg-input min-h-14">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-muted-foreground">
            Time
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Hour Selector */}
              <select
                value={time.hour}
                onChange={(e) => handleHourChange(e.target.value)}
                className="w-8 h-5 rounded-xl text-xs text-secondary-foreground text-center border-none outline-none appearance-none cursor-pointer flex-shrink-0"
                style={{ backgroundColor: "#EDEFF2" }}
              >
                <option value="">--</option>
                {hours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>

              <span className="text-xs text-muted-foreground">:</span>

              {/* Minute Selector */}
              <select
                value={time.minute}
                onChange={(e) => handleMinuteChange(e.target.value)}
                className="w-8 h-5 rounded-xl text-xs text-secondary-foreground text-center border-none outline-none appearance-none cursor-pointer flex-shrink-0"
                style={{ backgroundColor: "#EDEFF2" }}
              >
                <option value="">--</option>
                {minutes.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>

              {/* Period Selector */}
              <select
                value={time.period}
                onChange={(e) => onTimeChange({ ...time, period: e.target.value })}
                className="w-8 h-5 rounded-xl text-xs text-secondary-foreground text-center border-none outline-none appearance-none cursor-pointer flex-shrink-0"
                style={{ backgroundColor: "#EDEFF2" }}
              >
                <option value="">--</option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            {hasTime && (
              <button
                onClick={clearTime}
                className="w-5 h-5 rounded-full bg-muted-foreground text-primary-foreground flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
