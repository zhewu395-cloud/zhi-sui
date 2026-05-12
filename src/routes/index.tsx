import { createFileRoute } from "@tanstack/react-router";
import ShijiAppClient from "@/components/ShijiApp";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "时迹 — 时间记录 · 计时 · 待办 · 复盘" },
      { name: "description", content: "纯本地隐私优先的时间记录与复盘工具，所有数据保存在你的设备上。" },
    ],
  }),
});

function Index() {
  return <ShijiAppClient />;
}
