import { useState } from "react";
import { X, Home } from "lucide-react";
import { ScheduleCard } from "../components/ScheduleCard";
import { AwayModeBar } from "../components/AwayModeBar";

export default function Index() {
  const [isAwayMode, setIsAwayMode] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

            {schedules.length > 0 && (
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2.5 font-rubik">
                SCHEDULES
              </h2>
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
              <div className="space-y-4 pb-20">
                {schedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    isAwayModeActive={isAwayMode}
                    onUpdate={(updates) => updateSchedule(schedule.id, updates)}
                    onDelete={() => deleteSchedule(schedule.id)}
                  />
                ))}
              </div>
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
                  <div className="flex items-center gap-4 p-4 pl-4 w-full">
                    <div className="flex-shrink-0">
                      <div className="relative w-6 h-6">
                        {/* Calendar Icon */}
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="text-[#1D2025]"
                        >
                          <path
                            d="M5.99988 3H4.99988V0H5.99988V3Z"
                            fill="currentColor"
                          />
                          <path
                            d="M0.999878 3C0.999878 2.72386 1.22374 2.5 1.49988 2.5H3.99988V1.5H1.49988C0.671451 1.5 -0.00012207 2.17157 -0.00012207 3V18.5C-0.00012207 19.3284 0.67145 20 1.49988 20H18.4999C19.3283 20 19.9999 19.3284 19.9999 18.5V3C19.9999 2.17157 19.3283 1.5 18.4999 1.5H15.9999V2.5H18.4999C18.776 2.5 18.9999 2.72386 18.9999 3V5H0.999878V3ZM0.999878 6H18.9999V18.5C18.9999 18.7761 18.776 19 18.4999 19H1.49988C1.22374 19 0.999878 18.7761 0.999878 18.5V6Z"
                            fill="currentColor"
                          />
                          <path
                            d="M6.99988 2.5H12.9999V1.5H6.99988V2.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M13.9999 3H14.9999V0H13.9999V3Z"
                            fill="currentColor"
                          />
                        </svg>
                        {/* Leaf Icon positioned inside calendar */}
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 23"
                          fill="none"
                          className="absolute left-2 top-3 text-[#1D2025] transform rotate-45"
                        >
                          <path
                            d="M8.00138 14.8407C5.76284 12.2596 7.19891 8.13414 10.6566 7.57645L16.51 6.63235C16.6105 6.61615 16.6973 6.70302 16.6811 6.80348L15.737 12.6569C15.1793 16.1146 11.0539 17.5506 8.47279 15.3121L7.75734 16.0276C7.62716 16.1578 7.41611 16.1578 7.28593 16.0276C7.15576 15.8974 7.15576 15.6863 7.28593 15.5562L8.00138 14.8407ZM8.94569 14.8392C11.1408 16.6941 14.6078 15.4712 15.0789 12.5507L15.9089 7.40459L10.7627 8.23462C7.84225 8.70566 6.6194 12.1727 8.47429 14.3678L9.07392 13.7682L9.07392 11.0778C9.07392 10.8937 9.22316 10.7445 9.40725 10.7445C9.59135 10.7445 9.74058 10.8937 9.74058 11.0778L9.74059 13.1015L12.9428 9.89932C13.073 9.76914 13.284 9.76914 13.4142 9.89932C13.5444 10.0295 13.5444 10.2405 13.4142 10.3707L10.212 13.5729H12.2357C12.4198 13.5729 12.569 13.7222 12.569 13.9063C12.569 14.0904 12.4198 14.2396 12.2357 14.2396H9.54532L8.94569 14.8392Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#1D2025] leading-5">
                        SMRT Schedule
                      </h3>
                      <p className="text-sm text-[#1D2025] leading-5">
                        Select an energy-saving preset recommended by your
                        community
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#1D2025]"
                      >
                        <path
                          d="M2.17308 6.1216C2.38207 5.9411 2.69781 5.96421 2.8783 6.1732L11.9999 16.735L21.1215 6.1732C21.302 5.96421 21.6177 5.9411 21.8267 6.1216C22.0357 6.30209 22.0588 6.61783 21.8783 6.82682L12.5675 17.6077C12.2684 17.9541 11.7314 17.9541 11.4323 17.6077L2.12147 6.82682C1.94098 6.61783 1.96409 6.30209 2.17308 6.1216Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
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
