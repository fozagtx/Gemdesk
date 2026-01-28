"use client";

import { useState, useEffect } from 'react';
import { FileText, GitBranch, Zap, Info } from 'lucide-react';

export function DocumentationCard() {
  const [isTyping, setIsTyping] = useState(false);
  const [isDrafted, setIsDrafted] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Simulate typing animation
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    // Show drafted state
    const draftedTimer = setTimeout(() => {
      setIsTyping(false);
      setIsDrafted(true);
    }, 4000);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(draftedTimer);
    };
  }, []);

  const handlePublish = () => {
    // Simulate publish action
    console.log('Publishing draft...');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition(target.scrollTop);
  };

  return (
    <div className="w-full max-w-lg p-1 bg-white/15 backdrop-blur-[14px] rounded-lg border border-white/20 shadow-[0_10px_28px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
      {/* Main Card Content */}
      <div className="relative bg-[whitesmoke] rounded-lg overflow-hidden cursor-pointer">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-150 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/gem.png"
              alt="Gemdesk AI"
              className="w-7 h-7 object-contain rounded-full"
            />
            <span className="text-sm font-semibold text-gray-800">
              {isDrafted ? "I've drafted this article!" : isTyping ? "Generating documentation..." : "Gemdesk AI"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isDrafted && (
              <button
                onClick={handlePublish}
                className="h-9 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 active:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Publish draft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50 hover:scrollbar-thumb-gray-300"
        onScroll={handleScroll}
      >
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            How to integrate your GitHub repository with Gemdesk
          </h3>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              Our GitHub integration allows you to automatically sync your codebase documentation with Gemdesk's AI engine. This guide will walk you through the entire process, from basic setup to advanced automation.
            </p>

            {isTyping && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs font-medium">AI is writing documentation...</span>
              </div>
            )}

            {isDrafted && (
              <>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-800 text-xs leading-relaxed">
                      <span className="font-semibold">Pro tip:</span> Learn more about advanced integration options in our comprehensive API documentation. This includes webhook setup, custom triggers, and batch processing features.
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-base">Getting started</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Setup progress</span>
                      <span className="text-xs font-medium text-gray-800">Step 1 of 3</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-[#2567EC] to-[#37B6F7] rounded-full w-1/3 transition-all duration-500"></div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-gray-600">
                    <div className="p-3 bg-gray-50 border border-gray-100">
                      <h5 className="font-semibold text-gray-800 mb-2">Step 1: Repository Connection</h5>
                      <p>Connect your GitHub repository to Gemdesk by installing our GitHub App and granting the necessary permissions for repository access.</p>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-100">
                      <h5 className="font-semibold text-gray-800 mb-2">Step 2: Configuration</h5>
                      <p>Configure your documentation preferences, including file patterns, update frequency, and AI model settings for optimal results.</p>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-100">
                      <h5 className="font-semibold text-gray-800 mb-2">Step 3: Automation</h5>
                      <p>Set up automated triggers and webhooks to ensure your documentation stays synchronized with every code change and pull request.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-150">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3 h-3" />
            <span className="font-medium">Auto-synced from main branch</span>
          </div>
          {isDrafted && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-semibold">Ready to publish</span>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      {scrollPosition > 0 && (
        <div className="absolute top-2 right-2 w-1 h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-b from-[#2567EC] to-[#37B6F7] w-full rounded-full transition-all duration-200"
            style={{ height: `${Math.min(scrollPosition / 2, 100)}%` }}
          ></div>
        </div>
      )}
      </div>
    </div>
  );
}
