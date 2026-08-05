import React from "react";
import { useLocation } from "react-router-dom";

export default function PageSkeleton({ variant: overrideVariant }) {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  let variant = overrideVariant;
  if (!variant) {
    if (path === "/" || path === "") variant = "hero";
    else if (path.includes("/admin") || path.includes("/superadmin")) variant = "dashboard";
    else if (path.includes("/assistantchat")) variant = "chat";
    else if (path.includes("/hotels/") || path.includes("/restaurant/") || path.includes("/food/")) variant = "detail";
    else if (path.includes("/hotels") || path.includes("/places") || path.includes("/explore") || path.includes("/restaurant")) variant = "grid";
    else variant = "grid";
  }

  return (
    <div className="w-full min-h-screen bg-[#faf5ef] px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="mx-auto max-w-7xl">
        {variant === "hero" && <HeroSkeletonVariant />}
        {variant === "grid" && <GridSkeletonVariant />}
        {variant === "detail" && <DetailSkeletonVariant />}
        {variant === "dashboard" && <DashboardSkeletonVariant />}
        {variant === "chat" && <ChatSkeletonVariant />}
      </div>
    </div>
  );
}

function HeroSkeletonVariant() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero Header */}
      <div className="flex flex-col gap-3 max-w-2xl">
        <div className="h-4 w-32 rounded-full bg-amber-200/60 animate-skeleton-shimmer" />
        <div className="h-12 w-3/4 rounded-2xl bg-amber-200/50 animate-skeleton-shimmer" />
        <div className="h-5 w-1/2 rounded-xl bg-amber-200/40 animate-skeleton-shimmer" />
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-amber-200/50 animate-skeleton-shimmer" />
        ))}
      </div>

      {/* Search Box */}
      <div className="h-28 w-full rounded-3xl bg-amber-200/50 border border-amber-200/60 animate-skeleton-shimmer" />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-3xl bg-amber-200/40 border border-amber-200/50 animate-skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

function GridSkeletonVariant() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 rounded-xl bg-amber-200/60 animate-skeleton-shimmer" />
          <div className="h-4 w-72 rounded-lg bg-amber-200/40 animate-skeleton-shimmer" />
        </div>
        <div className="h-10 w-36 rounded-2xl bg-amber-200/50 animate-skeleton-shimmer" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-3 p-4 rounded-3xl bg-white/70 border border-amber-200/40 shadow-sm">
            <div className="h-44 w-full rounded-2xl bg-amber-200/40 animate-skeleton-shimmer" />
            <div className="h-6 w-3/4 rounded-lg bg-amber-200/60 animate-skeleton-shimmer" />
            <div className="h-4 w-1/2 rounded-md bg-amber-200/40 animate-skeleton-shimmer" />
            <div className="flex justify-between items-center mt-2">
              <div className="h-6 w-20 rounded-full bg-amber-200/50 animate-skeleton-shimmer" />
              <div className="h-9 w-28 rounded-xl bg-amber-300/60 animate-skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeletonVariant() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-6">
        <div className="h-96 w-full rounded-3xl bg-amber-200/50 animate-skeleton-shimmer" />
        <div className="h-10 w-2/3 rounded-xl bg-amber-200/60 animate-skeleton-shimmer" />
        <div className="h-20 w-full rounded-2xl bg-amber-200/30 animate-skeleton-shimmer" />
      </div>
      <div className="w-full lg:w-96 h-80 rounded-3xl bg-white/80 border border-amber-200/60 p-6 flex flex-col gap-4">
        <div className="h-6 w-1/2 rounded-lg bg-amber-200/60 animate-skeleton-shimmer" />
        <div className="h-12 w-full rounded-xl bg-amber-200/40 animate-skeleton-shimmer" />
        <div className="h-12 w-full rounded-2xl bg-amber-400/60 animate-skeleton-shimmer mt-auto" />
      </div>
    </div>
  );
}

function DashboardSkeletonVariant() {
  return (
    <div className="flex gap-6">
      <div className="hidden lg:flex flex-col gap-4 w-64 h-screen p-4 rounded-3xl bg-amber-200/30">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-full rounded-xl bg-amber-200/50 animate-skeleton-shimmer" />
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-amber-200/40 animate-skeleton-shimmer" />
          ))}
        </div>
        <div className="h-96 w-full rounded-3xl bg-white/70 border border-amber-200/40 p-6">
          <div className="h-8 w-40 rounded-lg bg-amber-200/60 mb-6 animate-skeleton-shimmer" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-amber-200/30 mb-3 animate-skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatSkeletonVariant() {
  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto p-6 rounded-3xl bg-white/80 border border-amber-200/50">
      <div className="h-12 w-full rounded-2xl bg-amber-200/40 animate-skeleton-shimmer mb-4" />
      <div className="h-16 w-3/4 rounded-2xl bg-amber-200/50 animate-skeleton-shimmer self-start" />
      <div className="h-16 w-3/4 rounded-2xl bg-amber-300/50 animate-skeleton-shimmer self-end" />
      <div className="h-16 w-2/3 rounded-2xl bg-amber-200/50 animate-skeleton-shimmer self-start" />
    </div>
  );
}
