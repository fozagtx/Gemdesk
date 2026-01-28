"use client";

import { Button } from "../../src/components/ui/button";
import { GradientButton } from "../../src/components/ui/export-button";
import { DocumentationCard } from "./DocumentationCard";
import { ArrowRight, GitBranch } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <div className="min-h-[calc(100svh-4.5rem)] flex items-center px-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero Text */}
          <div className="order-1 lg:order-1 text-center lg:text-left">
            <div className="inline-block font-bold tracking-tighter text-4xl md:text-5xl lg:text-6xl mb-6">
              <h1 className="text-gray-900">AI-Native</h1>
              <div className="relative">
                <span className="bg-gradient-to-r from-[#2567EC] to-[#37B6F7] bg-clip-text text-transparent">
                  Documentation
                </span>
              </div>
            </div>

            <p className="text-base sm:text-xl text-gray-600 font-light tracking-wide max-w-xl mb-8 mx-auto lg:mx-0">
              Autonomous documentation that keeps itself up-to-date with Gemini 3.0.
              Connect your repositories and let AI handle the rest.
            </p>

            <div className="flex gap-4 justify-center lg:justify-start items-center flex-wrap mb-12">
              <Link href="/dashboard">
                <GradientButton className="px-8 py-4 w-64 h-14">
                  <span className="text-base font-semibold z-50 whitespace-nowrap flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Start Building
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </GradientButton>
              </Link>

              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-48"
                >
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="w-10 h-10 mx-auto lg:mx-0 mb-3 bg-gradient-to-br from-[#2567EC] to-[#37B6F7] rounded-xl flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">GitHub Integration</h3>
                <p className="text-xs text-gray-600">Connect repositories and sync automatically</p>
              </div>

              <div className="text-center lg:text-left">
                <div className="w-10 h-10 mx-auto lg:mx-0 mb-3 bg-gradient-to-br from-[#2567EC] to-[#37B6F7] rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">AI-Powered</h3>
                <p className="text-xs text-gray-600">Gemini 3.0 analyzes and updates docs</p>
              </div>

              <div className="text-center lg:text-left">
                <div className="w-10 h-10 mx-auto lg:mx-0 mb-3 bg-gradient-to-br from-[#2567EC] to-[#37B6F7] rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Auto-Sync</h3>
                <p className="text-xs text-gray-600">Documentation updates with code changes</p>
              </div>
            </div>
          </div>

          {/* Right side - Documentation Card */}
          <div className="order-2 lg:order-2 flex justify-center lg:justify-end relative">
            {/* Background Image */}
            <div
              className="absolute bg-cover bg-center bg-no-repeat opacity-90"
              style={{
                backgroundImage: 'url(/cardOn.png)',
                width: 'calc(100% + 4rem)',
                height: 'calc(100% + 4rem)',
                top: '-2rem',
                left: '-2rem'
              }}
            />
            {/* Documentation Card */}
            <div className="relative z-10">
              <DocumentationCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}