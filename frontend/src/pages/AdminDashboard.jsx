import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { Navigate, Link } from "react-router-dom";
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import "./AdminDashboard.css";

const fetchStats = async (token) => {
  const res = await axios.get("/api/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const AdminDashboard = () => {
  const { token, user } = useAuth();

  // Only allow admin
  if (!token || user?.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchStats(token),
  });

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-main">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        <div className="admin-dashboard-cards">
          <StatsCard
            title="Total Users"
            value={isLoading ? "..." : data?.users}
            icon={
              <UserGroupIcon
                style={{ height: 32, width: 32, color: "#4f46e5" }}
              />
            }
          />
          <StatsCard
            title="Total Stores"
            value={isLoading ? "..." : data?.stores}
            icon={
              <BuildingStorefrontIcon
                style={{ height: 32, width: 32, color: "#a78bfa" }}
              />
            }
          />
          <StatsCard
            title="Total Ratings"
            value={isLoading ? "..." : data?.ratings}
            icon={
              <StarIcon style={{ height: 32, width: 32, color: "#f472b6" }} />
            }
          />
        </div>
        <div className="admin-dashboard-links">
          <Link to="/admin/users" className="admin-dashboard-link">
            Manage Users
          </Link>
          <Link to="/admin/stores" className="admin-dashboard-link">
            Manage Stores
          </Link>
        </div>
        {error && (
          <div className="error">Error loading dashboard stats.</div>
        )}
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon }) => (
  <div
    className="card"
    style={{ flex: 1, minWidth: 200, textAlign: "center" }}
  >
    <div style={{ marginBottom: "0.5em" }}>{icon}</div>
    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</div>
    <div style={{ color: "#555", marginTop: "0.5em" }}>{title}</div>
  </div>
);

export default AdminDashboard;
