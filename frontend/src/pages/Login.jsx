import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/auth/login", data);
      login(res.data.token);
      // Redirect based on role
      const role = res.data.user?.role;
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("root", {
        message:
          err.response?.data?.message || "Login failed. Please try again.",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              autoFocus
            />
            {errors.email && (
              <div className="error">{errors.email.message}</div>
            )}
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <div className="error">{errors.password.message}</div>
            )}
          </div>
          {errors.root && <div className="error">{errors.root.message}</div>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <a href="/register" className="login-link">
          New user? Register here
        </a>
      </div>
    </div>
  );
};

export default Login;
