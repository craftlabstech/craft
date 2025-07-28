"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { ArrowRight, ImagePlus, Sparkles, X } from "lucide-react";

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

  // File attachment state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  // For image previews
  const [filePreviews, setFilePreviews] = useState<{ [key: number]: string }>(
    {}
  );
  // For file size error modal
  const [fileError, setFileError] = useState<string>("");
  const [showFileErrorModal, setShowFileErrorModal] = useState(false);
  const [promptValue, setPromptValue] = useState("");

  // Handle file selection (max 10 files, total 10MB limit, images only)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const maxTotalSize = 10 * 1024 * 1024; // 10MB total
      const maxFiles = 10;

      // Combine existing and new files
      const allFiles = [...attachedFiles, ...newFiles];

      const validFiles: File[] = [];
      const previews: { [key: number]: string } = { ...filePreviews };
      let rejectedSize = false;
      let rejectedCount = false;
      let nonImageRejected = false;
      let totalSize = 0;

      // First, check for non-image files
      const imageFiles = allFiles.filter((file) => {
        if (!file.type.startsWith("image/")) {
          nonImageRejected = true;
          return false;
        }
        return true;
      });

      // Check file count limit
      if (imageFiles.length > maxFiles) {
        rejectedCount = true;
      }

      // Add files up to the limit and check total size
      for (let i = 0; i < Math.min(imageFiles.length, maxFiles); i++) {
        const file = imageFiles[i];
        if (totalSize + file.size <= maxTotalSize) {
          validFiles.push(file);
          totalSize += file.size;

          // Create preview for new files only
          if (!attachedFiles.includes(file)) {
            const url = URL.createObjectURL(file);
            previews[validFiles.length - 1] = url;
          }
        } else {
          rejectedSize = true;
        }
      }

      // Generate appropriate error messages
      let errorMessage = "";
      if (nonImageRejected && rejectedSize && rejectedCount) {
        errorMessage =
          "Some files were not attached because only images are allowed, you can only attach up to 10 files, and the total size cannot exceed 10MB.";
      } else if (nonImageRejected && rejectedSize) {
        errorMessage =
          "Some files were not attached because only images are allowed and the total size cannot exceed 10MB.";
      } else if (nonImageRejected && rejectedCount) {
        errorMessage =
          "Some files were not attached because only images are allowed and you can only attach up to 10 files.";
      } else if (rejectedSize && rejectedCount) {
        errorMessage =
          "Some files were not attached because you can only attach up to 10 files and the total size cannot exceed 10MB.";
      } else if (nonImageRejected) {
        errorMessage =
          "Some files were not attached because only images are allowed.";
      } else if (rejectedSize) {
        errorMessage =
          "Some files were not attached because the total size would exceed 10MB.";
      } else if (rejectedCount) {
        errorMessage =
          "Some files were not attached because you can only attach up to 10 files.";
      }

      if (errorMessage) {
        setFileError(errorMessage);
        setShowFileErrorModal(true);
      } else {
        setFileError("");
        setShowFileErrorModal(false);
      }

      setAttachedFiles(validFiles);
      setFilePreviews(previews);
    }
  };

  // Remove attached file
  const handleRemoveFile = (idx: number) => {
    setAttachedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== idx);
      return newFiles;
    });
    setFilePreviews((prev) => {
      const newPreviews = { ...prev };

      // Revoke the URL for the removed file
      if (newPreviews[idx]) {
        URL.revokeObjectURL(newPreviews[idx]);
      }

      // Re-index previews by shifting indices down
      const reIndexed: { [key: number]: string } = {};
      let newIndex = 0;

      Object.keys(newPreviews).forEach((key) => {
        const oldIndex = Number(key);
        if (oldIndex !== idx) {
          if (oldIndex > idx) {
            reIndexed[newIndex] = newPreviews[oldIndex];
          } else {
            reIndexed[newIndex] = newPreviews[oldIndex];
          }
          newIndex++;
        }
      });

      return reIndexed;
    });
  };

  // Calculate total file size for display
  const getTotalFileSize = () => {
    return attachedFiles.reduce((total, file) => total + file.size, 0);
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Handle textarea change
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptValue(e.target.value);
    autoResize();
  };

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
    <div className="w-full mx-auto flex flex-col items-center justify-center flex-1 px-0 sm:px-4 lg:px-6 xl:px-8 relative">
      {/* Content */}
      <div className="relative z-10 w-full -mt-14">
        {/* Main Heading */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight tracking-tighter max-w-3xl mx-auto">
            What can I help you craft?
          </h1>
        </div>

        {/* Input Container */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative">
            <div
              className={`relative flex flex-col gap-2 p-3 rounded-3xl bg-neutral-900/80 border backdrop-blur-sm transition-colors ${
                isFocused ? "border-neutral-700" : "border-neutral-800"
              }`}
            >
              {/* Show attached file previews (image only with hover remove button) */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-3 px-0 py-1">
                  {attachedFiles.map((file, idx) => {
                    return (
                      <div
                        key={idx}
                        className="relative group"
                        title={file.name}
                      >
                        {/* Preview Image */}
                        <img
                          src={filePreviews[idx]}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded-lg border border-white/10 transition-all duration-200 group-hover:border-white/20"
                        />
                        {/* Remove button - appears on hover */}
                        <button
                          type="button"
                          aria-label="Remove file"
                          className="absolute -top-2 -right-2 w-4 h-4 bg-neutral-100 text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                          onClick={() => handleRemoveFile(idx)}
                          tabIndex={0}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* File size error modal */}
              {showFileErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
                  <div className="bg-neutral-900 border border-neutral-700/40 rounded-xl shadow-xl px-8 py-6 max-w-xl w-full flex flex-col items-center relative">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-white p-1 rounded hover:bg-red-700/30 transition-colors"
                      aria-label="Close error dialog"
                      onClick={() => setShowFileErrorModal(false)}
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M6 6l8 8M6 14L14 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <div className="flex items-center mb-3">
                      <svg
                        width="28"
                        height="28"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="text-red-400 mr-2"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="12"
                          fill="#7f1d1d"
                          fillOpacity="0.18"
                        />
                        <path
                          d="M12 8v4m0 4h.01"
                          stroke="#f87171"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-lg font-semibold text-red-300">
                        File Upload Error
                      </span>
                    </div>
                    <div className="text-sm text-red-200 text-center mb-2">
                      {fileError}
                    </div>
                    <div className="text-xs text-gray-400 text-center">
                      Please select image files only (JPEG, PNG, GIF, WebP,
                      etc.). You can attach up to 10 images with a total size
                      limit of 10MB.
                    </div>
                    <button
                      className="mt-5 px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition-colors"
                      onClick={() => setShowFileErrorModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <textarea
                ref={textareaRef}
                placeholder={`Ask me to craft ${typedPrompt}${
                  typing ? "|" : ""
                }`}
                className="w-full bg-transparent py-2 px-2 text-white placeholder-neutral-400 focus:outline-none text-base min-h-[80px] max-h-[300px] overflow-y-auto resize-none rounded-xl transition-colors"
                value={promptValue}
                onInput={autoResize}
                onChange={handlePromptChange}
                aria-label="Ask me to craft"
                autoComplete="off"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              <div className="flex flex-row justify-between items-center gap-2 ">
                {/* File Attach Button */}
                <div className="flex items-center gap-2">
                  {/* Attach File */}
                  <label
                    htmlFor="file-upload"
                    className="gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/20 hover:bg-blue-900/20 border border-neutral-800 hover:border-blue-900/20 text-neutral-400 hover:text-neutral-200 cursor-pointer transition-colors duration-200 text-sm flex items-center"
                    aria-label="Attach File"
                    style={{ lineHeight: 1 }}
                  >
                    <span className="inline-flex items-center justify-center">
                      <ImagePlus size={16} />
                    </span>
                    <span className="text-sm font-medium">Attach</span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {/* Model Selector & Submit */}
                <div className="flex items-center gap-2">
                  {/* Model Selector - Bottom Right */}
                  <div className="" data-dropdown>
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/20 hover:bg-blue-900/20 border border-neutral-800 hover:border-blue-900/20 text-neutral-400 hover:text-neutral-200"
                        aria-label="Select AI Model"
                      >
                        {/* AI Icon (sparkle style, similar to file icon) */}
                        <span className="inline-flex items-center justify-center">
                          <Sparkles size={16} />
                        </span>
                        <span className="text-sm font-medium">
                          {getSelectedModelDetails().name}
                        </span>
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
                          <div className="relative bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[60vh] flex flex-col overflow-hidden">
                            <button
                              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded hover:bg-red-700/30 transition-colors"
                              aria-label="Close model selection"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg
                                width="20"
                                height="20"
                                fill="none"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  d="M6 6l8 8M6 14L14 6"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <div className="py-6 px-4 overflow-y-auto minimal-scrollbar">
                              <h2 className="text-lg font-bold text-white mb-4 text-center">
                                Select AI Model
                              </h2>
                              {/* Hide scrollbar arrows for all .minimal-scrollbar elements: now in globals.css */}
                              {Object.entries(modelCategories).map(
                                ([categoryKey, category], idx, arr) => (
                                  <div key={categoryKey} className="mb-4">
                                    <div className="px-1 pb-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
                                      {category.label}
                                    </div>
                                    {category.models.map((model) => (
                                      <button
                                        key={model.id}
                                        onClick={() =>
                                          handleModelSelect(model.id)
                                        }
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 group mb-2
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
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Submit */}
                  <button
                    className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center
                      ${
                        promptValue.trim() || attachedFiles.length > 0
                          ? "bg-white border border-white text-neutral-900 hover:bg-neutral-200 cursor-pointer"
                          : "bg-neutral-800 border border-neutral-700 text-white opacity-60"
                      }
                    `}
                    aria-label="Submit"
                    disabled={!(promptValue.trim() || attachedFiles.length > 0)}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Model Selection Hint */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-xs text-neutral-500">Open Source</span>
              <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
              <span className="text-xs text-neutral-500">Model Agnostic</span>
              <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
              <span className="text-xs text-neutral-500">Pay Per Use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
