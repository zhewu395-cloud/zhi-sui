import { openDB, type IDBPDatabase } from "idb";

export type Activity = { id: string; name: string; createdAt: number };
export type Session = {
  id: string;
  activityId: string;
  activityName: string;
  startAt: number;
  endAt: number;
  duration: number; // seconds
};
export type Todo = {
  id: string;
  title: string;
  detail?: string;
  completed: boolean;
  date: string; // yyyy-MM-dd
  createdAt: number;
};
export type Review = {
  id: string;
  type: "day" | "week" | "month";
  date: string; // yyyy-MM-dd of the period start
  content: string;
  createdAt: number;
};

const DB_NAME = "shiji";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("activities")) {
          db.createObjectStore("activities", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("sessions")) {
          const s = db.createObjectStore("sessions", { keyPath: "id" });
          s.createIndex("startAt", "startAt");
          s.createIndex("activityId", "activityId");
        }
        if (!db.objectStoreNames.contains("todos")) {
          const t = db.createObjectStore("todos", { keyPath: "id" });
          t.createIndex("date", "date");
        }
        if (!db.objectStoreNames.contains("reviews")) {
          const r = db.createObjectStore("reviews", { keyPath: "id" });
          r.createIndex("type", "type");
          r.createIndex("date", "date");
        }
      },
    });
  }
  return dbPromise;
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Activities
export async function listActivities(): Promise<Activity[]> {
  const db = await getDB();
  const all = await db.getAll("activities");
  return (all as Activity[]).sort((a, b) => a.createdAt - b.createdAt);
}
export async function addActivity(name: string) {
  const db = await getDB();
  const a: Activity = { id: uid(), name, createdAt: Date.now() };
  await db.add("activities", a);
  return a;
}
export async function deleteActivity(id: string) {
  const db = await getDB();
  await db.delete("activities", id);
}

// Sessions
export async function addSession(s: Omit<Session, "id">) {
  const db = await getDB();
  const full: Session = { ...s, id: uid() };
  await db.add("sessions", full);
  return full;
}
export async function listSessions(): Promise<Session[]> {
  const db = await getDB();
  const all = await db.getAll("sessions");
  return (all as Session[]).sort((a, b) => b.startAt - a.startAt);
}

// Todos
export async function listTodos(): Promise<Todo[]> {
  const db = await getDB();
  const all = await db.getAll("todos");
  return (all as Todo[]).sort((a, b) => b.createdAt - a.createdAt);
}
export async function addTodo(t: Omit<Todo, "id" | "createdAt" | "completed">) {
  const db = await getDB();
  const full: Todo = { ...t, id: uid(), completed: false, createdAt: Date.now() };
  await db.add("todos", full);
  return full;
}
export async function toggleTodo(id: string) {
  const db = await getDB();
  const t = (await db.get("todos", id)) as Todo | undefined;
  if (!t) return;
  t.completed = !t.completed;
  await db.put("todos", t);
}
export async function deleteTodo(id: string) {
  const db = await getDB();
  await db.delete("todos", id);
}

// Reviews
export async function listReviews(): Promise<Review[]> {
  const db = await getDB();
  const all = await db.getAll("reviews");
  return (all as Review[]).sort((a, b) => b.createdAt - a.createdAt);
}
export async function addReview(r: Omit<Review, "id" | "createdAt">) {
  const db = await getDB();
  const full: Review = { ...r, id: uid(), createdAt: Date.now() };
  await db.add("reviews", full);
  return full;
}

// Export / Import
export async function exportAll() {
  const db = await getDB();
  const data = {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    activities: await db.getAll("activities"),
    sessions: await db.getAll("sessions"),
    todos: await db.getAll("todos"),
    reviews: await db.getAll("reviews"),
  };
  return data;
}

export async function importAll(json: any) {
  if (!json || typeof json !== "object") throw new Error("无效的备份文件");
  const db = await getDB();
  const stores = ["activities", "sessions", "todos", "reviews"] as const;
  const tx = db.transaction(stores, "readwrite");
  for (const s of stores) {
    await tx.objectStore(s).clear();
    const arr = Array.isArray(json[s]) ? json[s] : [];
    for (const item of arr) {
      await tx.objectStore(s).put(item);
    }
  }
  await tx.done;
}
