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
    onTimeChange({ hour: "", minute: "", period: "AM" });
  };

  const handleHourChange = (newHour: string) => {
    onTimeChange({ ...time, hour: newHour });
  };

  const handleMinuteChange = (newMinute: string) => {
    onTimeChange({ ...time, minute: newMinute });
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
      <div className="border border-border rounded-lg p-4 bg-input">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">
            Time
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Hour Selector */}
              <select
                value={time.hour}
                onChange={(e) => handleHourChange(e.target.value)}
                className="w-7 h-6 bg-secondary rounded-2xl text-xs text-secondary-foreground text-center border-none outline-none appearance-none cursor-pointer"
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
                className="w-7 h-6 bg-secondary rounded-2xl text-xs text-secondary-foreground text-center border-none outline-none appearance-none cursor-pointer"
              >
                <option value="">--</option>
                {minutes.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>

              {/* Period Toggle */}
              <button
                onClick={handlePeriodToggle}
                className="w-7 h-6 bg-secondary rounded-2xl text-xs text-secondary-foreground hover:bg-gray-300 transition-colors"
              >
                {time.hour ? time.period : "--"}
              </button>
            </div>
            {hasTime && (
              <button
                onClick={clearTime}
                className="w-6 h-6 rounded-full bg-muted-foreground text-primary-foreground flex items-center justify-center hover:bg-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
