import React from "react";

interface Shape {
  id: number;
  type: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  animationDelay: number;
  animationDuration: number;
  strokeOnly: boolean;
  variant: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateShapes = (count: number): Shape[] => {
  const types = [
    "circle",
    "square",
    "triangle",
    "hexagon",
    "diamond",
    "ring",
    "cross",
    "donut",
    "pentagon",
    "star",
    "gradientOrb",
    "gradientSquare",
    "gradientTriangle",
    "line",
    "dashedLine",
    "waveLine",
    "zigzag",
    "arc",
    "spiral",
    "dotCluster",
    "concentricRings",
    "gridDots",
    "cornerBracket",
    "semicircle",
  ];

  return Array.from({ length: count }, (_, i) => {
    const seed = i * 7 + 42;
    return {
      id: i,
      type: types[Math.floor(seededRandom(seed) * types.length)],
      x: seededRandom(seed + 1) * 100,
      y: seededRandom(seed + 2) * 100,
      size: 20 + seededRandom(seed + 3) * 100,
      rotation: seededRandom(seed + 4) * 360,
      opacity: 0.025 + seededRandom(seed + 5) * 0.055,
      animationDelay: seededRandom(seed + 6) * 20,
      animationDuration: 15 + seededRandom(seed + 7) * 30,
      strokeOnly: seededRandom(seed + 8) > 0.5,
      variant: Math.floor(seededRandom(seed + 9) * 3),
    };
  });
};

const ShapeSVG = ({ shape }: { shape: Shape }) => {
  const { type, size, strokeOnly, variant, id } = shape;
  const half = size / 2;
  const fill = strokeOnly ? "none" : "currentColor";
  const stroke = strokeOnly ? "currentColor" : "none";
  const strokeWidth = strokeOnly ? 1.5 : 0;
  const gradId = `grad-${id}`;

  switch (type) {
    // ── Original solid shapes ──
    case "circle":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={half - 1} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    case "square":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect x={1} y={1} width={size - 2} height={size - 2} rx={size * 0.1} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    case "triangle":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={`${half},2 ${size - 2},${size - 2} 2,${size - 2}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    case "hexagon": {
      const r = half - 2;
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(" ");
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }

    case "diamond":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={`${half},2 ${size - 2},${half} ${half},${size - 2} 2,${half}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    case "ring":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={half - 2} fill="none" stroke="currentColor" strokeWidth={2} />
          <circle cx={half} cy={half} r={half * 0.5} fill="none" stroke="currentColor" strokeWidth={1} />
        </svg>
      );

    case "cross": {
      const arm = size * 0.15;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect x={half - arm} y={2} width={arm * 2} height={size - 4} rx={arm * 0.5} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x={2} y={half - arm} width={size - 4} height={arm * 2} rx={arm * 0.5} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }

    case "donut":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={half - 2} fill="none" stroke="currentColor" strokeWidth={size * 0.12} strokeDasharray={`${size * 0.4} ${size * 0.2}`} />
        </svg>
      );

    case "pentagon": {
      const r = half - 2;
      const points = Array.from({ length: 5 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(" ");
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }

    case "star": {
      const outer = half - 2;
      const inner = outer * 0.4;
      const points = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI * i) / 5 - Math.PI / 2;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(" ");
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }

    // ── Gradient shapes ──
    case "gradientOrb":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <radialGradient id={gradId}>
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={half} cy={half} r={half - 1} fill={`url(#${gradId})`} />
        </svg>
      );

    case "gradientSquare":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x={1} y={1} width={size - 2} height={size - 2} rx={size * 0.12} fill={`url(#${gradId})`} />
        </svg>
      );

