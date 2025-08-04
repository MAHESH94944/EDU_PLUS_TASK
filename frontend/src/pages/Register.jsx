import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const schema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  password: z
    .string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, "Must include uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must include special character"),
});

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      data.role = "user";
      await axios.post("/api/auth/register", data);
      const res = await axios.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("root", {
        message:
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Full Name (20-60 chars)"
              {...formRegister("name")}
              autoFocus
            />
            {errors.name && (
              <div className="error">{errors.name.message}</div>
            )}
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              {...formRegister("email")}
            />
            {errors.email && (
              <div className="error">{errors.email.message}</div>
            )}
          </div>
          <div>
            <label>Address</label>
            <input
              type="text"
              placeholder="Address (max 400 chars)"
              {...formRegister("address")}
            />
            {errors.address && (
              <div className="error">{errors.address.message}</div>
            )}
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Password (8-16 chars, uppercase & special char)"
              {...formRegister("password")}
            />
            {errors.password && (
              <div className="error">{errors.password.message}</div>
            )}
          </div>
          {errors.root && (
            <div className="error">{errors.root.message}</div>
          )}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
        <a href="/login" className="register-link">
          Already have an account? Login
        </a>
      </div>
    </div>
  );
};


export default Register;