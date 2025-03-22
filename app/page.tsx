"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  Camera,
  Figma,
  LayoutDashboard,
  FormInput,
  ExternalLink,
  FileUp,
  Paperclip,
  Image,
  ShoppingCart,
  MessageSquare,
  Calendar,
  BarChart,
  Users,
  Globe,
  Newspaper,
  Cloud,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [showAllOptions, setShowAllOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleShowAllOptions = () => {
    setShowAllOptions(true);
  };

  // Auto-resize function
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate new height (capped by CSS max-height)
    const newHeight = Math.min(textarea.scrollHeight, 400); // 240px for sm breakpoint handled by CSS
    textarea.style.height = `${newHeight}px`;
  };

  // Initialize height on component mount
  useEffect(() => {
    if (textareaRef.current) {
      // Set initial height based on default content (if any)
      autoResize();
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Responsive Header */}
      <header className="fixed top-0 z-50 w-full bg-black">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <div className="flex items-baseline">
              <span className="tracking-wider font-knewave text-lg sm:text-xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Craft
              </span>
              <span className="text-white">.</span>
              <span className="tracking-normal text-xs font-medium text-white">
                JS
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/signin"
              className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-center rounded-full bg-white px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-black transition-colors hover:bg-gray-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-16 pb-8">
        {/* Responsive Hero Section */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
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
                  placeholder="Ask Craft.js to craft..."
                  className="w-full bg-transparent py-4 sm:py-6 px-4 sm:px-6 text-white placeholder-gray-400 focus:outline-none text-base sm:text-base min-h-[100px] sm:min-h-[120px] max-h-[200px] sm:max-h-[240px] overflow-y-auto resize-none
                  scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500
                  scrollbar-thumb-rounded-full"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#4B5563 transparent",
                  }}
                  onInput={autoResize}
                  onChange={autoResize}
                ></textarea>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between border-t border-gray-800 px-4 sm:px-6 py-2 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button className="text-gray-400 hover:text-blue-400 transition-colors p-1">
                      <Paperclip
                        size={16}
                        className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                      />
                    </button>
                    <button className="text-gray-400 hover:text-purple-400 transition-colors p-1">
                      <Image
                        size={16}
                        className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                      />
                    </button>
                    <button className="text-gray-400 hover:text-pink-400 transition-colors p-1">
                      <FileUp
                        size={16}
                        className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                      />
                    </button>
                  </div>

                  <button className="flex items-center gap-1 sm:gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                    Start Crafting
                    <ArrowRight
                      size={16}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Template Options */}
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {!showAllOptions ? (
              <>
                <TemplateOption
                  icon={
                    <Camera size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="Clone a Screenshot"
                />
                <TemplateOption
                  icon={
                    <Figma size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="Import from Figma"
                />
                <TemplateOption
                  icon={
                    <LayoutDashboard
                      size={16}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  }
                  label="Landing Page"
                />
                <TemplateOption
                  icon={
                    <FormInput
                      size={16}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  }
                  label="Sign Up Form"
                />
                <button
                  onClick={handleShowAllOptions}
                  className="rounded-full border border-gray-800 bg-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-300 transition-colors hover:bg-gray-800"
                >
                  More
                </button>
              </>
            ) : (
              <>
                <TemplateOption
                  icon={
                    <Camera size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="Clone a Screenshot"
                />
                <TemplateOption
                  icon={
                    <Figma size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="Import from Figma"
                />
                <TemplateOption
                  icon={
                    <LayoutDashboard
                      size={16}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  }
                  label="Landing Page"
                />
                <TemplateOption
                  icon={
                    <FormInput
                      size={16}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  }
                  label="Sign Up Form"
                />
                <TemplateOption
                  icon={
                    <ShoppingCart
                      size={16}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  }
                  label="E-commerce"
                />
                <TemplateOption
                  icon={
                    <Globe size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="Portfolio"
                />
                <TemplateOption
                  icon={
                    <Cloud size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="SaaS App"
                />
                <TemplateOption
                  icon={
                    <Sparkles size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="AI Tool"
                />
                <TemplateOption
                  icon={
                    <MessageSquare
                      size={16}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  }
                  label="Chat App"
                />
                <TemplateOption
                  icon={
                    <Newspaper
                      size={16}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  }
                  label="Blog"
                />
                <TemplateOption
                  icon={
                    <BarChart size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="Dashboard"
                />
                <TemplateOption
                  icon={
                    <Calendar size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="Calendar"
                />
                <TemplateOption
                  icon={
                    <Users size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  }
                  label="Team Page"
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Responsive Footer */}
      <footer className="py-4 sm:py-6">
        <div className="flex gap-1 flex-wrap justify-center items-center text-xs text-gray-500 px-4">
          <div className="flex items-center flex-wrap justify-center">
            <Link
              href="/pricing"
              className="hover:text-gray-300 transition-colors"
            >
              Pricing
            </Link>
            <span className="mx-1.5 text-gray-700">•</span>
            <Link
              href="/enterprise"
              className="hover:text-gray-300 transition-colors"
            >
              Enterprise
            </Link>
            <span className="mx-1.5 text-gray-700">•</span>
            <Link href="/docs" className="hover:text-gray-300 transition-colors">
              Docs
            </Link>
            <span className="mx-1.5 text-gray-700">•</span>
            <Link
              href="/legal"
              className="hover:text-gray-300 transition-colors"
            >
              Legal
            </Link>
            <span className="mx-1.5 text-gray-700">•</span>
            <Link
              href="/privacy"
              className="hover:text-gray-300 transition-colors"
            >
              Privacy
            </Link>
            <span className="mx-1.5 text-gray-700">•</span>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://discord.gg/jwT9PkQFsj"
              className="hover:text-gray-300 transition-colors"
            >
              Discord
            </Link>
            <span className="mx-1.5 text-gray-700">•</span>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/nextcrafter/craft.js"
              className="flex items-center hover:text-gray-300 transition-colors"
            >
              GitHub
              <ExternalLink size={10} className="ml-1" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TemplateOption({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-gray-800 bg-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-300 transition-colors hover:bg-gray-800">
      <div className="text-gray-400">{icon}</div>
      <span>{label}</span>
    </button>
  );
}
