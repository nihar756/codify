"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Code2, Sparkles } from "lucide-react";

export default function ModeDropdown() {
  const pathname = usePathname();
  const isDevelopment = pathname.startsWith("/web");

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg
          bg-[#0e0e14] border border-white/10 text-sm text-gray-200
          hover:bg-white/5 transition-all"
      >
        {isDevelopment ? (
          <Sparkles className="w-4 h-4 text-purple-400" />
        ) : (
          <Code2 className="w-4 h-4 text-blue-400" />
        )}

        <span className="font-medium">
          {isDevelopment ? "Development" : "Programming"}
        </span>

        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden
            bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 shadow-xl z-50"
        >
          <button
            onClick={() => {
              setOpen(false);
              window.location.href = "/";
            }}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left
    hover:bg-white/5 transition-all ${
      !isDevelopment ? "text-white" : "text-gray-400"
    }`}
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            Programming
          </button>

          <Link
            href="/web"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 px-4 py-2 text-sm
              hover:bg-white/5 transition-all ${
                isDevelopment ? "text-white" : "text-gray-400"
              }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Development
          </Link>
        </div>
      )}
    </div>
  );
}
