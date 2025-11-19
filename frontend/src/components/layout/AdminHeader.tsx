/**
 * @fileoverview Admin header component with navigation and user profile functionality.
 * This component provides a responsive header for the admin interface with a logo,
 * notification indicator, theme toggle, and user profile dropdown. It adapts its
 * appearance based on scroll position and includes a mobile menu for smaller screens.
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, User, LogOut, Menu, ChevronDown, X } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Admin header component with navigation and user profile functionality.
 * Provides a responsive header with logo, notifications, theme toggle, and user profile dropdown.
 * Adapts appearance based on scroll position and includes a mobile menu.
 *
 * @returns {JSX.Element} The rendered admin header
 */
const AdminHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

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

  /**
   * Gets the username from the user context or returns a default value
   * @returns {string} The username to display
   */
  const getUsername = (): string => {
    if (!user) return "Admin";
    return user.username || "Admin";
  };

  /**
   * Gets the user role from the user context or returns a default value
   * @returns {string} The user role to display
   */
  const getRole = (): string => {
    if (!user) return "Administrator";
    return user.role || "Administrator";
  };

  /**
   * Gets the user avatar URL from the user context
   * @returns {string | null} The avatar URL or null if not available
   */
  const getUserAvatar = (): string | null => {
    if (!user || !user.avatar) return null;
    return user.avatar;
  };

  /**
   * Handles user logout by calling the logout function and navigating to login
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = getUsername();
  const displayRole = getRole();
  const userAvatar = getUserAvatar();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[rgb(var(--color-background))] shadow-md py-2 opacity-95 backdrop-blur-md"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mr-4 md:hidden text-secondary hover:text-foreground transition-colors"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/atmin" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="Logo MAN 3 KP"
              className="w-12 h-12 text-accent"
            />
          </Link>
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          <button
            className="relative p-1 text-secondary hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error" />
          </button>

          <ThemeToggle />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-1 font-medium text-foreground hover:text-accent transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-[rgb(var(--color-secondary-button))] flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-secondary" />
                )}
              </div>
              <span className="hidden md:block">{displayName}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 card shadow-xl z-50">
                <div className="px-4 py-2 border-b border-[rgb(var(--color-secondary-button),0.3)] flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-[rgb(var(--color-secondary-button))] flex items-center justify-center overflow-hidden">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {displayName}
                    </p>
                    <p className="text-xs text-secondary">{displayRole}</p>
                  </div>
                </div>

                <Link
                  to="/atmin/userProfile"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-[rgb(var(--color-secondary-button),0.5)] transition-colors"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <div className="flex items-center">
                    <User size={16} className="mr-2" /> Profile
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-[rgb(var(--color-secondary-button),0.5)] transition-colors"
                >
                  <div className="flex items-center">
                    <LogOut size={16} className="mr-2" /> Logout
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden card shadow-lg mt-2">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <div className="flex items-center space-x-3 p-2 border-b border-[rgb(var(--color-secondary-button),0.3)]">
              <div className="h-12 w-12 rounded-full bg-[rgb(var(--color-secondary-button))] flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-secondary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-secondary">{displayRole}</p>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center justify-between w-full p-2 text-left text-foreground"
              >
                <div className="flex items-center space-x-2">
                  <User size={18} />
                  <span>Profile</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="pl-6 mt-1 space-y-1">
                  <Link
                    to="/atmin/userProfile"
                    className="block py-2 px-4 text-sm text-foreground hover:bg-[rgb(var(--color-secondary-button),0.5)] rounded transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 px-4 text-sm text-foreground hover:bg-[rgb(var(--color-secondary-button),0.5)] rounded transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
