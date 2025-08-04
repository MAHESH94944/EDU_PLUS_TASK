import React, { useState, useEffect } from "react";
import "./AdminStores.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const fetchStores = async ({ token, page, filters }) => {
  const params = { page, limit: 10, ...filters };
  const res = await axios.get("/api/admin/stores", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
};

const fetchOwners = async (token) => {
  const res = await axios.get("/api/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
    params: { role: "owner" },
  });
  return res.data.users || [];
};

const fetchStoreRating = async (storeId, token) => {
  const res = await axios.get(`/api/admin/stores/${storeId}/rating`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.rating || null;
};

const AdminStores = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  if (!token || user?.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [modal, setModal] = useState({ open: false, mode: "add", store: null });
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  // Fetch owners for dropdown
  useEffect(() => {
    fetchOwners(token).then(setOwners);
  }, [token]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stores", page, filters],
    queryFn: () => fetchStores({ token, page, filters }),
  });

  // Add/Edit/Delete mutations
  const addStoreMutation = useMutation({
    mutationFn: async (newStore) =>
      axios.post("/api/admin/stores", newStore, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-stores"]);
      setModal({ open: false, mode: "add", store: null });
    },
  });

  const editStoreMutation = useMutation({
    mutationFn: async (editStore) =>
      axios.put(`/api/admin/stores/${editStore.id}`, editStore, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-stores"]);
      setModal({ open: false, mode: "add", store: null });
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id) =>
      axios.delete(`/api/admin/stores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-stores"]);
    },
  });

  // Modal open for add/edit
  const openModal = (mode, store = null) => {
    setModal({ open: true, mode, store });
    if (store) {
      setForm({
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
      });
    } else {
      setForm({
        name: "",
        email: "",
        address: "",
        ownerId: owners[0]?.id || "",
      });
    }
  };

  // Modal form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.mode === "add") {
      addStoreMutation.mutate(form);
    } else if (modal.mode === "edit") {
      editStoreMutation.mutate({ ...form, id: modal.store.id });
    }
  };

  // Table columns
  const columns = [
    { label: "Store Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Address", key: "address" },
    { label: "Rating", key: "rating" },
    { label: "Actions", key: "actions" },
  ];

  // Get average rating for each store (optional: can be optimized)
  const getRating = (store) => {
    if (typeof store.rating !== "undefined") return store.rating;
    return store.avgRating || "-";
  };

  return (
    <div className="admin-stores-container">
      <div className="admin-stores-main">
        <div className="admin-stores-header">
          <h1 className="admin-stores-title">Store Management</h1>
          <button
            className="admin-stores-add-btn"
            onClick={() => openModal("add")}
          >
            Add Store
          </button>
        </div>
        <div className="admin-stores-filters">
          <input
            type="text"
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Search by address"
            value={filters.address}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          />
        </div>
        <div>
          <table className="admin-stores-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "700",
                      color: "#4f46e5",
                      textTransform: "uppercase",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      fontSize: "1rem",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#dc2626",
                      fontSize: "1rem",
                    }}
                  >
                    Error loading stores.
                  </td>
                </tr>
              ) : (
                data?.stores?.map((store) => (
                  <tr
                    key={store.id}
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <td style={{ padding: "0.75rem" }}>{store.name}</td>
                    <td style={{ padding: "0.75rem" }}>{store.email}</td>
                    <td style={{ padding: "0.75rem" }}>{store.address}</td>
                    <td style={{ padding: "0.75rem" }}>{getRating(store)}</td>
                    <td
                      style={{
                        padding: "0.75rem",
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        style={{
                          backgroundColor: "#6b46c1",
                          color: "white",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          transition: "background-color 0.2s",
                        }}
                        onClick={() => openModal("edit", store)}
                      >
                        <PencilIcon style={{ height: "1rem", width: "1rem" }} />
                        Edit
                      </button>
                      <button
                        style={{
                          backgroundColor: "#f56565",
                          color: "white",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          transition: "background-color 0.2s",
                        }}
                        onClick={() => deleteStoreMutation.mutate(store.id)}
                      >
                        <TrashIcon style={{ height: "1rem", width: "1rem" }} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              backgroundColor: "#4f46e5",
              color: "white",
              fontWeight: "600",
              opacity: page === 1 ? 0.5 : 1,
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span style={{ fontWeight: "700", color: "#4f46e5" }}>
            Page {page}
          </span>
          <button
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              backgroundColor: "#4f46e5",
              color: "white",
              fontWeight: "600",
              opacity: data && page * 10 >= data.total ? 0.5 : 1,
              cursor:
                data && page * 10 >= data.total ? "not-allowed" : "pointer",
            }}
            disabled={data && page * 10 >= data.total}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {/* Modal */}
      {modal.open && (
        <div className="admin-stores-modal-bg">
          <form
            className="admin-stores-modal"
            onSubmit={handleSubmit}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#4f46e5",
                marginBottom: "1rem",
              }}
            >
              {modal.mode === "add" ? "Add Store" : "Edit Store"}
            </h3>
            <input
              type="text"
              placeholder="Store Name"
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                marginBottom: "1rem",
              }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={100}
            />
            <input
              type="email"
              placeholder="Email"
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                marginBottom: "1rem",
              }}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Address"
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                marginBottom: "1rem",
              }}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              maxLength={400}
              required
            />
            <select
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                marginBottom: "1rem",
              }}
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              required
            >
              <option value="">Select Owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "0.5rem",
                  borderRadius: "0.375rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.2s",
                  cursor:
                    addStoreMutation.isLoading || editStoreMutation.isLoading
                      ? "not-allowed"
                      : "pointer",
                }}
                disabled={
                  addStoreMutation.isLoading || editStoreMutation.isLoading
                }
              >
                {modal.mode === "add"
                  ? addStoreMutation.isLoading
                    ? "Adding..."
                    : "Add"
                  : editStoreMutation.isLoading
                  ? "Saving..."
                  : "Save"}
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  backgroundColor: "#e2e8f0",
                  padding: "0.5rem",
                  borderRadius: "0.375rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setModal({ open: false, mode: "add", store: null })
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
    

export default AdminStores;
