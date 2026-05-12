import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { getAll, put, del, uid, type Activity } from "@/lib/db";

const DEFAULT: Activity[] = [
  { id: "a-class", name: "上课", createdAt: 0 },
  { id: "a-write", name: "文案", createdAt: 0 },
  { id: "a-walk", name: "走路", createdAt: 0 },
];

export function EventsPage({ onStart }: { onStart: (a: Activity) => void }) {
  const [list, setList] = useState<Activity[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const load = async () => {
    const rows = await getAll<Activity>("activities");
    if (rows.length === 0) {
      for (const a of DEFAULT) await put("activities", a);
      setList(DEFAULT);
    } else {
      setList(rows.sort((a, b) => a.createdAt - b.createdAt));
    }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    const a: Activity = { id: uid(), name: name.trim(), createdAt: Date.now() };
    await put("activities", a);
    setName("");
    setAdding(false);
    load();
  };

  const remove = async (id: string) => {
    await del("activities", id);
    load();
  };

  return (
    <div className="pt-4">
      <p className="px-2 pb-3 text-sm text-foreground/60">选择一项活动开始记录</p>
      <div className="flex flex-wrap gap-3 px-1">
        {list.map((a) => (
          <div key={a.id} className="group relative">
            <button
              onClick={() => onStart(a)}
              className="glass min-w-[88px] rounded-full px-5 py-3 text-foreground/85 font-medium shadow-sm active:scale-95 transition"
            >
              {a.name}
            </button>
            <button
              onClick={() => remove(a.id)}
              className="absolute -right-1 -top-1 hidden h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground text-xs group-hover:grid"
              aria-label="删除"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setAdding(true)}
          className="glass flex items-center gap-1 rounded-full px-5 py-3 text-foreground/70 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" /> 添加
        </button>
      </div>

      {adding && (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-black/30 px-6"
          onClick={() => setAdding(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-medium">新增活动</h3>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="活动名称"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setAdding(false)}
                className="rounded-xl px-4 py-2 text-foreground/70"
              >
                取消
              </button>
              <button
                onClick={add}
                className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
