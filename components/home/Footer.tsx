"use client";

import React, { memo } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";

const Footer = memo(function Footer() {
  return (
    <footer className="w-full bg-neutral-900/90 backdrop-blur-md border-t border-white/10">
      <div className="px-4 sm:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 sm:mt-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-1">
              <NextImage
                src="/craft-logo.svg"
                alt="Craft Logo"
                width={40}
                height={40}
                className="w-7 h-7"
              />
              <span className="text-white font-semibold text-xl tracking-tight">
                Craft
              </span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              Effortlessly craft websites and apps by chatting with AI. Model
              agnostic, open source, and pay-per-use.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://github.com/sudheerdotai/craft.js"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-neutral-800/60 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="mailto:support@craftjs.dev"
                aria-label="Email"
                className="w-9 h-9 rounded-lg bg-neutral-800/60 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="16" x="2" y="4" rx="4" />
                  <path d="m6 8 6 4 6-4" />
                </svg>
              </a>
              <a
                href="https://x.com/craftjs_dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-9 h-9 rounded-lg bg-neutral-800/60 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/eaDJ4Hus7w"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="w-9 h-9 rounded-lg bg-neutral-800/60 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-white font-medium text-sm">Product</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/sudheerdotai/craft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  GitHub
                  <ExternalLink className="w-4 h-4 opacity-60" />
                </a>
              </li>
              <li>
                <Link
                  href="/showcase"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Showcase
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-white font-medium text-sm">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/docs"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-white font-medium text-sm">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://craftlabs.tech/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="https://craftlabs.tech/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-neutral-400">
          <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              &copy; {new Date().getFullYear()}
              <a
                href="https://craftlabs.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Craft Labs.
              </a>
              All rights reserved.
            </div>
          </div>
          {/* <span className="hidden sm:inline-block text-neutral-600">•</span> */}
          <span className="text-neutral-500">
            Crafted with <span className="text-red-400">♥</span> for builders
          </span>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
