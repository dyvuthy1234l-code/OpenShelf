import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  X,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import ForgotPasswordModal from "../../components/auth/ForgotPasswordModal";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().min(1, "Email is required.").email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  password_confirmation: z.string().min(1, "Please confirm your password."),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match.",
  path: ["password_confirmation"],
});

/* ─── reusable input classes ─── */
const inputBase = "w-full h-11 pl-10 pr-4 bg-[#07172B]/80 border border-white/10 hover:border-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-white placeholder:text-slate-500 rounded-xl text-xs font-semibold outline-none transition-all";
const inputWithToggle = "w-full h-11 pl-10 pr-10 bg-[#07172B]/80 border border-white/10 hover:border-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-white placeholder:text-slate-500 rounded-xl text-xs font-semibold outline-none transition-all";

export default function AuthPage({ defaultTab = "login" }) {
  const [mode, setMode] = useState(defaultTab);
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { redirectByRole } = useAuthRedirect();
  const isLogin = mode === "login";

  const {
    register: formRegister,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      remember: false,
    },
  });

  // sync with route-level defaultTab
  useEffect(() => {
    setMode(defaultTab);
  }, [defaultTab]);

  // clear errors and reset form on mode change
  useEffect(() => {
    setError("");
    reset();
  }, [mode, reset]);

  /* ── submit ── */
  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      let userData;

      if (isLogin) {
        userData = await login({
          email: data.email,
          password: data.password,
        });
      } else {
        userData = await register({
          name: data.name,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
        });
      }

      redirectByRole(userData);
    } catch (err) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;

      if (status === 422 && responseData?.errors) {
        Object.entries(responseData.errors).forEach(([key, msgs]) => {
          setFormError(key, { type: "server", message: Array.isArray(msgs) ? msgs[0] : msgs });
        });
      } else if (status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (status === 403) {
        setError(responseData?.message || "Your account is inactive. Please contact support.");
      } else if (status === 401) {
        setError(responseData?.message || "Invalid email or password.");
      } else {
        setError(
          responseData?.message ||
          err?.friendlyMessage ||
          (err?.code === 'ECONNABORTED'
            ? "The server took too long to respond (it may be waking up). Please try again."
            : err?.message) ||
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── field error display ── */
  const Err = ({ name }) => {
    const msg = errors[name]?.message;
    if (!msg) return null;
    return (
      <p className="mt-1 text-[11px] font-semibold text-rose-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        <span>{msg}</span>
      </p>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Mobile logo ── */}
      <div className="mb-6 flex items-center gap-2 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/20">
          <BookOpen className="h-4.5 w-4.5 text-slate-950" />
        </div>
        <div>
          <span className="text-sm font-black text-white block leading-none">OpenShelf</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-amber-400">Library Network</span>
        </div>
      </div>

      {/* ── Luxury Midnight Card ── */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0B1D32]/90 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.6)] overflow-hidden font-sans">
        {/* Top Decorative Amber Line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            {isLogin
              ? "Welcome back! Enter your credentials to access your shelf."
              : "Join OpenShelf and start discovering community books."}
          </p>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                <span className="flex-1 font-medium">{error}</span>
                <button onClick={() => setError("")} className="shrink-0 text-rose-400 hover:text-rose-200 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode tabs */}
        <div className="mb-5 flex rounded-2xl border border-white/10 bg-[#07172B]/90 p-1">
          {[
            { key: "login", label: "Sign In" },
            { key: "register", label: "Create Account" },
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                mode === m.key
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3.5"
          >
            {/* Name — register only */}
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    {...formRegister("name")}
                    placeholder="Your full name"
                    className={inputBase}
                  />
                </div>
                <Err name="name" />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  {...formRegister("email")}
                  placeholder="you@example.com"
                  className={inputBase}
                />
              </div>
              <Err name="email" />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11.5px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  {...formRegister("password")}
                  placeholder={isLogin ? "Enter password" : "Min. 8 characters"}
                  className={inputWithToggle}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Err name="password" />
            </div>

            {/* Confirm password — register only */}
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwConfirm ? "text" : "password"}
                    {...formRegister("password_confirmation")}
                    placeholder="Re-enter password"
                    className={inputWithToggle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwConfirm((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                    aria-label={showPwConfirm ? "Hide password" : "Show password"}
                  >
                    {showPwConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <Err name="password_confirmation" />
              </div>
            )}

            {/* Remember me — login only */}
            {isLogin && (
              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  {...formRegister("remember")}
                  className="h-4 w-4 rounded border-white/20 bg-[#07172B] accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-300">Remember my session</span>
              </label>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Toggle */}
        <p className="mt-5 text-center text-xs text-slate-400 font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(isLogin ? "register" : "login")}
            className="font-black text-amber-400 hover:text-amber-300 transition-colors cursor-pointer ml-1"
          >
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>

      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </motion.div>
  );
}
