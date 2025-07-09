import { Home } from "lucide-react";

export function AwayModeBar() {
  return (
    <div className="mx-4 mt-4 mb-6">
      <div className="flex items-center justify-center gap-3 h-10 px-4 border border-foreground rounded-lg">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6 text-foreground" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">AWAY</span>
            <span className="text-base font-semibold text-foreground">•</span>
            <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
              OFF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
