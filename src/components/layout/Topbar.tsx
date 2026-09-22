import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, Bell, User, Menu, ChevronDown, Sun, Moon, LogOut } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

export function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notificationItems = [
    { id: 1, title: "New lead added", time: "2m ago", read: false },
    { id: 2, title: "Email campaign sent", time: "15m ago", read: false },
    { id: 3, title: "Payment received", time: "1h ago", read: true },
    { id: 4, title: "Calendar event: Team sync", time: "3h ago", read: true },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/10",
      isMobile ? "lg:hidden" : "lg:pl-64"
    )}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}
          
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 size-4" />
            <input
              type="search"
              placeholder="Search CEO GPS…"
              className="w-64 lg:w-80 h-9 pl-10 pr-4 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 focus:bg-white/10"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Right: Notifications, Theme, User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                {notificationItems.filter(n => !n.read).length}
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 glass rounded-xl border border-white/10 p-2 shadow-lg">
                <div className="flex items-center justify-between px-2 py-2 border-b border-white/10">
                  <h3 className="font-medium text-sm">Notifications</h3>
                  <span className="text-[10px] text-white/40">{notificationItems.filter(n => !n.read).length} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notificationItems.map(n => (
                    <button
                      key={n.id}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-lg text-left text-sm hover:bg-white/5 transition-colors",
                        !n.read && "bg-primary/5"
                      )}
                    >
                      <p className={cn("font-medium", !n.read && "text-white")}>{n.title}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{n.time}</p>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-white/10">
                  <Link to="/notifications" className="text-sm text-primary hover:underline block text-center">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle - placeholder */}
          <button className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10" aria-label="Toggle theme">
            <Sun size={20} />
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <span className="hidden md:block text-sm font-medium">Cagednreality</span>
              <ChevronDown size={14} className="text-white/40" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-white/10 shadow-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-sm font-medium">Cagednreality</p>
                  <p className="text-[11px] text-white/40">chris@ceogps.com</p>
                </div>
                <Link to="/settings" className="block px-3 py-2 text-sm text-white/80 hover:bg-white/5">
                  Settings
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-sm text-white/80 hover:bg-white/5">
                  Profile
                </Link>
                <hr className="border-white/10 mx-2 my-1" />
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}