'use client';

import { GitBranch, Bot, Settings, Plus, Zap } from "lucide-react";
import { GradientButton } from "./export-button";

export function GradientButtonExamples() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-semibold">Gemdesk Gradient Button Examples</h2>

      {/* Connect Repository */}
      <GradientButton onClick={() => alert('Connect repository clicked!')}>
        <GitBranch className="w-4 h-4 z-50" />
        <span className="text-[0.875rem] z-50">Connect Repository</span>
      </GradientButton>

      {/* Run Gem Agent */}
      <GradientButton onClick={() => console.log('Running Gem agent...')}>
        <Bot className="w-4 h-4 z-50" />
        <span className="text-[0.875rem] z-50">Run Gem Agent</span>
      </GradientButton>

      {/* Generate Docs */}
      <GradientButton onClick={() => console.log('Generating docs...')}>
        <Zap className="w-4 h-4 z-50" />
        <span className="text-[0.875rem] z-50">Generate Docs</span>
      </GradientButton>

      {/* Add Project */}
      <GradientButton onClick={() => console.log('Adding project...')}>
        <Plus className="w-4 h-4 z-50" />
        <span className="text-[0.875rem] z-50">Add Project</span>
      </GradientButton>

      {/* Disabled state */}
      <GradientButton disabled>
        <Settings className="w-4 h-4 z-50" />
        <span className="text-[0.875rem] z-50">Configure (Unavailable)</span>
      </GradientButton>
    </div>
  );
}