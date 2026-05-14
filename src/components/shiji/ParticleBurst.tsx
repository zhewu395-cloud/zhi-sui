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

const SHAPES = ["ellipse", "blade", "shard"] as const;
type Shape = (typeof SHAPES)[number];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
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
  const angle = rand(0, Math.PI * 2);
  const dist = full ? rand(220, 480) : rand(60, 180);
  const dx = Math.cos(angle) * dist;
  const dy = Math.sin(angle) * dist;
  const dur = rand(0.7, 1.3);
  const w = rand(4, 14);
  const h = rand(2, 8);
  const shape: Shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const rotate = rand(-180, 180);
  const greenL = rand(0.42, 0.78);
  const greenH = rand(125, 165);
  const color = `oklch(${greenL.toFixed(2)} 0.13 ${greenH.toFixed(0)})`;

  let style: React.CSSProperties = {
    position: "absolute",
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: w,
    height: h,
    background: color,
    borderRadius:
      shape === "ellipse" ? "9999px" : shape === "blade" ? "9999px 2px" : "2px",
    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    animation: `burst-${shape} ${dur}s ease-out forwards`,
    // 通过 CSS 变量传递目标位移
    // @ts-ignore
    "--tx": `${dx}px`,
    "--ty": `${dy}px`,
    pointerEvents: "none",
    boxShadow: `0 0 6px ${color}`,
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
        1500,
      );
    };
    return () => {
      _emit = null;
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes burst-ellipse {
          0% { transform: translate(-50%,-50%) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(360deg) scale(0.4); opacity: 0; }
        }
        @keyframes burst-blade {
          0% { transform: translate(-50%,-50%) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(540deg) scale(0.5); opacity: 0; }
        }
        @keyframes burst-shard {
          0% { transform: translate(-50%,-50%) rotate(0deg) scale(1); opacity: 0.95; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(180deg) scale(0.3); opacity: 0; }
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
  const count = burst.full ? 80 : 22;
  const arr = Array.from({ length: count });
  return (
    <>
      {arr.map((_, i) => (
        <Particle key={i} x={burst.x} y={burst.y} full={burst.full} />
      ))}
    </>
  );
}
