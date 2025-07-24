"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Settings,
  LogOut,
  User,
  Monitor,
  Sun,
  Moon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [imageError, setImageError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleThemeChange = useCallback(
    (newTheme: "system" | "light" | "dark") => {
      setTheme(newTheme);
      // TODO: Implement actual theme switching logic here
    },
    []
  );

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

  // Scroll detection for header background
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-gray-950/60 backdrop-blur-3xl"
          : "bg-transparent"
      }`}
    >
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-0">
            <NextImage
              src="/craft-logo.svg"
              alt="Craft.JS Logo"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-bold text-white">
                Craft
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Options */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link
            href="https://discord.gg/eaDJ4Hus7w"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium hover:bg-white/5 px-3 py-2 rounded-lg"
          >
            Community
          </Link>
          <Link
            href="/docs"
            className="text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium hover:bg-white/5 px-3 py-2 rounded-lg"
          >
            Docs
          </Link>
          <Link
            href="/showcase"
            className="text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium hover:bg-white/5 px-3 py-2 rounded-lg"
          >
            Showcase
          </Link>
          <Link
            href="https://github.com/sudheerdotai/craftjs-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium flex items-center gap-1 hover:bg-white/5 px-3 py-2 rounded-lg"
          >
            GitHub
            <ExternalLink className="w-4 h-4 opacity-60" />
          </Link>
        </nav>

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
                <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md rounded-md shadow-2xl border border-gray-700/50 z-10">
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
              className="rounded-lg bg-white px-4 py-1.5 text-md font-semibold text-black transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:scale-105 shadow-lg"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
