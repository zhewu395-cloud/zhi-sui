import { Link, useLocation } from "@tanstack/react-router";
import { Sparkles, BarChart3, CheckSquare, BookOpen } from "lucide-react";
import bg from "@/assets/bg-green.jpg";

const tabs = [
  { to: "/", label: "事件", icon: Sparkles },
  { to: "/summary", label: "总结", icon: BarChart3 },
  { to: "/todos", label: "待办", icon: CheckSquare },
  { to: "/reviews", label: "复盘", icon: BookOpen },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div
      className="relative min-h-screen w-full bg-[#eaf3df]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(186,217,150,0.55) 0%, rgba(214,232,193,0.45) 50%, rgba(232,243,222,0.55) 100%), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <main className="mx-auto max-w-md px-5 pb-28 pt-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/40 bg-white/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {tabs.map((t) => {
            const active =
              t.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs transition ${
                  active ? "text-[#3d6b2a]" : "text-foreground/60"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
