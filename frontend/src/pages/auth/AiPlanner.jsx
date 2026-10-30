import { useNavigate } from "react-router-dom";

export default function FloatingAIButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/AiPlanner")}
      className="fixed bottom-6 right-6 z-50 group flex items-center
    overflow-hidden rounded-full
    h-13 min-w-13 px-3.5
    hover:min-w-42 hover:px-5
    border border-white/[0.14] hover:border-[#7b6fff]/40
    bg-[rgba(18,18,30,0.72)] backdrop-blur-xl
    text-white cursor-pointer
    transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]
    active:scale-95
    shadow-[0_8px_32px_rgba(0,0,0,0.45),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]
    hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.16),0_0_24px_rgba(99,88,255,0.2)]"
      aria-label="Open AI Trip Planner"
    >
      {/* Gradient overlay — revealed on hover */}
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
    bg-[linear-gradient(135deg,rgba(120,110,255,0.18)_0%,rgba(80,200,160,0.1)_100%)]
    transition-opacity duration-300"
      />

      {/* Shimmer sweep on hover */}
      <span
        className="absolute inset-0 rounded-full
    bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)]
    bg-size-[200%_100%] bg-position-[200%_0]
    group-hover:animate-shimmer"
      />

      {/* Pulse ring */}
      <span
        className="absolute -inset-0.75 rounded-full
    border border-[rgba(120,110,255,0.5)]
    animate-pulse-ring
    group-hover:opacity-0 transition-opacity duration-200"
      />

      {/* Status dot */}
      <span
        className="absolute top-2 right-2 z-10
    w-2.25 h-2.25 rounded-full
    bg-emerald-400 border-2 border-[rgba(18,18,30,0.85)]
    shadow-[0_0_6px_rgba(52,211,153,0.6)]"
      />

      {/* Icon */}
      <span
        className="relative shrink-0 text-[22px] leading-none
    drop-shadow-[0_0_8px_rgba(120,110,255,0.5)]
    transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]
    group-hover:scale-110 group-hover:-rotate-[8deg]"
      >
        🤖
      </span>

      {/* Label */}
      <span
        className="relative text-[13.5px] font-semibold tracking-[0.01em]
    text-white/90 whitespace-nowrap
    max-w-0 overflow-hidden opacity-0 ml-0
    group-hover:max-w-27.5 group-hover:opacity-100 group-hover:ml-2.25
    transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      >
        AI Planner
      </span>
    </button>
  );
}
