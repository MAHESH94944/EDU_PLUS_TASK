import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate, Link } from "react-router-dom";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-300 to-pink-200">
      <div className="w-full max-w-md p-8 bg-white/90 rounded-3xl shadow-2xl border border-indigo-100 animate-fade-in">
        <h2 className="text-4xl font-extrabold mb-8 text-indigo-700 text-center tracking-tight drop-shadow">
          Create Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <div>
            <label className="block text-sm font-semibold text-indigo-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Full Name (20-60 chars)"
              {...formRegister("name")}
              className={`w-full border-2 p-3 rounded-xl focus:outline-none focus:border-pink-400 transition ${
                errors.name ? "border-red-400" : "border-gray-200"
              } bg-indigo-50/40`}
              autoFocus
            />
            {errors.name && (
              <p className="text-pink-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-indigo-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              {...formRegister("email")}
              className={`w-full border-2 p-3 rounded-xl focus:outline-none focus:border-pink-400 transition ${
                errors.email ? "border-red-400" : "border-gray-200"
              } bg-indigo-50/40`}
            />
            {errors.email && (
              <p className="text-pink-600 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-indigo-700 mb-2">
              Address
            </label>
            <input
              type="text"
              placeholder="Address (max 400 chars)"
              {...formRegister("address")}
              className={`w-full border-2 p-3 rounded-xl focus:outline-none focus:border-pink-400 transition ${
                errors.address ? "border-red-400" : "border-gray-200"
              } bg-indigo-50/40`}
            />
            {errors.address && (
              <p className="text-pink-600 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-indigo-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Password (8-16 chars, uppercase & special char)"
              {...formRegister("password")}
              className={`w-full border-2 p-3 rounded-xl focus:outline-none focus:border-pink-400 transition ${
                errors.password ? "border-red-400" : "border-gray-200"
              } bg-indigo-50/40`}
            />
            {errors.password && (
              <p className="text-pink-600 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          {errors.root && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 rounded p-2 text-sm mb-2 animate-shake">
              {errors.root.message}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-400 hover:from-indigo-700 hover:to-pink-500 text-white py-3 rounded-xl font-bold shadow-lg transition active:scale-95"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-pink-600 hover:text-indigo-700 underline font-semibold transition"
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};


export default Register;