    case "gradientTriangle": {
      const gId2 = `${gradId}-t`;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gId2} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`${half},2 ${size - 2},${size - 2} 2,${size - 2}`} fill={`url(#${gId2})`} />
        </svg>
      );
    }

    // ── Lines ──
    case "line": {
      const w = size * 1.5;
      return (
        <svg width={w} height={size * 0.3} viewBox={`0 0 ${w} ${size * 0.3}`}>
          <line x1={0} y1={size * 0.15} x2={w} y2={size * 0.15} stroke="currentColor" strokeWidth={variant === 0 ? 1 : variant === 1 ? 2 : 1.5} strokeLinecap="round" />
        </svg>
      );
    }

    case "dashedLine": {
      const w = size * 1.8;
      const h = size * 0.3;
      const dashPatterns = ["4 6", "8 4", "2 4 8 4"];
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="currentColor" strokeWidth={1.5} strokeDasharray={dashPatterns[variant]} strokeLinecap="round" />
        </svg>
      );
    }

    case "waveLine": {
      const w = size * 2;
      const h = size * 0.6;
      const amp = h * 0.35;
      const mid = h / 2;
      const segments = 4;
      const segW = w / segments;
      let d = `M 0 ${mid}`;
      for (let i = 0; i < segments; i++) {
        const x1 = i * segW + segW * 0.5;
        const y1 = i % 2 === 0 ? mid - amp : mid + amp;
        const x2 = (i + 1) * segW;
        const y2 = mid;
        d += ` Q ${x1} ${y1}, ${x2} ${y2}`;
      }
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      );
    }

    case "zigzag": {
      const w = size * 2;
      const h = size * 0.5;
      const teeth = 5 + variant * 2;
      const step = w / teeth;
      let d = `M 0 ${h / 2}`;
      for (let i = 0; i < teeth; i++) {
        const yTarget = i % 2 === 0 ? 2 : h - 2;
        d += ` L ${(i + 1) * step} ${yTarget}`;
      }
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    // ── Arcs & spirals ──
    case "arc": {
      const r = half - 4;
      const sweepAngles = [180, 270, 120];
      const sweep = sweepAngles[variant];
      const startAngle = 0;
      const endAngle = (sweep * Math.PI) / 180;
      const x1 = half + r * Math.cos(startAngle);
      const y1 = half + r * Math.sin(startAngle);
      const x2 = half + r * Math.cos(endAngle);
      const y2 = half + r * Math.sin(endAngle);
      const largeArc = sweep > 180 ? 1 : 0;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      );
    }

    case "spiral": {
      const turns = 2.5 + variant;
      const maxR = half - 4;
      const steps = 60;
      let d = "";
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * turns * Math.PI * 2;
        const r = t * maxR;
        const px = half + r * Math.cos(angle);
        const py = half + r * Math.sin(angle);
        d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
      }
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={d} fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
        </svg>
      );
    }

    // ── Dot patterns ──
    case "dotCluster": {
      const dots: { cx: number; cy: number; r: number }[] = [];
      const count = 5 + variant * 3;
      for (let i = 0; i < count; i++) {
        dots.push({
          cx: half + (seededRandom(id * 100 + i) - 0.5) * size * 0.8,
          cy: half + (seededRandom(id * 100 + i + 50) - 0.5) * size * 0.8,
          r: 1 + seededRandom(id * 100 + i + 99) * 3,
        });
      }
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {dots.map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill="currentColor" />
          ))}
        </svg>
      );
    }

    case "gridDots": {
      const cols = 3 + variant;
      const rows = 3 + variant;
      const gapX = (size - 8) / (cols - 1);
      const gapY = (size - 8) / (rows - 1);
      const dotsArr: { cx: number; cy: number }[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dotsArr.push({ cx: 4 + c * gapX, cy: 4 + r * gapY });
        }
      }
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {dotsArr.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={1.5} fill="currentColor" />
          ))}
        </svg>
      );
    }

    // ── Concentric rings ──
    case "concentricRings": {
      const ringCount = 3 + variant;
      const gap = (half - 4) / ringCount;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {Array.from({ length: ringCount }, (_, i) => (
            <circle key={i} cx={half} cy={half} r={gap * (i + 1)} fill="none" stroke="currentColor" strokeWidth={1} />
          ))}
        </svg>
      );
    }

    // ── Corner bracket / L-shape ──
    case "cornerBracket": {
      const armLen = size * 0.7;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={`M ${armLen} 4 L 4 4 L 4 ${armLen}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {variant >= 1 && (
            <path d={`M ${size - armLen} ${size - 4} L ${size - 4} ${size - 4} L ${size - 4} ${size - armLen}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      );
    }

    // ── Semicircle ──
    case "semicircle": {
      const gId3 = `${gradId}-sc`;
      return (
        <svg width={size} height={half + 2} viewBox={`0 0 ${size} ${half + 2}`}>
          <defs>
            <linearGradient id={gId3} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M 2 ${half} A ${half - 2} ${half - 2} 0 0 1 ${size - 2} ${half}`} fill={variant === 0 ? `url(#${gId3})` : "none"} stroke="currentColor" strokeWidth={variant === 0 ? 0 : 1.5} />
        </svg>
      );
    }

    default:
      return null;
  }
};

const shapes = generateShapes(40);

const FloatingShapes: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute text-slate-900 dark:text-white floating-shape"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            opacity: shape.opacity,
            transform: `rotate(${shape.rotation}deg)`,
            animationDelay: `${shape.animationDelay}s`,
            animationDuration: `${shape.animationDuration}s`,
          }}
        >
          <ShapeSVG shape={shape} />
        </div>
      ))}
    </div>
  );
};

export default FloatingShapes;
