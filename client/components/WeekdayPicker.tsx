interface WeekdayPickerProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
}

export function WeekdayPicker({
  selectedDays,
  onDaysChange,
}: WeekdayPickerProps) {
  const weekdays = [
    { id: "sun", label: "Sun" },
    { id: "mon", label: "Mon" },
    { id: "tue", label: "Tue" },
    { id: "wed", label: "Wed" },
    { id: "thu", label: "Thu" },
    { id: "fri", label: "Fri" },
    { id: "sat", label: "Sat" },
  ];

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      onDaysChange(selectedDays.filter((day) => day !== dayId));
    } else {
      onDaysChange([...selectedDays, dayId]);
    }
  };

  return (
    <div className="flex justify-between gap-1">
      {weekdays.map((day) => {
        const isSelected = selectedDays.includes(day.id);

        return (
          <button
            key={day.id}
            className={`w-10 h-10 rounded-full text-xs font-semibold transition-colors ${
              isSelected
                ? "bg-foreground text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-gray-200"
            }`}
            onClick={() => toggleDay(day.id)}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
