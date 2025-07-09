import { useState } from "react";
import { X, Home } from "lucide-react";
import { ScheduleCard } from "../components/ScheduleCard";
import { AwayModeBar } from "../components/AwayModeBar";

export default function Index() {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      mode: null,
      temperature: null,
      days: [],
      time: { hour: "", minute: "", period: "AM" },
      enabled: false,
      fanMode: "auto",
    },
    {
      id: 2,
      mode: "cool",
      temperature: 73,
      days: ["mon", "wed", "fri"],
      time: { hour: "08", minute: "00", period: "AM" },
      enabled: true,
      fanMode: "auto",
    },
  ]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-t-[10px] shadow-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-center h-11 px-4 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button className="p-0 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Schedules</h1>
            <div className="w-6 h-6"></div>
          </div>
        </div>

        {/* Away Mode Bar */}
        <AwayModeBar />

        {/* Schedules Section */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-4 font-rubik">
            SCHEDULES
          </h2>

          <div className="space-y-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onUpdate={(updates) => updateSchedule(schedule.id, updates)}
                onDelete={() => deleteSchedule(schedule.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
