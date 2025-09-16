import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";

const AdminHeader: React.FC = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Safely get the username with proper typing
  const getUsername = (): string => {
    if (!user) return "Admin";

    // If username is a string, return it
    if (typeof user.username === "string") return user.username;

    // If username is an object, try to get the username property
    if (
      typeof user.username === "object" &&
      user.username !== null &&
      "username" in user.username
    ) {
      return (user.username as { username: string }).username;
    }
    return "Admin";
  };

  const getRole = (): string => {
    if (!user) return "Administrator";

    if (typeof user.role === "string") return user.role;

    if (
      typeof user.role === "object" &&
      user.role !== null &&
      "role" in user.role
    ) {
      return (user.role as { role: string }).role;
    }

    return "Administrator";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = getUsername();
  const displayRole = getRole();

  return (
    <header className="bg-semibackground dark:bg-semibackground shadow-md py-3 px-4 sm:px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mr-4 md:hidden text-gray-600 dark:text-gray-300"
          >
            <Menu size={24} />
          </button>
          <Link to="/atmin" className="flex items-center space-x-4">
            <img
              src="/logo.png"
              alt="logo_man3kp"
              className="w-12 h-12 text-accent"
            />
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              Admin Dashboard
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <User size={18} />
              </div>
              <span className="hidden md:block font-medium">{displayName}</span>
              <ChevronDown size={16} className="hidden md:block" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {displayRole}
                  </p>
                </div>
                <Link
                  to="/atmin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    Profile
                  </div>
                </Link>
                <Link
                  to="/atmin/settings"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <div className="flex items-center">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex items-center">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
