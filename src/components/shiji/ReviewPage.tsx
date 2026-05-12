import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getAll, put, del, uid, type Review } from "@/lib/db";

const TYPES: { key: Review["type"]; label: string }[] = [
  { key: "day", label: "日复盘" },
  { key: "week", label: "周复盘" },
  { key: "month", label: "月复盘" },
];

export function ReviewPage() {
  const [list, setList] = useState<Review[]>([]);
  const [editing, setEditing] = useState<Review | null>(null);

  const load = async () => {
    const rows = await getAll<Review>("reviews");
    setList(rows.sort((a, b) => b.createdAt - a.createdAt));
  };
  useEffect(() => { load(); }, []);

  const create = (type: Review["type"]) => {
    setEditing({
      id: uid(),
      type,
      date: new Date().toISOString().slice(0, 10),
      content: "",
      createdAt: Date.now(),
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.content.trim()) { setEditing(null); return; }
    await put("reviews", editing);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await del("reviews", id);
    load();
  };

  const labelOf = (t: Review["type"]) => TYPES.find((x) => x.key === t)?.label ?? "";

  return (
    <div className="pt-4">
      <p className="px-2 pb-3 text-sm text-foreground/60">我的复盘</p>
      <div className="grid grid-cols-3 gap-3">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => create(t.key)}
            className="glass aspect-square rounded-3xl flex flex-col items-center justify-center text-foreground/80 active:scale-95 transition"
          >
            <Plus className="h-5 w-5 mb-1 text-foreground/60" />
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {list.map((r) => (
          <div key={r.id} className="glass rounded-2xl p-4">
            <div className="flex justify-between text-xs text-foreground/60">
              <span>{labelOf(r.type)} · {r.date}</span>
              <button onClick={() => remove(r.id)} className="text-destructive/80">删除</button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{r.content}</p>
          </div>
        ))}
        {list.length === 0 && (
          <div className="mt-10 text-center text-foreground/50 text-sm">
            还没有复盘记录
          </div>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-black/30 px-6"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-medium">{labelOf(editing.type)}</h3>
            <input
              type="date"
              value={editing.date}
              onChange={(e) => setEditing({ ...editing, date: e.target.value })}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 outline-none mb-3"
            />
            <textarea
              autoFocus
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              placeholder="写下你的思考……"
              rows={6}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-xl px-4 py-2 text-foreground/70">
                取消
              </button>
              <button onClick={save} className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
