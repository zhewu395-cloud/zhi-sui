import { useEffect, useState } from "react";
import { Plus, Check } from "lucide-react";
import { getAll, put, del, uid, type Todo } from "@/lib/db";

const today = () => new Date().toISOString().slice(0, 10);

export function TodosPage() {
  const [list, setList] = useState<Todo[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());

  const load = async () => {
    const rows = await getAll<Todo>("todos");
    setList(rows.sort((a, b) => (a.date < b.date ? 1 : -1)));
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim()) return;
    await put("todos", {
      id: uid(),
      title: title.trim(),
      date,
      done: false,
      createdAt: Date.now(),
    });
    setTitle("");
    setAdding(false);
    load();
  };

  const toggle = async (t: Todo) => {
    await put("todos", { ...t, done: !t.done });
    load();
  };

  const remove = async (id: string) => {
    await del("todos", id);
    load();
  };

  const groups = list.reduce<Record<string, Todo[]>>((acc, t) => {
    (acc[t.date] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between px-2 pb-3">
        <p className="text-sm text-foreground/60">我的待办</p>
        <button
          onClick={() => setAdding(true)}
          className="glass flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-foreground/80"
        >
          <Plus className="h-4 w-4" /> 添加
        </button>
      </div>

      {Object.keys(groups).length === 0 && (
        <div className="mt-16 text-center text-foreground/50 text-sm">
          还没有待办，点击右上角「添加」开始
        </div>
      )}

      {Object.entries(groups).map(([d, items]) => (
        <div key={d} className="mb-5">
          <div className="px-2 pb-2 text-xs text-foreground/60">{d}</div>
          <div className="space-y-2">
            {items.map((t) => (
              <div key={t.id} className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                <button
                  onClick={() => toggle(t)}
                  className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                    t.done ? "bg-primary border-primary text-primary-foreground" : "border-foreground/30"
                  }`}
                >
                  {t.done && <Check className="h-4 w-4" />}
                </button>
                <span className={`flex-1 ${t.done ? "line-through text-foreground/40" : ""}`}>
                  {t.title}
                </span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-xs text-foreground/40 hover:text-destructive"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {adding && (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-black/30 px-6"
          onClick={() => setAdding(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-medium">新增待办</h3>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="待办内容"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-3 w-full rounded-xl border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setAdding(false)} className="rounded-xl px-4 py-2 text-foreground/70">
                取消
              </button>
              <button onClick={add} className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
