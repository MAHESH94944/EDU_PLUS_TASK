import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => setShowConfirm(true)}
      >
        Logout
      </button>
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="mb-4">Are you sure you want to logout?</p>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded mr-2"
              onClick={handleLogout}
            >
              Yes
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
