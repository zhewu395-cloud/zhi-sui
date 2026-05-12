import { useEffect, useRef, useState } from "react";
import { put, uid, type Activity, type TimeEntry, getAll } from "@/lib/db";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function TimerPage({
  activity,
  onDone,
}: {
  activity: Activity | null;
  onDone: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [recent, setRecent] = useState<TimeEntry[]>([]);
  const ref = useRef<number | null>(null);

  const load = async () => {
    const rows = await getAll<TimeEntry>("entries");
    setRecent(rows.sort((a, b) => b.startAt - a.startAt).slice(0, 5));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => setNow(Date.now()), 1000) as unknown as number;
      return () => { if (ref.current) clearInterval(ref.current); };
    }
  }, [running]);

  const begin = () => {
    setStart(Date.now());
    setNow(Date.now());
    setRunning(true);
  };
  const stop = async () => {
    if (!start) return;
    const endAt = Date.now();
    const e: TimeEntry = {
      id: uid(),
      activityId: activity?.id ?? "unknown",
      activityName: activity?.name ?? "未指定",
      startAt: start,
      endAt,
      duration: endAt - start,
    };
    await put("entries", e);
    setRunning(false);
    setStart(null);
    load();
  };

  const elapsed = running && start ? now - start : 0;

  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-sm text-foreground/60">
        {activity ? `正在记录：${activity.name}` : "请先在「事件」选择一项活动"}
      </div>
      <div className="mt-8 grid h-64 w-64 place-items-center rounded-full glass shadow-xl">
        <div className="text-4xl font-light tabular-nums text-foreground/85">
          {fmt(elapsed)}
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        {!running ? (
          <button
            disabled={!activity}
            onClick={begin}
            className="rounded-full bg-primary px-10 py-3 text-primary-foreground shadow-lg disabled:opacity-50 active:scale-95 transition"
          >
            开始
          </button>
        ) : (
          <button
            onClick={stop}
            className="rounded-full bg-destructive px-10 py-3 text-destructive-foreground shadow-lg active:scale-95 transition"
          >
            结束
          </button>
        )}
        <button
          onClick={onDone}
          className="rounded-full glass px-6 py-3 text-foreground/80"
        >
          返回
        </button>
      </div>

      {recent.length > 0 && (
        <div className="mt-10 w-full">
          <h3 className="px-2 pb-2 text-sm text-foreground/60">最近记录</h3>
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="glass rounded-2xl px-4 py-3 flex justify-between text-sm">
                <span>{r.activityName}</span>
                <span className="tabular-nums text-foreground/70">{fmt(r.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
