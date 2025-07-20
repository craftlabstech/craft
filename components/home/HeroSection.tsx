"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { ArrowRight, Paperclip, Image, FileUp } from "lucide-react";

export default function HeroSection() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize function - optimized with useCallback
  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate new height (capped by CSS max-height)
    const newHeight = Math.min(textarea.scrollHeight, 400); // 240px for sm breakpoint handled by CSS
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Initialize height on component mount
  useEffect(() => {
    if (textareaRef.current) {
      // Set initial height based on default content (if any)
      autoResize();
    }
  }, [autoResize]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center flex-1">
      <h1 className="mb-6 sm:mb-8 text-center text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-white">
        What can I help you craft?
      </h1>

      {/* Responsive Textbox with Interactive Gradient */}
      <div className="w-full">
        <div className="relative group">
          {/* Gradient Border Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-75 group-hover:opacity-100 group-hover:blur transition-all duration-300 animate-gradient"></div>

          {/* Main Textbox */}
          <div className="relative rounded-3xl border border-transparent bg-gray-900 shadow-[0_0_15px_rgba(79,70,229,0.15)] group-hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300">
            <textarea
              ref={textareaRef}
              placeholder="Ask Craft.js to build..."
              className="w-full bg-transparent py-4 sm:py-6 px-4 sm:px-6 text-white placeholder-gray-400 focus:outline-none text-base sm:text-base min-h-[100px] sm:min-h-[120px] max-h-[200px] sm:max-h-[240px] overflow-y-auto resize-none
              scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500
              scrollbar-thumb-rounded-full"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4B5563 transparent",
              }}
              onInput={autoResize}
              onChange={autoResize}
              aria-label="Describe what you want to build"
            />

            {/* Bottom Controls */}
            <div className="flex items-center justify-between border-t border-gray-800 px-4 sm:px-6 py-2 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  className="text-gray-400 hover:text-blue-400 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Attach file"
                >
                  <Paperclip
                    size={16}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                  />
                </button>
                <button
                  className="text-gray-400 hover:text-purple-400 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                  aria-label="Upload image"
                >
                  <Image
                    size={16}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                  />
                </button>
                <button
                  className="text-gray-400 hover:text-pink-400 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
                  aria-label="Upload file"
                >
                  <FileUp
                    size={16}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                  />
                </button>
              </div>

              <button className="flex items-center gap-1 sm:gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] focus:outline-none focus:ring-2 focus:ring-purple-500">
                Start Crafting
                <ArrowRight size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
