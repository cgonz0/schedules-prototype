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

  return (
    <div className="relative">
      <div className="border border-border rounded-lg p-4 bg-input">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">
            Time
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-7 h-6 bg-secondary rounded-2xl flex items-center justify-center">
                <span className="text-xs text-secondary-foreground">
                  {time.hour || "--"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">:</span>
              <div className="w-7 h-6 bg-secondary rounded-2xl flex items-center justify-center">
                <span className="text-xs text-secondary-foreground">
                  {time.minute || "--"}
                </span>
              </div>
              <div className="w-7 h-6 bg-secondary rounded-2xl flex items-center justify-center">
                <span className="text-xs text-secondary-foreground">
                  {time.hour ? time.period : "--"}
                </span>
              </div>
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
