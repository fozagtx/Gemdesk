"use client";

import { useEffect, useState, type ReactElement } from 'react';
import { GitBranch, FileText, Zap } from 'lucide-react';

interface Cursor {
  id: string;
  x: number;
  y: number;
  user: string;
  color: string;
  action: string;
  icon: ReactElement;
  isAI: boolean;
}

export function CursorEffects() {
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const teamMembers = [
      {
        name: "Alex",
        color: "#3B82F6",
        action: "Pushing to main",
        icon: <GitBranch className="w-3 h-3" />,
        isAI: false
      },
      {
        name: "Sam",
        color: "#10B981",
        action: "Adding features",
        icon: <GitBranch className="w-3 h-3" />,
        isAI: false
      },
      {
        name: "Jordan",
        color: "#F59E0B",
        action: "Code review",
        icon: <GitBranch className="w-3 h-3" />,
        isAI: false
      }
    ];

    const aiAgents = [
      {
        name: "Gemdesk AI",
        color: "#8B5CF6",
        action: "Updating docs",
        icon: <FileText className="w-3 h-3" />,
        isAI: true
      },
      {
        name: "Gem Agent",
        color: "#6366F1",
        action: "Auto-sync docs",
        icon: <Zap className="w-3 h-3" />,
        isAI: true
      }
    ];

    let cursorId = 0;
    let currentSequenceIndex = 0;

    const createCursor = (userConfig: any) => {
      const newCursor: Cursor = {
        id: `cursor-${cursorId++}`,
        x: Math.random() * (window.innerWidth - 250) + 50,
        y: Math.random() * (window.innerHeight - 300) + 150,
        user: userConfig.name,
        color: userConfig.color,
        action: userConfig.action,
        icon: userConfig.icon,
        isAI: userConfig.isAI
      };

      setCursors(prev => {
        // Only add if we have less than 3 cursors
        if (prev.length >= 3) return prev;
        return [...prev, newCursor];
      });

      // Slower, smoother movement for better UX
      const moveInterval = setInterval(() => {
        setCursors(prev => prev.map(cursor => {
          if (cursor.id === newCursor.id) {
            return {
              ...cursor,
              x: Math.max(50, Math.min(cursor.x + (Math.random() - 0.5) * 60, window.innerWidth - 250)),
              y: Math.max(150, Math.min(cursor.y + (Math.random() - 0.5) * 40, window.innerHeight - 200))
            };
          }
          return cursor;
        }));
      }, 2500);

      // Remove cursor after duration - instant removal, no fade
      const duration = userConfig.isAI ? 8000 : 6000;
      setTimeout(() => {
        clearInterval(moveInterval);
        setCursors(prev => prev.filter(c => c.id !== newCursor.id));
      }, duration);
    };

    const runSequence = () => {
      setCursors(current => {
        // Don't add if we already have 3 cursors
        if (current.length >= 3) return current;

        if (currentSequenceIndex < teamMembers.length) {
          // Add team member
          createCursor(teamMembers[currentSequenceIndex]);
          currentSequenceIndex++;
        } else {
          // After all team members, add AI agent
          const aiAgent = aiAgents[Math.floor(Math.random() * aiAgents.length)];
          createCursor(aiAgent);

          // Reset sequence after showing AI
          currentSequenceIndex = 0;
        }

        return current;
      });
    };

    // Start the sequence
    const startSequence = () => {
      runSequence();

      // Continue creating cursors at intervals
      const interval = setInterval(() => {
        runSequence();
      }, 5000);

      return interval;
    };

    // Initial delay then start
    const initialTimeout = setTimeout(() => {
      const intervalId = startSequence();

      // Store the interval ID for cleanup
      return () => {
        clearTimeout(initialTimeout);
        clearInterval(intervalId);
      };
    }, 1000);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute transition-all duration-1500 ease-in-out"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        >
          {/* Cursor */}
          <div
            className="relative"
            style={{ color: cursor.color }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="drop-shadow-md"
            >
              <path d="M8.5 2L3 7.5 21 21 12.5 12.5z"/>
            </svg>

            {/* User label */}
            <div
              className="absolute top-5 left-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap shadow-lg"
              style={{
                backgroundColor: cursor.color,
                animation: cursor.isAI ? 'pulse 2s infinite' : 'none'
              }}
            >
              <div className="flex items-center gap-1.5">
                {cursor.icon}
                <span>{cursor.user}</span>
              </div>
              <div className="text-xs opacity-95 font-medium">{cursor.action}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}