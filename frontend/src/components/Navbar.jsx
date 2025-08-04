import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import LogoutButton from "./LogoutButton";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const navLinks = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/stores", label: "Stores" },
  ],
  owner: [{ to: "/owner/dashboard", label: "Dashboard" }],
  user: [
    { to: "/stores", label: "Stores" },
    { to: "/profile", label: "Profile" },
  ],
};

const Navbar = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const links = user?.role ? navLinks[user.role] || [] : [];

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-indigo-700 text-xl"
        >
          <span className="bg-indigo-600 text-white px-2 py-1 rounded">SR</span>
          Store Rating
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-indigo-700 hover:text-indigo-900 font-semibold transition"
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-indigo-50 transition">
                <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                <span>{user.email}</span>
              </button>
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg py-2 px-4 hidden group-hover:block">
                <Link
                  to="/profile"
                  className="block py-1 text-indigo-700 hover:underline"
                >
                  Profile
                </Link>
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <XMarkIcon className="h-6 w-6 text-indigo-700" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-indigo-700" />
          )}
        </button>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block px-4 py-2 text-indigo-700 font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                to="/profile"
                className="block px-4 py-2 text-indigo-700"
                onClick={() => setMobileOpen(false)}
              >
                Profile
              </Link>
              <div className="px-4 py-2">
                <LogoutButton />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
