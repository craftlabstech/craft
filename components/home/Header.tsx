"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Settings, LogOut, User, Monitor, Sun, Moon } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "../theme-provider";

export default function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleThemeChange = useCallback(
    (newTheme: "system" | "light" | "dark") => {
      setTheme(newTheme);
    },
    [setTheme]
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
      className={`fixed top-0 z-50 w-full transition-all duration-300 border-b border-border ${
        isScrolled ? "bg-background/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="flex h-12 sm:h-14 items-center justify-between px-2 sm:px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg sm:text-2xl font-roboto tracking-wider font-medium text-foreground">
              Craft
            </span>
            <span className="px-3 py-0.5 rounded-full border border-border text-xs font-light text-muted-foreground uppercase tracking-wider align-middle">
              Beta
            </span>
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
                className="rounded-full hover:ring-2 hover:ring-ring transition-all duration-200"
                onError={handleImageError}
                priority
              />

              {/* Settings popup */}
              {settingsOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-popover backdrop-blur-md rounded-md shadow-2xl border border-border z-10">
                  {/* User profile info */}
                  <div className="p-4 border-b border-border">
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
                        <p className="text-sm font-medium text-popover-foreground truncate">
                          {session.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1 divide-y divide-border">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </div>

                    <div className="py-1">
                      <div className="px-3 py-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-accent"
                            }`}
                            aria-label="System theme"
                          >
                            <Monitor className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleThemeChange("light")}
                            className={`p-1.5 rounded-md transition-colors ${
                              theme === "light"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-accent"
                            }`}
                            aria-label="Light theme"
                          >
                            <Sun className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleThemeChange("dark")}
                            className={`p-1.5 rounded-md transition-colors ${
                              theme === "dark"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-accent"
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
                          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                        >
                          Language
                        </label>
                        <div className="mt-2">
                          <select
                            id="language-select"
                            className="text-sm bg-secondary border border-border rounded-md py-1 px-2 w-full focus:outline-none focus:ring-2 focus:ring-ring"
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
                        className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
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
              className="text-xs text-center sm:text-sm rounded-full bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition-all duration-200 hover:opacity-90 focus:outline-none shadow-lg cursor-pointer"
            >
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
