interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      className={`relative w-10 h-6 rounded-full border transition-colors ${
        checked
          ? "border-[#B7C0CD] bg-[#1D2025]"
          : "border-[#BCC5CF] bg-[#BCC5CF]"
      }`}
      onClick={() => onCheckedChange(!checked)}
    >
      {/* Handle */}
      <div
        className={`absolute top-0.5 w-5 h-5 bg-[#FBFCFD] rounded-full transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
        style={{
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.25)",
        }}
      />
    </button>
  );
}
