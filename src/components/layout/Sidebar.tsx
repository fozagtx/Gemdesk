'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Settings,
  Building2,
  Wrench,
  Inbox,
  Layers3,
  MessageCircle
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  badge?: string;
}

interface SidebarProps {
  organizationName?: string;
  organizationImage?: string;
  userName?: string;
  userImage?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Folder,
  }
];

const gemSection: NavigationItem[] = [
  {
    title: 'Audits',
    href: '/audits',
    icon: Wrench,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: Inbox,
  }
];

const workspaceSection: NavigationItem[] = [
  {
    title: 'Integrations',
    href: '/integrations',
    icon: Layers3,
  }
];

const productSection: NavigationItem[] = [
  {
    title: 'Get help',
    href: '/get-help',
    icon: MessageCircle,
  },
  {
    title: 'Changelog',
    href: '/changelog',
    icon: Building2,
  }
];

export function Sidebar({ organizationName = "Gemdesk", organizationImage, userName, userImage }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const isActiveItem = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.title);
    const isActive = isActiveItem(item.href);

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-9 px-3 text-sm font-normal",
              "hover:bg-gray-100",
              level > 0 && "pl-8"
            )}
            onClick={() => toggleSection(item.title)}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          {isExpanded && (
            <div className="ml-4 space-y-1">
              {item.children?.map((child) => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    if (item.href) {
      return (
        <Link key={item.title} href={item.href}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-8 px-2 text-sm font-normal rounded-md",
              isActive
                ? "bg-gray-100 text-gray-900"
                : "hover:bg-gray-50 text-gray-700",
              level > 0 && "pl-6"
            )}
          >
            <div className="flex items-center space-x-2 flex-1">
              <item.icon className={cn(
                "h-4 w-4",
                isActive ? "text-gray-700" : "text-gray-500"
              )} />
              <span className={cn(
                "text-sm",
                isActive ? "text-gray-900 font-medium" : "text-gray-700"
              )}>
                {item.title}
              </span>
            </div>
            {item.badge && (
              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </Button>
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Organization Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Gemdesk</h2>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-2 space-y-1">
          {/* Main Navigation */}
          {navigationItems.map((item) => renderNavigationItem(item))}

          {/* Gem Section */}
          <div className="pt-4">
            <div className="px-3 py-1">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Gem
              </h3>
            </div>
            {gemSection.map((item) => renderNavigationItem(item))}
          </div>

          {/* Workspace Section */}
          <div className="pt-4">
            <div className="px-3 py-1">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Workspace
              </h3>
            </div>
            {workspaceSection.map((item) => renderNavigationItem(item))}
          </div>

          {/* Product Section */}
          <div className="pt-4">
            <div className="px-3 py-1">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Product
              </h3>
            </div>
            {productSection.map((item) => renderNavigationItem(item))}
          </div>
        </nav>
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              {userName ? userName.slice(0, 2).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {userName || 'User'}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}