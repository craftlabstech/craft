"use client";

import React, { type ReactNode } from "react";

import { useState, useRef, useEffect, useCallback, memo } from "react";
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
  Sun,
  Moon,
  Monitor,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [showAllOptions, setShowAllOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const { data: session } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  const handleShowAllOptions = useCallback(() => {
    setShowAllOptions(true);
  }, []);

  const handleThemeChange = useCallback(
    (newTheme: "system" | "light" | "dark") => {
      setTheme(newTheme);
      // TODO: Implement actual theme switching logic here
    },
    []
  );

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

  // Optimized click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };

    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [settingsOpen]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleSignIn = useCallback(() => {
    signIn("google", { redirectTo: "/" });
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  const toggleSettings = useCallback(() => {
    setSettingsOpen(!settingsOpen);
  }, [settingsOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header - always visible, full width from left corner */}
      <header className="fixed top-0 z-50 w-full bg-black">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-baseline">
                <span className="tracking-wider font-knewave text-xl sm:text-2xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Craft
                </span>
                <span className="text-white">.</span>
                <span className="tracking-normal text-xs font-medium text-white">
                  JS
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {session ? (
              /* User profile in header when logged in */
              <div
                className="flex items-center cursor-pointer relative"
                onClick={toggleSettings}
                ref={settingsRef}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSettings();
                  }
                }}
                aria-label="Open user settings"
              >
                <NextImage
                  src={
                    imageError
                      ? "/default-avatar.svg"
                      : session.user?.image || "/default-avatar.svg"
                  }
                  alt="Profile picture"
                  width={32}
                  height={32}
                  className="rounded-full hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                  onError={handleImageError}
                  priority
                />

                {/* Settings popup */}
                {settingsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-10">
                    {/* User profile info */}
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center">
                        <NextImage
                          src={
                            imageError
                              ? "/default-avatar.svg"
                              : session.user?.image || "/default-avatar.svg"
                          }
                          alt="Profile picture"
                          width={40}
                          height={40}
                          className="rounded-full mr-3"
                          onError={handleImageError}
                        />
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-white truncate">
                            {session.user?.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {session.user?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1 divide-y divide-gray-700">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="py-1">
                        <div className="px-3 py-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Theme
                          </p>
                          <div
                            className="mt-2 flex space-x-2"
                            role="group"
                            aria-label="Theme options"
                          >
                            <button
                              onClick={() => handleThemeChange("system")}
                              className={`p-1.5 rounded-md transition-colors ${
                                theme === "system"
                                  ? "bg-purple-600"
                                  : "bg-gray-700 hover:bg-gray-600"
                              }`}
                              aria-label="System theme"
                            >
                              <Monitor className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleThemeChange("light")}
                              className={`p-1.5 rounded-md transition-colors ${
                                theme === "light"
                                  ? "bg-purple-600"
                                  : "bg-gray-700 hover:bg-gray-600"
                              }`}
                              aria-label="Light theme"
                            >
                              <Sun className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleThemeChange("dark")}
                              className={`p-1.5 rounded-md transition-colors ${
                                theme === "dark"
                                  ? "bg-purple-600"
                                  : "bg-gray-700 hover:bg-gray-600"
                              }`}
                              aria-label="Dark theme"
                            >
                              <Moon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="px-3 py-2">
                          <label
                            htmlFor="language-select"
                            className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                          >
                            Language
                          </label>
                          <div className="mt-2">
                            <select
                              id="language-select"
                              className="text-sm bg-gray-700 border border-gray-600 rounded-md py-1 px-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                              defaultValue="en"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sign in button in header when not logged in */
              <button
                onClick={handleSignIn}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main container - sidebar removed */}
      <div className="flex flex-1 pt-14 sm:pt-16">
        {/* Sidebar component removed */}

        {/* Main content - removed left padding since sidebar is gone */}
        <main
          className={`flex flex-col flex-1 items-center justify-center px-4 pb-8 ${
            session ? "" : "pt-0"
          }`}
        >
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
              <TemplateOptions
                showAll={showAllOptions}
                onShowAll={handleShowAllOptions}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Responsive Footer - removed left padding */}
      <Footer />
    </div>
  );
}

const Footer = memo(function Footer() {
  const footerLinks = [
    { href: "/about", label: "About" },
    { href: "/docs", label: "Docs" },
    { href: "https://craftlabs.tech/terms", label: "Legal", external: true },
    {
      href: "https://craftlabs.tech/privacy",
      label: "Privacy",
      external: true,
    },
    { href: "https://discord.gg/jwT9PkQFsj", label: "Discord", external: true },
    { href: "https://x.com/craftjs_dev", label: "X", external: true },
    {
      href: "https://github.com/sudheerdotai/craft.js",
      label: "GitHub",
      external: true,
      icon: true,
    },
  ];

  return (
    <footer className="py-4 sm:py-6">
      <div className="flex gap-1 flex-wrap justify-center items-center text-xs text-gray-500 px-4">
        <div className="flex items-center flex-wrap justify-center">
          {footerLinks.map((link, index) => (
            <React.Fragment key={link.href}>
              <Link
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                href={link.href}
                className="hover:text-gray-300 transition-colors flex items-center"
              >
                {link.label}
                {link.icon && <ExternalLink size={10} className="ml-1" />}
              </Link>
              {index < footerLinks.length - 1 && (
                <span className="mx-1.5 text-gray-700">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
});

const TemplateOptions = memo(function TemplateOptions({
  showAll,
  onShowAll,
}: {
  showAll: boolean;
  onShowAll: () => void;
}) {
  const baseOptions = [
    {
      icon: <Camera size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Clone a Screenshot",
    },
    {
      icon: <Figma size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Import from Figma",
    },
    {
      icon: <LayoutDashboard size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Landing Page",
    },
    {
      icon: <FormInput size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Sign Up Form",
    },
  ];

  const extraOptions = [
    {
      icon: <ShoppingCart size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "E-commerce",
    },
    {
      icon: <Globe size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Portfolio",
    },
    {
      icon: <Cloud size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "SaaS App",
    },
    {
      icon: <Sparkles size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "AI Tool",
    },
    {
      icon: <MessageSquare size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Chat App",
    },
    {
      icon: <Newspaper size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Blog",
    },
    {
      icon: <BarChart size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Dashboard",
    },
    {
      icon: <Calendar size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Calendar",
    },
    {
      icon: <Users size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Team Page",
    },
  ];

  const allOptions = [...baseOptions, ...extraOptions];

  return (
    <>
      {(showAll ? allOptions : baseOptions).map((option, index) => (
        <TemplateOption
          key={`${option.label}-${index}`}
          icon={option.icon}
          label={option.label}
        />
      ))}
      {!showAll && (
        <button
          onClick={onShowAll}
          className="rounded-full border border-gray-800 bg-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-300 transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Show more template options"
        >
          More
        </button>
      )}
    </>
  );
});

const TemplateOption = memo(function TemplateOption({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-gray-800 bg-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-300 transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
      aria-label={`Create ${label.toLowerCase()}`}
    >
      <div className="text-gray-400">{icon}</div>
      <span>{label}</span>
    </button>
  );
});
