import { useNavigate } from "react-router-dom";

export default function FloatingAIButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/AiPlanner")}
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-0 
        overflow-hidden rounded-full
        bg-linear-to-r from-purple-600 to-blue-500
        text-white shadow-xl shadow-purple-600/40
        hover:shadow-2xl hover:shadow-purple-500/50
        w-14 h-14 hover:w-auto hover:px-5
        justify-center
        transition-all duration-300 ease-in-out
        active:scale-95"
      aria-label="Open AI Trip Planner"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping bg-purple-400/30 group-hover:opacity-0 transition-opacity duration-200" />

      {/* Online dot */}
      <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white z-10" />

      {/* Icon */}
      <span className="text-2xl shrink-0 group-hover:mr-2 transition-all duration-300">
        🤖
      </span>

      {/* Label revealed on hover */}
      <span className="text-sm font-semibold whitespace-nowrap w-0 overflow-hidden opacity-0
        group-hover:w-auto group-hover:opacity-100 
        transition-all duration-300 ease-in-out">
        AI Planner
      </span>
    </button>
  );
}