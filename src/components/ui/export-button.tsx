'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex items-center gap-1.5 text-white rounded-md px-[0.12rem] py-[0.12rem] transition-all duration-200",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:brightness-95",
          className
        )}
        disabled={disabled}
        {...props}
      >
        <div className="flex items-center justify-center bg-gradient-to-b from-[#2567EC] to-[#37B6F7] rounded-[0.8rem] w-full h-full relative shadow-[0_1px_3px_0px_rgba(0,0,0,0.65)]">
          {/* Overlay gradient for the glass effect */}
          <div className="absolute w-full h-full left-0 top-0 bg-gradient-to-b from-white/50 to-white/0 z-10 rounded-[0.8rem]">
            <div className="absolute w-[calc(100%-2px)] h-[calc(100%-2px)] top-[0.08rem] left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#2567EC] to-[#37B6F7] rounded-[0.8rem]"></div>
          </div>
          {/* Content wrapper to ensure it stays above overlays */}
          <div className="relative z-50 flex items-center justify-center">
            {children}
          </div>
        </div>
      </button>
    );
  }
);
GradientButton.displayName = "GradientButton";

export { GradientButton };