import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTasks: number;
}

export function Sidebar({ activeTasks }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt', current: location === '/' },
    { name: 'Tasks', href: '/tasks', icon: 'fas fa-tasks', current: location === '/tasks', badge: activeTasks },
    { name: 'Repositories', href: '/repositories', icon: 'fab fa-github', current: location === '/repositories' },
    { name: 'Pull Requests', href: '/pull-requests', icon: 'fas fa-code-branch', current: location === '/pull-requests' },
    { name: 'History', href: '/history', icon: 'fas fa-history', current: location === '/history' },
    { name: 'Settings', href: '/settings', icon: 'fas fa-cog', current: location === '/settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
      </Button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-0 left-0 z-40 h-full
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-300 ease-in-out
      `}>
        {/* Logo and Brand */}
        <div className="p-4 lg:p-6 border-b border-gray-200 mt-16 lg:mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Open SWE</h1>
              <p className="text-xs text-gray-500">AI Coding Agent</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                      item.current
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`${item.icon} w-4`}></i>
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-gray-600"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Demo User</p>
              <p className="text-xs text-gray-500 truncate">demo@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
