import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Thermometer, 
  PawPrint, 
  Calendar, 
  Bell, 
  Settings, 
  BarChart3, 
  Droplet,
  TreeDeciduous,
  Turtle,
  CheckSquare
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: "Enclosures",
    href: "/enclosures",
    icon: <TreeDeciduous className="w-5 h-5" />,
  },
  {
    label: "Animals",
    href: "/animals",
    icon: <Turtle className="w-5 h-5" />,
  },
  {
    label: "Data & Analytics",
    href: "/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: <CheckSquare className="w-5 h-5" />,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="w-5 h-5" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function SideNav() {
  const location = useLocation();
  
  return (
    <nav className="w-full md:w-64 h-full flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-reptile-500 to-reptile-400 flex items-center justify-center text-white">
          <Droplet className="w-4 h-4" />
        </div>
        <span className="text-lg font-semibold">ReptileNurture</span>
      </div>
      
      <div className="mt-6 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "nav-link",
              location.pathname === item.href && "nav-link-active"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-auto p-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">System Status</span>
            <span className="flex items-center text-xs text-reptile-500">
              <span className="w-2 h-2 rounded-full bg-reptile-500 mr-1.5 animate-pulse-slow"></span>
              Online
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            All controllers connected and reporting data.
          </div>
        </div>
      </div>
    </nav>
  );
}
