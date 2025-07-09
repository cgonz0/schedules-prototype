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

  const createNewSchedule = () => {
    const newId = Math.max(...schedules.map((s) => s.id), 0) + 1;
    const newSchedule = {
      id: newId,
      mode: null,
      temperature: null,
      days: [],
      time: { hour: "", minute: "", period: "AM" },
      enabled: false,
      fanMode: "auto",
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm">
        <div className="w-full bg-white rounded-t-[10px] shadow-lg overflow-hidden">
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

        {/* Floating Action Button */}
        <button
          onClick={createNewSchedule}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#32BDCD] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
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
      </div>
    </div>
  );
}
