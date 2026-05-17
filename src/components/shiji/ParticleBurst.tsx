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

const SHAPES = ["blade", "shard", "petal", "sliver", "dot"] as const;
type Shape = (typeof SHAPES)[number];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

// 多层次荧光清新绿：从嫩荧光到深竹青，带高饱和发光感
const GREEN_PALETTE = [
  { l: 0.92, c: 0.22, h: 142 }, // 荧光嫩绿
  { l: 0.88, c: 0.26, h: 150 }, // 荧光薄荷
  { l: 0.82, c: 0.30, h: 138 }, // 高饱嫩绿
  { l: 0.78, c: 0.28, h: 156 }, // 荧光青绿
  { l: 0.72, c: 0.24, h: 132 }, // 草绿发光
  { l: 0.65, c: 0.20, h: 148 }, // 深竹青
  { l: 0.95, c: 0.16, h: 145 }, // 雾光绿
  { l: 0.86, c: 0.20, h: 128 }, // 暖荧光
  { l: 0.58, c: 0.22, h: 152 }, // 浓墨竹
];

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
  const angle = rand(0, Math.PI * 2);
  const maxR = full
    ? Math.hypot(vw, vh) * rand(0.55, 0.95)
    : Math.min(vw, vh) * rand(0.12, 0.30);
  const dx = Math.cos(angle) * maxR;
  const dy = Math.sin(angle) * maxR;
  const dur = full ? rand(1.4, 2.2) : rand(1.0, 1.7);
  const shape: Shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

  // 大小分层：~35% 保持小巧，~65% 放大到 2-3 倍，做出"花瓣大碎片"的层次
  const big = Math.random() < 0.65;
  const scaleUp = big ? rand(2.0, 3.2) : 1;

  let w = rand(4, 12);
  let h = rand(2, 6);
  if (shape === "blade") { w = rand(10, 22); h = rand(1.5, 3); }
  if (shape === "petal") { w = rand(10, 18); h = rand(8, 14); }
  if (shape === "shard") { w = rand(6, 13); h = rand(4, 9); }
  if (shape === "sliver") { w = rand(14, 26); h = rand(1.2, 2); }
  if (shape === "dot") { w = h = rand(2.5, 5); }
  w *= scaleUp;
  h *= scaleUp;

  const rotate = rand(-180, 180);
  const p = GREEN_PALETTE[Math.floor(Math.random() * GREEN_PALETTE.length)];
  const ll = (p.l + rand(-0.05, 0.05)).toFixed(2);
  const cc = (p.c * rand(0.75, 1.2)).toFixed(3);
  const hh = (p.h + rand(-10, 10)).toFixed(0);
  const color = `oklch(${ll} ${cc} ${hh})`;
  const colorSoft = `oklch(${ll} ${(p.c * 0.5).toFixed(3)} ${hh} / 0.55)`;

  // 水墨切片：不规则有机轮廓
  let clipPath: string | undefined;
  let borderRadius: string | undefined;
  if (shape === "petal") {
    // 花瓣：上尖下圆的水滴/瓣形
    clipPath = "polygon(50% 0%, 88% 28%, 100% 62%, 78% 96%, 50% 100%, 22% 96%, 0% 62%, 12% 28%)";
  } else if (shape === "shard") {
    // 水墨碎片：不规则锐角
    clipPath = "polygon(8% 22%, 62% 0%, 96% 38%, 80% 86%, 28% 100%, 0% 64%)";
  } else if (shape === "blade") {
    borderRadius = "9999px 2px 9999px 2px";
  } else if (shape === "sliver") {
    borderRadius = "9999px 1px 9999px 1px";
  } else {
    borderRadius = "9999px";
  }

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: w,
    height: h,
    background: shape === "petal" || shape === "shard"
      ? `radial-gradient(ellipse at 35% 30%, ${color} 0%, ${colorSoft} 80%, transparent 100%)`
      : color,
    borderRadius,
    clipPath,
    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    animation: `burst-${shape} ${dur}s cubic-bezier(.22,.68,.28,1) forwards`,
    // @ts-ignore
    "--tx": `${dx}px`,
    "--ty": `${dy}px`,
    pointerEvents: "none",
    boxShadow: `0 0 8px ${color}, 0 0 18px ${color}80, 0 0 30px ${colorSoft}`,
    filter: "blur(0.3px)",
    opacity: 0.95,
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
        @keyframes burst-blade {
          0%   { transform: translate(-50%,-50%) rotate(0deg) scale(0.4); opacity: 0; }
          18%  { transform: translate(-50%,-50%) rotate(40deg) scale(1.05); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(520deg) scale(0.7); opacity: 0; }
        }
        @keyframes burst-shard {
          0%   { transform: translate(-50%,-50%) rotate(0deg) scale(0.5); opacity: 0; filter: blur(0.6px); }
          22%  { transform: translate(-50%,-50%) rotate(30deg) scale(1.15); opacity: 1; filter: blur(0px); }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(260deg) scale(0.55); opacity: 0; filter: blur(1.2px); }
        }
        @keyframes burst-petal {
          0%   { transform: translate(-50%,-50%) rotate(0deg) scale(0.35); opacity: 0; filter: blur(1px); }
          20%  { transform: translate(-50%,-50%) rotate(50deg) scale(1.15); opacity: 1; filter: blur(0px); }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty) + 30px)) rotate(420deg) scale(0.65); opacity: 0; filter: blur(1.5px); }
        }
        @keyframes burst-sliver {
          0%   { transform: translate(-50%,-50%) rotate(0deg) scaleX(0.2); opacity: 0; }
          30%  { transform: translate(-50%,-50%) rotate(15deg) scaleX(1.1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(140deg) scaleX(0.3); opacity: 0; }
        }
        @keyframes burst-dot {
          0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0; }
          22%  { transform: translate(-50%,-50%) scale(1.2); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.3); opacity: 0; }
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
  const count = burst.full ? 180 : 42;
  const arr = Array.from({ length: count });
  return (
    <>
      {arr.map((_, i) => (
        <Particle key={i} x={burst.x} y={burst.y} full={burst.full} />
      ))}
    </>
  );
}
