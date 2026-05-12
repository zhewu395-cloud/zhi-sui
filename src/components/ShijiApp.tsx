import { useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import bg from "@/assets/bg-willow.png";
import { EventsPage } from "./shiji/EventsPage";
import { TimerPage } from "./shiji/TimerPage";
import { TodosPage } from "./shiji/TodosPage";
import { ReviewPage } from "./shiji/ReviewPage";
import { SettingsSheet } from "./shiji/SettingsSheet";
import { Settings } from "lucide-react";
import type { Activity } from "@/lib/db";

type Tab = "events" | "timer" | "todos" | "review";

export function ShijiApp() {
  const [tab, setTab] = useState<Tab>("events");
  const [timing, setTiming] = useState<Activity | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Disable any potential network sync — purely defensive
  useEffect(() => {
    // No-op: App is strictly local-first using IndexedDB
  }, []);

  const startTiming = (a: Activity) => {
    setTiming(a);
    setTab("timer");
  };

  return (
    <div
      className="relative mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white/40 pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-5 pt-12 pb-3">
        <h1 className="text-3xl font-semibold tracking-wider text-foreground/90 drop-shadow-sm">
          时迹
        </h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full glass text-foreground/80 active:scale-95 transition"
          aria-label="设置"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-28">
        {tab === "events" && <EventsPage onStart={startTiming} />}
        {tab === "timer" && (
          <TimerPage activity={timing} onDone={() => setTab("events")} />
        )}
        {tab === "todos" && <TodosPage />}
        {tab === "review" && <ReviewPage />}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 z-20 glass border-t border-white/40 px-2 pt-2 pb-6">
        <div className="grid grid-cols-4 gap-1">
          {([
            ["events", "事件"],
            ["timer", "计时"],
            ["todos", "待办"],
            ["review", "复盘"],
          ] as [Tab, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-xl py-2 text-sm transition ${
                tab === k
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground/70 hover:bg-white/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export default function ShijiAppClient() {
  return (
    <ClientOnly fallback={<div className="h-[100dvh]" />}>
      <ShijiApp />
    </ClientOnly>
  );
}
