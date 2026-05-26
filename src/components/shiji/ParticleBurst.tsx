import { useEffect, useState } from "react";

type Burst = {
  id: number;
  x: number; // 0..1 屏幕比例
  y: number;
  full?: boolean;
};

let _id = 0;
let _emit: ((b: Omit<Burst, "id">) => void) | null = null;

export function fireBurst(b: Omit<Burst, "id">) {
  _emit?.(b);
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 三层颜色（从外到内）—— 严格无黑、无深灰
// 外层：柔和雾绿（莫兰迪）
const OUTER = [
  "oklch(0.78 0.055 150)",
  "oklch(0.80 0.060 148)",
  "oklch(0.82 0.050 152)",
  "oklch(0.76 0.065 145)",
];
// 中层：清新明亮薄荷绿
const MID = [
  "oklch(0.88 0.130 158)",
  "oklch(0.90 0.115 152)",
  "oklch(0.86 0.140 160)",
  "oklch(0.89 0.120 155)",
];
// 核心：米白绿（柔光心）
const CORE = [
  "oklch(0.975 0.045 145)",
  "oklch(0.97 0.035 150)",
  "oklch(0.98 0.040 142)",
];

type Kind = "leaf-l" | "leaf-s" | "fleck" | "spark";

function leafRadius() {
  const a = rand(80, 100);
  const b = rand(0, 20);
  return `${a}% ${b}% ${a}% ${b}% / ${a}% ${b}% ${a}% ${b}%`;
}

// 构造三层径向渐变：核心(米白绿) → 中层(明亮薄荷) → 外层(雾绿) → 透明
function layeredFill() {
  const core = pick(CORE);
  const mid = pick(MID);
  const outer = pick(OUTER);
  // 内 20% 米白绿、20%-25% 过渡薄荷、25%-75% 雾绿主体、75%-100% 渐隐
  return `radial-gradient(ellipse at 42% 44%,
      ${core} 0%,
      ${core} 18%,
      ${mid} 25%,
      ${mid} 32%,
      ${outer} 55%,
      ${outer} 86%,
      transparent 100%)`;
}

function Particle({
  x,
  y,
  full,
}: {
  x: number;
  y: number;
  full?: boolean;
}) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 700;

  const r = Math.random();
  const kind: Kind =
    r < 0.45 ? "leaf-l" : r < 0.78 ? "leaf-s" : r < 0.93 ? "fleck" : "spark";

  const angle = rand(0, Math.PI * 2);
  const rx = full ? vw * rand(0.4, 0.55) : (vw / 2) * rand(0.55, 1.05);
  const ry = full ? vh * rand(0.4, 0.55) : (vh / 3) * rand(0.45, 0.95);
  const jitter = rand(0.5, 1.35);
  const dx = Math.cos(angle) * rx * jitter;
  const dyBase = Math.sin(angle) * ry * jitter;
  const gravity = full ? 0 : rand(18, 70);
  const dy = dyBase + gravity;

  const dur = full ? rand(1.3, 2.1) : rand(1.0, 1.7);
  const delay = rand(0, full ? 0.25 : 0.14);

  let w = 12;
  let h = 12;
  let borderRadius: string | undefined;
  let background: string;
  let opacity = rand(0.7, 0.92);
  let blur = 0;
  let extraShadow = "";

  if (kind === "leaf-l") {
    w = rand(16, 28);
    h = rand(9, 15);
    borderRadius = leafRadius();
    background = layeredFill();
  } else if (kind === "leaf-s") {
    w = rand(8, 14);
    h = rand(5, 9);
    borderRadius = leafRadius();
    background = layeredFill();
  } else if (kind === "fleck") {
    // 小色斑：仍保留三层渐变
    w = h = rand(6, 11);
    borderRadius = `${rand(50, 70)}% ${rand(40, 60)}% ${rand(50, 70)}% ${rand(40, 60)}%`;
    background = layeredFill();
    opacity = rand(0.6, 0.85);
  } else {
    // 米白绿微光点
    w = h = rand(2.5, 4.5);
    borderRadius = "9999px";
    const c = pick(CORE);
    background = c;
    opacity = rand(0.85, 1);
    extraShadow = `0 0 ${rand(5, 10)}px ${pick(MID)}, 0 0 ${rand(10, 16)}px ${pick(CORE)}`;
  }

  const rotate = rand(-180, 180);
  const endRotate = rotate + rand(-540, 540);

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: w,
    height: h,
    background,
    borderRadius,
    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    animation: `petal-burst ${dur}s cubic-bezier(.18,.7,.3,1) ${delay}s forwards`,
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
    boxShadow: extraShadow || undefined,
    // 不使用 multiply，避免在浅绿背景上出现深色/黑色叠加
    mixBlendMode: "normal",
    // @ts-ignore
    "--tx": `${dx}px`,
    "--ty": `${dy}px`,
    "--rot": `${endRotate}deg`,
    "--op": `${opacity}`,
    pointerEvents: "none",
    opacity: 0,
  };
  return <span style={style} />;
}

// 完成处的柔和绿色玻璃光晕（无黑、无灰）
function Halo({ x, y }: { x: number; y: number }) {
  const size = rand(170, 230);
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: size,
    height: size,
    transform: "translate(-50%, -50%)",
    borderRadius: "9999px",
    background:
      "radial-gradient(circle, oklch(0.97 0.04 145 / 0.55) 0%, oklch(0.90 0.10 152 / 0.30) 38%, oklch(0.82 0.06 150 / 0.10) 70%, transparent 100%)",
    filter: "blur(8px)",
    mixBlendMode: "screen",
    animation: "halo-pulse 1.4s ease-out forwards",
    pointerEvents: "none",
    opacity: 0,
  };
  return <span style={style} />;
}

export function ParticleLayer() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    _emit = (b) => {
      const id = ++_id;
      setBursts((prev) => [...prev, { ...b, id }]);
      window.setTimeout(
        () => setBursts((prev) => prev.filter((x) => x.id !== id)),
        2600,
      );
    };
    return () => {
      _emit = null;
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes petal-burst {
          0% {
            transform: translate(-50%,-50%) rotate(0deg) scale(0.5);
            opacity: 0;
            filter: blur(1px);
          }
          18% {
            opacity: var(--op, 0.85);
            transform: translate(-50%,-50%) rotate(20deg) scale(1.08);
          }
          75% { opacity: calc(var(--op, 0.85) * 0.85); }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(0.6);
            opacity: 0;
          }
        }
        @keyframes halo-pulse {
          0% { opacity: 0; transform: translate(-50%,-50%) scale(0.4); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(1.6); }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {bursts.map((b) => (
          <BurstGroup key={b.id} burst={b} />
        ))}
      </div>
    </>
  );
}

function BurstGroup({ burst }: { burst: Burst }) {
  const count = burst.full ? 220 : 80;
  const arr = Array.from({ length: count });
  return (
    <>
      {!burst.full && <Halo x={burst.x} y={burst.y} />}
      {arr.map((_, i) => (
        <Particle key={i} x={burst.x} y={burst.y} full={burst.full} />
      ))}
    </>
  );
}
