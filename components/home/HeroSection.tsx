"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

// Model configuration
const modelCategories = {
  recommended: {
    label: "Recommended",
    models: [
      {
        id: "best",
        name: "Best",
        description: "Automatically selects the best model for your task",
      },
    ],
  },
  anthropic: {
    label: "Anthropic (Claude)",
    models: [
      {
        id: "claude-opus-4",
        name: "Claude Opus 4",
        description: "Most capable model - superior reasoning and coding",
      },
      {
        id: "claude-sonnet-4",
        name: "Claude Sonnet 4",
        description: "High-performance model with exceptional reasoning",
      },
      {
        id: "claude-3.7-sonnet",
        name: "Claude 3.7 Sonnet",
        description: "Extended thinking capabilities for complex coding",
      },
      {
        id: "claude-3.5-haiku",
        name: "Claude 3.5 Haiku",
        description: "Fastest model for quick coding tasks",
      },
    ],
  },
  openai: {
    label: "OpenAI",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Latest multimodal model with coding expertise",
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        description: "Highly capable model for advanced coding and reasoning",
      },
      {
        id: "o1-pro",
        name: "o1 Pro",
        description: "Advanced reasoning for complex programming problems",
      },
      {
        id: "o1",
        name: "o1",
        description: "Powerful reasoning model for coding challenges",
      },
    ],
  },
  google: {
    label: "Google (Gemini)",
    models: [
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "Most powerful with enhanced coding and reasoning",
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "Best price-performance with adaptive thinking",
      },
    ],
  },
  opensource: {
    label: "Open Source",
    models: [
      {
        id: "qwen-2.5-coder-32b",
        name: "Qwen 2.5 Coder 32B",
        description: "State-of-the-art open source coding model",
      },
      {
        id: "deepseek-v3",
        name: "DeepSeek V3",
        description: "Advanced coding and reasoning capabilities",
      },
      {
        id: "llama-3.3-70b",
        name: "Llama 3.3 70B",
        description: "Meta's latest instruction-tuned model",
      },
    ],
  },
};

