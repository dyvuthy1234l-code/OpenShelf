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
  Sparkles,
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
    setValue,
    setError: setFormError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      remember: true,
    },
  });

  // Sync with route-level defaultTab
  useEffect(() => {
    setMode(defaultTab);
  }, [defaultTab]);

  // Clear errors and reset form on mode change
  useEffect(() => {
    setError("");
    reset();
  }, [mode, reset]);

  // Quick Demo Account Auto-Fill
  const handleFillDemo = (email, password) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
    setError("");
  };

  /* ── Submit Handler ── */
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
          (err?.code === "ECONNABORTED"
            ? "The server took too long to respond (it may be waking up). Please try again."
            : err?.message) ||
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Field Error Display ── */
  const Err = ({ name }) => {
    const msg = errors[name]?.message;
    if (!msg) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-[11px] font-semibold text-rose-300 flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
        <span>{msg}</span>
      </motion.p>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[420px] mx-auto select-none"
    >
      {/* ── Mobile Logo Header (Hidden on Desktop) ── */}
      <div className="mb-5 flex items-center justify-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFD700] via-[#F5B82E] to-[#C98A0C] shadow-lg shadow-amber-500/20">
          <BookOpen className="h-5 w-5 text-[#07172B]" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-lg font-black text-white block leading-none tracking-tight">
            Open<span className="text-[#F5B82E]">Shelf</span>
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-amber-400/90 mt-0.5 block">
            Library Network
          </span>
        </div>
      </div>

      {/* ── LUXURY EXECUTIVE AUTHENTICATION CARD ── */}
      <div className="bg-[#091C30]/90 backdrop-blur-2xl border border-slate-700/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-5.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* OpenShelf Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>OPENSHELF NETWORK</span>
          </div>

          {/* Slogan */}
          <div className="text-right shrink-0">
            <div className="text-[9.5px] text-slate-400 font-medium leading-tight">A Smarter</div>
            <div className="text-[9.5px] text-slate-400 font-medium leading-tight">Reading Tomorrow</div>
            <div className="w-6 h-0.5 bg-[#F5B82E] ml-auto mt-0.5 rounded-full" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-2.5">
          <h2 className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight mt-0.5">
            {isLogin
              ? "Welcome back! Enter your credentials to access your library."
              : "Join OpenShelf and explore thousands of books across Cambodia."}
          </p>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2.5 overflow-hidden"
            >
              <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/60 backdrop-blur-md px-3 py-2 text-[11px] font-medium text-rose-200 shadow-inner">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                <span className="flex-1 leading-snug">{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 text-rose-300 hover:text-white cursor-pointer p-0.5 rounded"
                  aria-label="Dismiss error"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Segmented Switcher (Sign In ↔ Create Account) */}
        <div className="mb-2.5 flex rounded-xl border border-slate-700/80 bg-[#05111E] p-0.5 sm:p-1 relative">
          {["login", "register"].map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors duration-200 cursor-pointer z-10 select-none text-center ${
                  isActive ? "text-[#07172B]" : "text-slate-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAuthTabPill"
                    className="absolute inset-0 rounded-lg bg-[#F5B82E] shadow-sm -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10">
                  {m === "login" ? "Sign In" : "Create Account"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-2 sm:space-y-2.5"
          >
            {/* Full Name — Register Only */}
            {!isLogin && (
              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">
                  Full Name
                </label>
                <div className="relative group">
                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F5B82E] transition-colors pointer-events-none"
                  />
                  <input
                    type="text"
                    {...formRegister("name")}
                    placeholder="Your full name"
                    className="w-full h-9.5 sm:h-10 pl-9 pr-3 bg-[#05111E] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:bg-[#07172B] focus:border-[#F5B82E] focus:ring-1 focus:ring-[#F5B82E]/30 focus:outline-none transition-all"
                  />
                </div>
                <Err name="name" />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F5B82E] transition-colors pointer-events-none"
                />
                <input
                  type="email"
                  {...formRegister("email")}
                  placeholder="Your email"
                  className="w-full h-9.5 sm:h-10 pl-9 pr-3 bg-[#05111E] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:bg-[#07172B] focus:border-[#F5B82E] focus:ring-1 focus:ring-[#F5B82E]/30 focus:outline-none transition-all"
                />
              </div>
              <Err name="email" />
            </div>

            {/* Password */}
            <div>
              <div className="mb-0.5 flex items-center justify-between">
                <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-[#F5B82E] hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F5B82E] transition-colors pointer-events-none"
                />
                <input
                  type={showPw ? "text" : "password"}
                  {...formRegister("password")}
                  placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
                  className="w-full h-9.5 sm:h-10 pl-9 pr-10 bg-[#05111E] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:bg-[#07172B] focus:border-[#F5B82E] focus:ring-1 focus:ring-[#F5B82E]/30 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-0 top-0 h-9.5 sm:h-10 w-10 flex items-center justify-center text-slate-400 hover:text-[#F5B82E] transition-colors cursor-pointer"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Err name="password" />
            </div>

            {/* Confirm Password — Register Only */}
            {!isLogin && (
              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F5B82E] transition-colors pointer-events-none"
                  />
                  <input
                    type={showPwConfirm ? "text" : "password"}
                    {...formRegister("password_confirmation")}
                    placeholder="Re-enter your password"
                    className="w-full h-9.5 sm:h-10 pl-9 pr-10 bg-[#05111E] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:bg-[#07172B] focus:border-[#F5B82E] focus:ring-1 focus:ring-[#F5B82E]/30 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwConfirm((p) => !p)}
                    className="absolute right-0 top-0 h-9.5 sm:h-10 w-10 flex items-center justify-center text-slate-400 hover:text-[#F5B82E] transition-colors cursor-pointer"
                    aria-label={showPwConfirm ? "Hide password" : "Show password"}
                  >
                    {showPwConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <Err name="password_confirmation" />
              </div>
            )}

            {/* Remember Me — Login Only */}
            {isLogin && (
              <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                <input
                  type="checkbox"
                  {...formRegister("remember")}
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-[#05111E] text-amber-500 accent-amber-500 focus:ring-amber-500/20 cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-300">Remember me</span>
              </label>
            )}

            {/* Primary Gold Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#F5B82E] hover:bg-[#E5AA24] disabled:opacity-50 text-[#07172B] font-extrabold text-xs sm:text-sm tracking-wide rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-1.5"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create My Account"}</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2.5">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#091C30] px-2.5 text-[8.5px] font-bold uppercase tracking-widest text-slate-500 relative z-10 shrink-0">
            OR CONTINUE WITH
          </span>
        </div>

        {/* SSO / Social Login Display Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Google Button */}
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="h-8.5 rounded-xl bg-[#05111E] hover:bg-[#07172B] border border-slate-700/80 hover:border-slate-500 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-default shadow-xs"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.4 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>Google</span>
          </button>

          {/* Microsoft Button */}
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="h-8.5 rounded-xl bg-[#05111E] hover:bg-[#07172B] border border-slate-700/80 hover:border-slate-500 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-default shadow-xs"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            <span>Microsoft</span>
          </button>
        </div>

        {/* Footer Toggle Text */}
        <p className="mt-2.5 text-center text-[11px] text-slate-400 font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(isLogin ? "register" : "login")}
            className="font-bold text-[#F5B82E] hover:underline transition-colors cursor-pointer ml-1"
          >
            {isLogin ? "Create one free" : "Sign in now"}
          </button>
        </p>
      </div>

      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </motion.div>
  );
}
