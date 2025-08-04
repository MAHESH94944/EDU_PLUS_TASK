import React, { useState } from "react";
import "./AdminUsers.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Modal,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const fetchUsers = async ({ token, page, filters }) => {
  const params = { page, limit: 10, ...filters };
  const res = await axios.get("/api/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AdminUsers = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  // Only allow admin
  if (!token || user?.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ name: "", email: "", role: "" });
  const [modal, setModal] = useState({ open: false, mode: "add", user: null });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", page, filters],
    queryFn: () => fetchUsers({ token, page, filters }),
  });

  // Add/Edit/Delete mutations
  const addUserMutation = useMutation({
    mutationFn: async (newUser) =>
      axios.post("/api/admin/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      setModal({ open: false, mode: "add", user: null });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async (editUser) =>
      axios.put(`/api/admin/users/${editUser.id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      setModal({ open: false, mode: "add", user: null });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id) =>
      axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
    },
  });

  // Modal form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "user",
  });

  // Handle modal open for add/edit
  const openModal = (mode, user = null) => {
    setModal({ open: true, mode, user });
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        address: user.address,
        password: "",
        role: user.role,
      });
    } else {
      setForm({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "user",
      });
    }
  };

  // Handle modal form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.mode === "add") {
      addUserMutation.mutate(form);
    } else if (modal.mode === "edit") {
      editUserMutation.mutate({ ...form, id: modal.user.id });
    }
  };

  // DataGrid columns
  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => openModal("edit", params.row)}
            startIcon={<PencilIcon className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => deleteUserMutation.mutate(params.row.id)}
            startIcon={<TrashIcon className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-users-container">
      <div className="admin-users-main">
        <div className="admin-users-header">
          <h1 className="admin-users-title">User Management</h1>
          <button
            className="admin-users-add-btn"
            onClick={() => openModal("add")}
          >
            Add User
          </button>
        </div>
        <div className="admin-users-filters">
          <input
            type="text"
            placeholder="Filter by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Filter by email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <div>
          <table className="admin-users-table">
            {/* ...existing table code... */}
          </table>
        </div>
        <div className="admin-users-pagination">
          {/* ...existing pagination code... */}
        </div>
      </div>
      {modal.open && (
        <div className="admin-users-modal-bg">
          <form
            className="admin-users-modal"
            onSubmit={handleSubmit}
          >
            {/* ...existing modal form code... */}
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
