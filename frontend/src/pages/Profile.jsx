import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { StarIcon } from "@heroicons/react/24/solid";

const fetchRatedStores = async (token) => {
  const res = await axios.get("/api/user/stores", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.filter((s) => s.userRating);
};

const Profile = () => {
  const { token, user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const { data: ratedStores = [], isLoading } = useQuery({
    queryKey: ["rated-stores"],
    queryFn: () => fetchRatedStores(token),
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await axios.put(
        "/api/auth/password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Password updated!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error updating password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Profile</h2>
        <div className="mb-6">
          <div className="font-semibold">Name:</div>
          <div className="mb-2">{user?.name}</div>
          <div className="font-semibold">Email:</div>
          <div className="mb-2">{user?.email}</div>
          <div className="font-semibold">Address:</div>
          <div className="mb-2">{user?.address}</div>
        </div>
        <form onSubmit={handleChangePassword} className="mb-8 space-y-4">
          <h3 className="text-lg font-bold text-indigo-600 mb-2">
            Change Password
          </h3>
          <input
            type="password"
            placeholder="Old Password"
            className="w-full border p-2 rounded"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full border p-2 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            maxLength={16}
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded font-semibold"
          >
            Change Password
          </button>
          {msg && <div className="text-pink-600 mt-2">{msg}</div>}
        </form>
        <h3 className="text-lg font-bold text-indigo-600 mb-2">
          Stores You Rated
        </h3>
        {isLoading ? (
          <div className="text-indigo-600">Loading...</div>
        ) : ratedStores.length === 0 ? (
          <div className="text-gray-500">You haven't rated any stores yet.</div>
        ) : (
          <ul className="space-y-2">
            {ratedStores.map((store) => (
              <li key={store.id} className="flex items-center gap-2">
                <span className="font-semibold text-indigo-700">
                  {store.name}
                </span>
                <span className="text-gray-500">{store.address}</span>
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="font-bold">{store.userRating}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile;
