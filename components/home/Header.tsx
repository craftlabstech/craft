"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Settings,
  LogOut,
  User,
  Monitor,
  Sun,
  Moon,
  LayoutGrid,
  Search,
  SquarePen,
  Clock,
  X,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "../theme-provider";

export default function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleThemeChange = useCallback(
    (newTheme: "system" | "light" | "dark") => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  const cycleTheme = useCallback(() => {
    const themes = ["system", "light", "dark"] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme, setTheme]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  const toggleSettings = useCallback(() => {
    setSettingsOpen(!settingsOpen);
  }, [settingsOpen]);

  const toggleSearch = useCallback(() => {
    setSearchOpen(!searchOpen);
  }, [searchOpen]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Handle search logic here
        console.log("Searching for:", searchQuery);
        setSearchOpen(false);
      }
    },
    [searchQuery]
  );

  // Mock data for recent chats - replace with actual data
  interface RecentChat {
    id: string | number;
    title: string;
    project: string;
    date: string;
  }

  const recentChats: RecentChat[] = [
    // {
    //   id: 1,
    //   title: "Website Design Discussion",
    //   project: "E-commerce Project",
    //   date: "2025-08-12",
    // },
    // {
    //   id: 2,
    //   title: "API Integration Chat",
    //   project: "Mobile App",
    //   date: "2025-08-11",
    // },
    // {
    //   id: 3,
    //   title: "Database Schema Review",
    //   project: "Analytics Dashboard",
    //   date: "2025-08-10",
    // },
  ];

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
      // For search dialog, we handle click outside via the backdrop div
    };

    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [settingsOpen]);

  // Prevent body scroll when search modal is open and handle outside clicks
  useEffect(() => {
    if (searchOpen) {
      // Prevent body scroll
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        // Restore body scroll
        document.body.style.overflow = originalStyle;
      };
    }
  }, [searchOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (searchOpen) {
          setSearchOpen(false);
        }
        if (settingsOpen) {
          setSettingsOpen(false);
        }
      }
      // Cmd/Ctrl + K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen, settingsOpen]);

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 border-b border-border ${
          isScrolled ? "bg-background/80 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="flex h-12 sm:h-14 items-center justify-between px-2 sm:px-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg sm:text-2xl font-roboto tracking-tight font-semibold text-foreground">
                Craft
              </span>
              <span className="px-2 py-0.5 rounded-full border border-border text-xs font-light text-muted-foreground uppercase tracking-wider">
                Beta
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {session ? (
              /* Navigation items and user profile when logged in */
              <>
                {/* New Chat button */}
                <Link href="/chat">
                  <button
                    className="flex items-center justify-center p-2.5 rounded-full border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground hover:border-ring/50 focus:outline-none transition-all duration-200 shadow-sm"
                    aria-label="New Chat"
                    title="Start New Chat"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                  </button>
                </Link>

                {/* Search button */}
                <button
                  onClick={toggleSearch}
                  className="flex items-center justify-center p-2.5 rounded-full border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground hover:border-ring/50 focus:outline-none transition-all duration-200 shadow-sm"
                  aria-label="Search"
                  title="Search"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>

                {/* Projects button */}
                <Link
                  href="/projects"
                  className="flex items-center justify-center p-2.5 rounded-full border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground hover:border-ring/50 focus:outline-none transition-all duration-200 shadow-sm"
                  aria-label="Projects"
                  title="Projects"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Link>

                {/* User profile dropdown */}
                <div
                  className="flex items-center rounded-full border border-border cursor-pointer relative"
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
                                className={`p-1.5 rounded-md transition-colors border-2 ${
                                  theme === "system"
                                    ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                    : "bg-muted/50 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                                }`}
                                aria-label="System theme"
                              >
                                <Monitor className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleThemeChange("light")}
                                className={`p-1.5 rounded-md transition-colors border-2 ${
                                  theme === "light"
                                    ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                    : "bg-muted/50 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                                }`}
                                aria-label="Light theme"
                              >
                                <Sun className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleThemeChange("dark")}
                                className={`p-1.5 rounded-md transition-colors border-2 ${
                                  theme === "dark"
                                    ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                    : "bg-muted/50 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
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
                                className="text-sm bg-muted border border-border rounded-md py-1 px-2 w-full focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
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
              </>
            ) : (
              /* Theme switcher and auth buttons when not logged in */
              <>
                {/* Single theme toggle button */}
                <button
                  onClick={cycleTheme}
                  className="p-1.5 rounded-full transition-colors border border-transparent bg-muted/50 hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground"
                  aria-label={`Current theme: ${theme}. Click to switch theme`}
                  title={`Current: ${
                    theme.charAt(0).toUpperCase() + theme.slice(1)
                  } theme`}
                >
                  {theme === "system" && (
                    <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  {theme === "light" && (
                    <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  {theme === "dark" && (
                    <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </button>

                {/* Sign in button - outlined style */}
                <Link href="/auth/signin">
                  <button className="text-xs text-center sm:text-sm rounded-full border border-border text-foreground hover:bg-muted hover:text-foreground hover:border-border px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition-all duration-200 focus:outline-none cursor-pointer">
                    <span>Sign in</span>
                  </button>
                </Link>

                {/* Sign up button - filled style */}
                <Link href="/auth/signup">
                  <button className="text-xs text-center sm:text-sm rounded-full bg-primary text-primary-foreground border border-primary hover:bg-primary/90 hover:border-primary/80 px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition-all duration-200 focus:outline-none cursor-pointer">
                    <span>Sign up</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Minimalist Search Dialog Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            overflowY: "hidden",
            touchAction: "none",
          }}
        >
          {/* Backdrop with proper event handling */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              toggleSearch();
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />

          {/* Dialog */}
          <div
            ref={searchRef}
            className="relative w-full max-w-xl mx-4 bg-background/95 backdrop-blur-xl rounded-xl shadow-lg border border-border/50 animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ maxHeight: "70vh" }}
          >
            {/* Search Input - Clean and minimal */}
            <div className="p-4">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-muted/30 border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-muted-foreground/20 focus:border-border/50 text-foreground placeholder:text-muted-foreground/60 text-sm transition-all duration-200"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-muted/50 transition-colors"
                    aria-label="Close search"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Actions - Simplified */}
            <div className="px-4 pb-2">
              <div className="space-y-1">
                <Link href="/chat">
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left group"
                    onClick={() => {
                      setSearchOpen(false);
                    }}
                  >
                    <SquarePen className="h-4 w-4 text-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm text-foreground group-hover:text-foreground transition-colors">
                      New Chat
                    </span>
                  </button>
                </Link>
                <Link href="/chat/history">
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left group"
                    onClick={() => {
                      setSearchOpen(false);
                    }}
                  >
                    <Clock className="h-4 w-4 text-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm text-foreground group-hover:text-foreground transition-colors">
                      All Recent Chats
                    </span>
                  </button>
                </Link>
                <Link href="/projects">
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left group"
                    onClick={() => {
                      // Handle projects action
                      console.log("All projects");
                      setSearchOpen(false);
                    }}
                  >
                    <LayoutGrid className="h-4 w-4 text-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm text-foreground group-hover:text-foreground transition-colors">
                      Projects
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Recent Chats - Clean list */}
            <div className="px-4 pb-4">
              <div className="border-t border-border/20 pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Recent
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/20 scrollbar-track-transparent">
                  {recentChats.length > 0 ? (
                    <div className="space-y-1">
                      {recentChats.map((chat) => (
                        <button
                          key={chat.id}
                          className="w-full p-3 rounded-lg hover:bg-muted/30 transition-colors text-left group"
                          onClick={() => {
                            // Handle chat selection
                            console.log("Open chat:", chat.id);
                            setSearchOpen(false);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors truncate">
                                {chat.title}
                              </p>
                              <p className="text-xs text-foreground/70 mt-0.5 truncate">
                                {chat.project}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground/60 ml-3 flex-shrink-0 mt-0.5">
                              {new Date(chat.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <SquarePen className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground/70">
                        No recent chats
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        Start a conversation to see it here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
