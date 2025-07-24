"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Paperclip,
  Image as ImageIcon,
  FileUp,
} from "lucide-react";
import Image from "next/image";

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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
      {/* Content */}
      <div className="relative z-10">
        {/* Main Heading with enhanced spacing and visual hierarchy */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="mb-2 sm:mb-3 text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white flex items-center justify-center flex-wrap gap-3 leading-tight">
            <span className="font-bold">
              Craft
            </span>
            <span className="flex items-end">
              something beautiful
              <Image
                src="/craft-logo.svg"
                alt="Craft.js Logo"
                width={24}
                height={24}
                className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 inline-block drop-shadow-lg mb-1.5 sm:mb-2 ml-0.5"
              />
            </span>
          </h1>

          <p className="text-center text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Build apps and websites by chatting with AI
          </p>
        </div>

        {/* Modern Textbox like Lovable */}
        <div className="w-full max-w-4xl">
          <div className="relative">
            {/* Glass morphism effect background for the input */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10"></div>

            <div className="relative rounded-3xl bg-gray-900/60 backdrop-blur-sm border border-gray-700/30 shadow-2xl shadow-purple-500/5">
              <textarea
                ref={textareaRef}
                placeholder="Ask Craft.js to build something amazing..."
                className="w-full bg-transparent py-8 px-8 text-white placeholder-gray-400 focus:outline-none text-lg min-h-[140px] max-h-[300px] overflow-y-auto resize-none rounded-3xl font-normal leading-relaxed"
                onInput={autoResize}
                onChange={autoResize}
                aria-label="Describe what you want to build"
              />

              {/* Bottom Controls */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/30">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 px-3 py-2 rounded-full text-sm font-medium bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-600/30"
                    aria-label="Add attachment"
                  >
                    <Paperclip size={16} />
                  </button>
                  <button
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 px-3 py-2 rounded-full text-sm font-medium hover:bg-gray-800/30"
                    aria-label="Public visibility"
                  >
                    🌐 Public
                  </button>
                </div>

                <button className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-200 shadow-lg hover:shadow-purple-500/25 hover:scale-105">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
