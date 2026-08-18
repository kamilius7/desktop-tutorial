import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  MessageCircle,
  ScanLine,
  User,
  Shield,
  Users,
  FolderOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/scanner', icon: ScanLine, label: 'Scanner' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminItems = [
  { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
  { to: '/admin/content', icon: FolderOpen, label: 'Manage Content' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-surface-card-dark border-r border-gray-100 dark:border-gray-800 shadow-sidebar z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-forest-700 dark:text-forest-400">
            StudyShare
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              active={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
            />
          ))}
        </div>

        {/* Admin section */}
        {user?.role === 'admin' && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Admin
              </p>
            )}
            <div className="space-y-1">
              {adminItems.map((item) => (
                <SidebarLink
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  active={location.pathname === item.to}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-gray-100 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}

function SidebarLink({ item, collapsed, active }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active
          ? 'bg-forest-50 text-forest-700 dark:bg-forest-900/40 dark:text-forest-300'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
      }`}
      title={collapsed ? item.label : undefined}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          active ? 'text-forest-600 dark:text-forest-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
        }`}
      />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}
