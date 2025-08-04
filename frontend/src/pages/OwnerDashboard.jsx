import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";

const fetchStats = async (token) => {
  const statsRes = await axios.get("/api/store-owner/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const ratingsRes = await axios.get("/api/store-owner/ratings", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    stats: statsRes.data,
    ratings: ratingsRes.data,
  };
};

const OwnerDashboard = () => {
  const { token, user } = useAuth();

  // Only allow store_owner
  if (!token || user?.role !== "owner") {
    return <Navigate to="/login" />;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["owner-dashboard"],
    queryFn: () => fetchStats(token),
  });

  // Aggregate stats
  const avgRating = data?.stats?.[0]?.avgRating
    ? Number(data.stats[0].avgRating).toFixed(2)
    : "-";
  const totalRatings = data?.stats?.[0]?.totalRatings || 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)", padding: "3em 1em" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#4f46e5", marginBottom: "2em", textAlign: "center" }}>
          Owner Dashboard
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2em", marginBottom: "2em" }}>
          <div className="card" style={{ flex: 1, minWidth: 250, textAlign: "center" }}>
            <div style={{ fontWeight: "bold", color: "#555", marginBottom: "0.5em" }}>
              Average Rating
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5em" }}>
              <StarIcon style={{ height: 32, width: 32, color: "#facc15" }} />
              <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{avgRating}</span>
            </div>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 250, textAlign: "center" }}>
            <div style={{ fontWeight: "bold", color: "#555", marginBottom: "0.5em" }}>
              Total Ratings
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4f46e5" }}>
              {totalRatings}
            </span>
          </div>
        </div>
        <h2 style={{ fontWeight: "bold", color: "#4f46e5", marginBottom: "1em" }}>
          Users Who Rated Your Store
        </h2>
        <div className="card" style={{ padding: "1em" }}>
          {isLoading ? (
            <div style={{ color: "#4f46e5" }}>Loading...</div>
          ) : error ? (
            <div className="error">Error loading data.</div>
          ) : data?.ratings?.length === 0 ? (
            <div style={{ color: "#555" }}>No ratings yet.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.ratings.map((r) => (
                  <tr key={r.userId + "-" + r.storeId + "-" + r.createdAt}>
                    <td>{r.userName}</td>
                    <td>{r.userEmail}</td>
                    <td style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                      <StarIcon style={{ height: 20, width: 20, color: "#facc15" }} />
                      <span style={{ fontWeight: "bold" }}>{r.rating}</span>
                    </td>
                    <td style={{ color: "#555" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
