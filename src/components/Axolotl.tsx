import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/cn";

type Particle = {
  id: string;
  burst: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  rotate: number;
  type: "heart" | "sparkle";
};

interface AxolotlProps {
  size?: number | string;
  className?: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function Axolotl({ size = 420, className }: AxolotlProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const [pose, setPose] = useState(() => ({
    headX: 0,
    headY: 0,
    faceX: 0,
    faceY: 0,
    eyeX: 0,
    eyeY: 0,
    gillLagX: 0,
    gillLagY: 0,
  }));

  const burstCounter = useRef(0);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let blinkTimeout: number;

    const queueBlink = () => {
      const nextDelay = 2600 + Math.random() * 2000;
      blinkTimeout = window.setTimeout(() => {
        setIsBlinking(true);
        window.setTimeout(() => setIsBlinking(false), 140);
        queueBlink();
      }, nextDelay);
    };

    queueBlink();

    return () => {
      window.clearTimeout(blinkTimeout);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const lerp = 0.12;
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * lerp;
      current.y += (target.y - current.y) * lerp;

      const headX = clamp(current.x / 14, -22, 22);
      const headY = clamp(current.y / 18, -18, 18);

      const nextPose = {
        headX,
        headY,
        faceX: headX * 1.2,
        faceY: headY * 1.2,
        eyeX: clamp(current.x / 22, -10, 10),
        eyeY: clamp(current.y / 22, -10, 10),
        gillLagX: -headX * 0.35,
        gillLagY: -headY * 0.25,
      };

      setPose((prev) => {
        const delta =
          Math.abs(prev.headX - nextPose.headX) +
          Math.abs(prev.headY - nextPose.headY) +
          Math.abs(prev.eyeX - nextPose.eyeX) +
          Math.abs(prev.eyeY - nextPose.eyeY);
        return delta < 0.15 ? prev : nextPose;
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    const handlePointerMove = (event: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetRef.current = {
        x: event.clientX - (rect.left + rect.width / 2),
        y: event.clientY - (rect.top + rect.height / 2),
      };
    };

    const handlePointerLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  const handleClick = () => {
    const burst = ++burstCounter.current;
    setIsReacting(true);
    setIsBlinking(true);

    window.setTimeout(() => setIsBlinking(false), 140);
    window.setTimeout(() => setIsReacting(false), 650);

    const hearts = Array.from({ length: 6 }).map((_, index): Particle => ({
      id: `heart-${burst}-${index}`,
      burst,
      type: "heart",
      left: 32 + ((index * 11) % 36),
      top: 22 + ((index * 9) % 42),
      size: 18 + ((index * 3) % 12),
      delay: (index * 55) % 160,
      rotate: -14 + ((index * 9) % 28),
    }));

    const sparkles = Array.from({ length: 3 }).map((_, index): Particle => ({
      id: `sparkle-${burst}-${index}`,
      burst,
      type: "sparkle",
      left: 40 + ((index * 17) % 22),
      top: 28 + ((index * 13) % 28),
      size: 10 + index * 4,
      delay: (index * 65) % 180,
      rotate: 0,
    }));

    setParticles((prev) => [...prev, ...hearts, ...sparkles]);
    window.setTimeout(
      () => setParticles((prev) => prev.filter((p) => p.burst !== burst)),
      1400
    );
  };

  const sizeStyle = useMemo(
    () => ({ width: typeof size === "number" ? `${size}px` : size }),
    [size]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-square select-none",
        "flex items-center justify-center",
        "touch-none",
        className
      )}
      style={sizeStyle}
      onClick={handleClick}
      role="img"
      aria-label="Axo the interactive axolotl pet"
    >
      <svg
        viewBox="0 0 500 500"
        className={cn(
          "w-full h-full transition-transform duration-500 ease-out",
          isReacting ? "scale-110 rotate-2 axo-hop" : "scale-100"
        )}
        style={{ filter: "drop-shadow(0px 15px 25px rgba(0,0,0,0.08))" }}
      >
        <defs>
          <radialGradient id="skinLight" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff0f5" />
            <stop offset="50%" stopColor="#ffcce0" />
            <stop offset="100%" stopColor="#ff9eb5" />
          </radialGradient>

          <radialGradient id="gillGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff9ecf" />
            <stop offset="100%" stopColor="#e11d48" />
          </radialGradient>

          <radialGradient id="eyeGradient" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          <filter id="softGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="blushFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>

        <g transform={`translate(${pose.headX * 0.3}, ${pose.headY * 0.3})`}>
          <path
            d="M 340 320 Q 440 340 460 250 Q 470 150 380 160 Q 320 170 260 260"
            fill="url(#skinLight)"
            opacity="0.9"
            className="origin-center animate-[pulse_4s_ease-in-out_infinite]"
          />

          <path
            d="M 180 330 Q 150 380 130 350"
            stroke="#ffcce0"
            strokeWidth="28"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 320 330 Q 350 380 370 350"
            stroke="#ffcce0"
            strokeWidth="28"
            strokeLinecap="round"
            fill="none"
          />

          <ellipse cx="250" cy="310" rx="110" ry="100" fill="url(#skinLight)" />

          <path
            d="M 160 290 Q 120 330 110 290"
            stroke="url(#skinLight)"
            strokeWidth="32"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 340 290 Q 380 330 390 290"
            stroke="url(#skinLight)"
            strokeWidth="32"
            strokeLinecap="round"
            fill="none"
          />

          <ellipse
            cx="250"
            cy="320"
            rx="70"
            ry="60"
            fill="#fff5f8"
            opacity="0.5"
            filter="url(#softGlow)"
          />
        </g>

        <g transform={`translate(${pose.headX}, ${pose.headY})`}>
          <g className="transition-transform duration-300">
            <g
              transform={`translate(${-20 + pose.gillLagX}, ${pose.gillLagY}) rotate(${pose.gillLagX * 0.5}, 150, 200)`}
            >
              <path
                d="M 160 170 Q 90 120 80 150"
                stroke="#ff9ecf"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="80" cy="150" r="18" fill="url(#gillGradient)" />
              <circle cx="95" cy="135" r="12" fill="url(#gillGradient)" />
              <circle cx="65" cy="155" r="12" fill="url(#gillGradient)" />
              <circle cx="85" cy="165" r="10" fill="url(#gillGradient)" />

              <path
                d="M 155 210 Q 70 190 60 220"
                stroke="#ff9ecf"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="60" cy="220" r="22" fill="url(#gillGradient)" />
              <circle cx="75" cy="200" r="14" fill="url(#gillGradient)" />
              <circle cx="50" cy="235" r="14" fill="url(#gillGradient)" />
              <circle cx="75" cy="235" r="10" fill="url(#gillGradient)" />

              <path
                d="M 160 250 Q 90 300 90 280"
                stroke="#ff9ecf"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="90" cy="280" r="18" fill="url(#gillGradient)" />
              <circle cx="105" cy="265" r="12" fill="url(#gillGradient)" />
              <circle cx="80" cy="295" r="12" fill="url(#gillGradient)" />
            </g>

            <g
              transform={`translate(${20 - pose.gillLagX}, ${pose.gillLagY}) rotate(${-pose.gillLagX * 0.5}, 350, 200)`}
            >
              <path
                d="M 340 170 Q 410 120 420 150"
                stroke="#ff9ecf"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="420" cy="150" r="18" fill="url(#gillGradient)" />
              <circle cx="405" cy="135" r="12" fill="url(#gillGradient)" />
              <circle cx="435" cy="155" r="12" fill="url(#gillGradient)" />
              <circle cx="415" cy="165" r="10" fill="url(#gillGradient)" />

              <path
                d="M 345 210 Q 430 190 440 220"
                stroke="#ff9ecf"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="440" cy="220" r="22" fill="url(#gillGradient)" />
              <circle cx="425" cy="200" r="14" fill="url(#gillGradient)" />
              <circle cx="450" cy="235" r="14" fill="url(#gillGradient)" />
              <circle cx="425" cy="235" r="10" fill="url(#gillGradient)" />

              <path
                d="M 340 250 Q 410 300 410 280"
                stroke="#ff9ecf"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="410" cy="280" r="18" fill="url(#gillGradient)" />
              <circle cx="395" cy="265" r="12" fill="url(#gillGradient)" />
              <circle cx="420" cy="295" r="12" fill="url(#gillGradient)" />
            </g>
          </g>

          <path
            d="M 120 150 C 110 80, 390 80, 380 150 V 240 C 380 310, 120 310, 120 240 Z"
            fill="url(#skinLight)"
          />

          <ellipse
            cx="250"
            cy="150"
            rx="90"
            ry="45"
            fill="white"
            opacity="0.15"
            filter="url(#softGlow)"
          />

          <g transform={`translate(${pose.faceX}, ${pose.faceY})`}>
            <ellipse
              cx="150"
              cy="230"
              rx="30"
              ry="20"
              fill="#f43f5e"
              opacity="0.4"
              filter="url(#blushFilter)"
            />
            <ellipse
              cx="350"
              cy="230"
              rx="30"
              ry="20"
              fill="#f43f5e"
              opacity="0.4"
              filter="url(#blushFilter)"
            />

            {isBlinking ? (
              <g stroke="#1f2937" strokeWidth="5" fill="none" strokeLinecap="round">
                <path d="M 160 210 Q 185 200 210 210" />
                <path d="M 290 210 Q 315 200 340 210" />
              </g>
            ) : (
              <g>
                <g transform={`translate(${pose.eyeX}, ${pose.eyeY})`}>
                  <circle cx="185" cy="210" r="22" fill="url(#eyeGradient)" />
                  <circle cx="178" cy="202" r="7" fill="white" />
                  <circle cx="192" cy="215" r="3" fill="white" opacity="0.8" />
                </g>

                <g transform={`translate(${pose.eyeX}, ${pose.eyeY})`}>
                  <circle cx="315" cy="210" r="22" fill="url(#eyeGradient)" />
                  <circle cx="308" cy="202" r="7" fill="white" />
                  <circle cx="322" cy="215" r="3" fill="white" opacity="0.8" />
                </g>
              </g>
            )}

            <g transform={`translate(0, ${isReacting ? -5 : 0})`}>
              {isReacting ? (
                <path
                  d="M 235 235 Q 250 250 265 235"
                  fill="none"
                  stroke="#be185d"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M 240 240 Q 250 245 260 240"
                  fill="none"
                  stroke="#be185d"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              )}
            </g>
          </g>
        </g>
      </svg>

      {particles.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          {particles.map((particle) => {
            const baseStyle: CSSProperties = {
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              transform: `rotate(${particle.rotate}deg)`,
            };

            if (particle.type === "heart") {
              return (
                <div
                  key={particle.id}
                  className="absolute axo-heart text-pink-500"
                  style={
                    {
                      ...baseStyle,
                      fontSize: `${particle.size}px`,
                      "--heart-duration": `${0.8 + particle.size / 50}s`,
                      "--heart-delay": `${particle.delay}ms`,
                    } as CSSProperties
                  }
                >
                  ♥
                </div>
              );
            }

            return (
              <div
                key={particle.id}
                className="absolute axo-sparkle text-pink-200"
                style={{
                  ...baseStyle,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDelay: `${particle.delay}ms`,
                }}
              >
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path
                    d="M12 0 L14 8 L22 10 L14 12 L12 20 L10 12 L2 10 L10 8 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