export default function HeroSection() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedModel, setSelectedModel] = useState("best");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Animated prompt suggestions
  const promptSuggestions = [
    "a web app that...",
    "a landing page for...",
    "an AI chatbot that...",
    "a portfolio site for...",
    "a SaaS dashboard that...",
    "a blog platform for...",
    "an e-commerce store that...",
    "a mobile app for...",
  ];
  const [promptIndex, setPromptIndex] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [typing, setTyping] = useState(true);
  // Focus indicator state
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;
    let isDeleting = false;
    setTypedPrompt("");
    setTyping(true);

    function typewriter() {
      const currentPrompt = promptSuggestions[promptIndex];
      if (!isDeleting) {
        if (charIndex <= currentPrompt.length) {
          setTypedPrompt(currentPrompt.slice(0, charIndex));
          charIndex++;
          timeout = setTimeout(typewriter, 40);
        } else {
          setTyping(false);
          timeout = setTimeout(() => {
            isDeleting = true;
            setTyping(true);
            typewriter();
          }, 1200);
        }
      } else {
        if (charIndex >= 0) {
          setTypedPrompt(currentPrompt.slice(0, charIndex));
          charIndex--;
          if (charIndex >= 0) {
            timeout = setTimeout(typewriter, 24);
          } else {
            setTyping(true);
            setPromptIndex((prev) => (prev + 1) % promptSuggestions.length);
          }
        }
      }
    }
    typewriter();
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptIndex]);

  // Auto-resize function - optimized with useCallback
  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate new height (capped by CSS max-height)
    const newHeight = Math.min(textarea.scrollHeight, 300); // Increased max height to 300px
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Get selected model details
  const getSelectedModelDetails = () => {
    for (const category of Object.values(modelCategories)) {
      const model = category.models.find((m) => m.id === selectedModel);
      if (model) return model;
    }
    return modelCategories.recommended.models[0];
  };

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsDropdownOpen(false);
  };

  // Initialize height on component mount
  useEffect(() => {
    if (textareaRef.current) {
      // Set initial height based on default content (if any)
      autoResize();
    }
  }, [autoResize]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest("[data-dropdown]")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="w-full mx-auto flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight tracking-tighter max-w-3xl mx-auto">
            What can I help you craft?
          </h1>
        </div>

        {/* Input Container */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative">
            <div
              className={`relative rounded-xl bg-neutral-900/80 border backdrop-blur-sm transition-colors ${
                isFocused ? "border-neutral-700" : "border-white/10"
              } pb-12`}
            >
              <textarea
                ref={textareaRef}
                placeholder={`Ask me to craft ${typedPrompt}${
                  typing ? "|" : ""
                }`}
                className="w-full bg-transparent py-4 px-4 pr-14 text-white placeholder-gray-400 focus:outline-none text-base min-h-[80px] max-h-[300px] overflow-y-auto resize-none rounded-xl transition-colors"
                onInput={autoResize}
                onChange={autoResize}
                aria-label="Ask me to craft"
                autoComplete="off"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              {/* Model Selector - Bottom Left */}
              <div className="absolute left-3 bottom-3" data-dropdown>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/90 border border-white/10 rounded-md hover:bg-neutral-700/80 transition-colors"
                    aria-label="Select AI Model"
                  >
                    <span className="text-white text-xs font-medium">
                      {getSelectedModelDetails().name}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-gray-400 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute bottom-full left-0 mb-2 w-80 bg-neutral-900 border border-white/10 rounded-2xl shadow-xl z-50 max-h-80 overflow-hidden animate-dropdown minimal-scrollbar"
                      style={{
                        transition: "opacity 0.2s, transform 0.2s",
                        opacity: 1,
                        transform: "translateY(0)",
                      }}
                    >
                      {/* Hide scrollbar arrows for all .minimal-scrollbar elements */}
                      <style>{`
                        .minimal-scrollbar::-webkit-scrollbar-button {
                          display: none !important;
                          height: 0 !important;
                        }
                        .minimal-scrollbar {
                          scrollbar-width: thin;
                          scrollbar-color: #444 #222;
                        }
                      `}</style>
                      <div className="max-h-80 overflow-y-auto rounded-2xl minimal-scrollbar">
                        {Object.entries(modelCategories).map(
                          ([categoryKey, category], idx, arr) => (
                            <div key={categoryKey} className="px-3 pt-3 pb-2">
                              <div className="px-1 pb-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
                                {category.label}
                              </div>
                              {category.models.map((model) => (
                                <button
                                  key={model.id}
                                  onClick={() => handleModelSelect(model.id)}
                                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 group
                                  ${
                                    selectedModel === model.id
                                      ? "bg-neutral-800 border border-neutral-600 shadow-sm ring-1 ring-neutral-500/20"
                                      : "hover:bg-neutral-800/70 hover:scale-[1.01] active:bg-neutral-700/80 border border-transparent"
                                  }
                                `}
                                >
                                  <div className="flex flex-col flex-1">
                                    <span
                                      className={`text-base font-semibold ${
                                        selectedModel === model.id
                                          ? "text-neutral-100"
                                          : "text-white"
                                      }`}
                                    >
                                      {model.name}
                                    </span>
                                    <span className="text-gray-400 text-xs mt-0.5">
                                      {model.description}
                                    </span>
                                  </div>
                                  {selectedModel === model.id && (
                                    <svg
                                      className="w-5 h-5 text-neutral-300 ml-1"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </button>
                              ))}
                              {idx < arr.length - 1 && (
                                <div className="my-3 mx-1 border-t border-white/10" />
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="absolute right-3 bottom-3 p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                aria-label="Submit"
              >
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Model Selection Hint */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-xs text-gray-500">Open Source</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="text-xs text-gray-500">Model Agnostic</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="text-xs text-gray-500">Pay Per Use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
