"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { ArrowRight, ImagePlus, Sparkles, X } from "lucide-react";
import Image from "next/image";

// Model configuration
const modelOptions = [
  {
    id: "best",
    name: "Best",
    description: "Automatically selects the best model for your task",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    description: "High-performance model with exceptional reasoning",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Most powerful with enhanced coding and reasoning",
  },
];

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

      // Clean up old preview URLs before setting new ones
      Object.values(filePreviews).forEach((url) => {
        URL.revokeObjectURL(url);
      });

      // Create new previews for all valid files
      const newPreviews: { [key: number]: string } = {};
      validFiles.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        newPreviews[index] = url;
      });

      setAttachedFiles(validFiles);
      setFilePreviews(newPreviews);

      // Reset the file input to allow re-selecting the same file
      e.target.value = "";
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
          reIndexed[newIndex] = newPreviews[oldIndex];
          newIndex++;
        }
      });

      return reIndexed;
    });
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
    const model = modelOptions.find((m) => m.id === selectedModel);
    return model || modelOptions[0];
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

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      // Clean up all preview URLs when component unmounts
      Object.values(filePreviews).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [filePreviews]);

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
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-foreground leading-tight tracking-tighter max-w-3xl mx-auto">
            What can I help you craft?
          </h1>
        </div>

        {/* Input Container */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative">
            <div
              className={`relative flex flex-col gap-2 p-3 rounded-3xl bg-card/80 border backdrop-blur-sm transition-colors ${
                isFocused ? "border-border" : "border-border/50"
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
                        <Image
                          src={filePreviews[idx]}
                          alt={file.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-xl border border-border/20 transition-all duration-200 group-hover:border-border/40"
                        />
                        {/* Remove button - appears on hover */}
                        <button
                          type="button"
                          aria-label="Remove file"
                          className="absolute -top-2 -right-2 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 animate-fade-in">
                  <div className="bg-popover border border-border rounded-xl shadow-xl px-8 py-6 max-w-xl w-full flex flex-col items-center relative">
                    <button
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded hover:bg-destructive/30 transition-colors"
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
                        className="text-destructive mr-2"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="12"
                          fill="hsl(var(--destructive))"
                          fillOpacity="0.18"
                        />
                        <path
                          d="M12 8v4m0 4h.01"
                          stroke="hsl(var(--destructive))"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-lg font-semibold text-destructive">
                        File Upload Error
                      </span>
                    </div>
                    <div className="text-sm text-destructive text-center mb-2">
                      {fileError}
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Please select image files only (JPEG, PNG, GIF, WebP,
                      etc.). You can attach up to 10 images with a total size
                      limit of 10MB.
                    </div>
                    <button
                      className="mt-5 px-4 py-2 rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold transition-colors"
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
                className="w-full bg-transparent py-2 px-2 text-foreground placeholder-muted-foreground focus:outline-none text-base min-h-[80px] max-h-[300px] overflow-y-auto resize-none rounded-xl transition-colors"
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
                    className="gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border hover:border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200 text-sm flex items-center"
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
                  <div className="relative" data-dropdown>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border hover:border-border text-muted-foreground hover:text-foreground"
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

                    {/* Simple Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute bottom-full mb-2 right-0 dropdown-menu w-64 py-2 z-[60]">
                        {modelOptions.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className={`w-full text-left px-4 py-3 dropdown-item flex items-center gap-3 group transition-colors duration-200
                              ${selectedModel === model.id ? "selected" : ""}
                            `}
                          >
                            <div className="flex flex-col flex-1">
                              <span className="text-sm font-semibold">
                                {model.name}
                              </span>
                              <span className="dropdown-item-description text-xs mt-0.5">
                                {model.description}
                              </span>
                            </div>
                            {selectedModel === model.id && (
                              <svg
                                className="w-4 h-4 dropdown-checkmark ml-1 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
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
                      </div>
                    )}
                  </div>
                  {/* Submit */}
                  <button
                    className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center
                      ${
                        promptValue.trim() || attachedFiles.length > 0
                          ? "bg-primary border border-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                          : "bg-muted border border-border text-muted-foreground opacity-60"
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
              <span className="text-xs text-muted-foreground">Open Source</span>
              <div className="w-1 h-1 bg-current rounded-full text-muted-foreground inline-block align-middle"></div>
              <span className="text-xs text-muted-foreground">
                Model Agnostic
              </span>
              <div className="w-1 h-1 bg-current rounded-full text-muted-foreground inline-block align-middle"></div>
              <span className="text-xs text-muted-foreground">Pay Per Use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
