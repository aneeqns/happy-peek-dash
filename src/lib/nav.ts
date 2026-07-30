import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Building2,
  DollarSign,
  FileText,
  Gauge,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Megaphone,
  Newspaper,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { Role } from "@/lib/auth";

export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Minimum role required to see AND open the route. */
  requires: Role;
};

export const customerNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requires: "customer" },
  { to: "/markets", label: "Markets", icon: Globe2, requires: "customer" },
  { to: "/portfolio", label: "Portfolio", icon: Wallet, requires: "customer" },
  { to: "/watchlist", label: "Watchlist", icon: Star, requires: "customer" },
  { to: "/news", label: "News", icon: Newspaper, requires: "customer" },
  { to: "/assistant", label: "AI Assistant", icon: Bot, requires: "customer" },
  { to: "/coach", label: "AI Investment Coach", icon: GraduationCap, requires: "customer" },
  { to: "/analytics", label: "Analytics", icon: LineChart, requires: "customer" },
  { to: "/profile", label: "Profile", icon: User, requires: "customer" },
  { to: "/settings", label: "Settings", icon: Settings, requires: "customer" },
];

export const creatorNav: NavItem[] = [
  { to: "/creator", label: "Creator Dashboard", icon: Gauge, requires: "creator" },
  { to: "/creator/users", label: "User Management", icon: Users, requires: "creator" },
  { to: "/creator/content", label: "Content Management", icon: FileText, requires: "creator" },
  { to: "/creator/stocks", label: "Stock Management", icon: Building2, requires: "creator" },
  { to: "/creator/announcements", label: "Announcements", icon: Megaphone, requires: "creator" },
  { to: "/creator/ai", label: "AI Management", icon: Sparkles, requires: "creator" },
  { to: "/creator/revenue", label: "Revenue", icon: DollarSign, requires: "creator" },
  { to: "/creator/analytics", label: "Platform Analytics", icon: BarChart3, requires: "creator" },
  { to: "/creator/audit", label: "Audit Logs", icon: ShieldCheck, requires: "creator" },
  { to: "/creator/settings", label: "Admin Settings", icon: Activity, requires: "creator" },
];

export const alertsNav: NavItem = { to: "/alerts", label: "Smart Alerts", icon: Bell, requires: "customer" };
