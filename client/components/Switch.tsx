interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      className="relative w-10 h-6 rounded-full border border-switch-border bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
      onClick={() => onCheckedChange(!checked)}
    >
      {/* Background when active */}
      {checked && (
        <div className="absolute inset-0 rounded-full bg-switch-active" />
      )}

      {/* Handle */}
      <div
        className={`absolute top-0.5 w-5 h-5 bg-switch-handle rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
        style={{
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.25)",
        }}
      />
    </button>
  );
}
