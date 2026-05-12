import { cn } from "@/lib/utils";

export function Bubble({
  children,
  onClick,
  variant = "leaf",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "leaf" | "ghost";
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-20 w-full items-center justify-center rounded-[50%] px-4 text-base font-medium text-foreground/80 shadow-[0_4px_14px_rgba(120,160,90,0.18)] transition active:scale-[0.97]",
        variant === "leaf"
          ? "border border-[#a8c98a]/60 bg-[#bcd99a]/55 backdrop-blur-sm hover:bg-[#bcd99a]/70"
          : "border border-white/70 bg-white/80 backdrop-blur-sm hover:bg-white",
        className,
      )}
    >
      {children}
    </button>
  );
}
