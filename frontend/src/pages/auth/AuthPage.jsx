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

/* ─── reusable input classes ─── */
const inputBase =
  "auth-input h-10 w-full rounded-lg border border-[#1E3A5F]/80 bg-[#0B1A2D] pl-9 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-[#475569] focus:border-[#F5B82E]/50 focus:ring-1 focus:ring-[#F5B82E]/20";
const inputWithToggle =
  "auth-input h-10 w-full rounded-lg border border-[#1E3A5F]/80 bg-[#0B1A2D] pl-9 pr-10 text-sm text-slate-200 outline-none transition-all placeholder:text-[#475569] focus:border-[#F5B82E]/50 focus:ring-1 focus:ring-[#F5B82E]/20";

export default function AuthPage({ defaultTab = "login" }) {
  const [mode, setMode] = useState(defaultTab);
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    remember: false,
  });

  const { login, register } = useAuth();
  const { redirectByRole } = useAuthRedirect();
  const isLogin = mode === "login";

  // sync with route-level defaultTab
  useEffect(() => setMode(defaultTab), [defaultTab]);

  // clear errors on mode change
  useEffect(() => {
    setError("");
    setFieldErrors({});
  }, [mode]);

  /* ── helpers ── */
  const validateField = (field, value, currentState = form) => {
    let msg = "";
    if (field === "name" && !isLogin) {
      if (!value.trim()) msg = "Name is required.";
      else if (value.trim().length < 2) msg = "Name must be at least 2 characters.";
    } else if (field === "email") {
      if (!value.trim()) msg = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = "Invalid email address.";
    } else if (field === "password") {
      if (!value) msg = "Password is required.";
      else if (!isLogin && value.length < 8) msg = "Password must be at least 8 characters.";
    } else if (field === "password_confirmation" && !isLogin) {
      if (value !== currentState.password) msg = "Passwords do not match.";
    }

    if (msg) {
      setFieldErrors((p) => ({ ...p, [field]: msg }));
      return false;
    } else {
      setFieldErrors((p) => {
        const n = { ...p };
        delete n[field];
        return n;
      });
      return true;
    }
  };

  const handleBlur = (field) => {
    validateField(field, form[field]);
  };

  const set = (field, value) => {
    setForm((p) => {
      const newState = { ...p, [field]: value };
      
      // Live validate if it already has an error, so the error clears as they type
      if (fieldErrors[field]) {
        validateField(field, value, newState);
      }
      
      // Special case: if password changes, and confirmation already has error, re-validate confirmation
      if (field === "password" && fieldErrors["password_confirmation"]) {
        validateField("password_confirmation", newState.password_confirmation, newState);
      }
      
      return newState;
    });
    
    if (error) setError("");
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    let isValid = true;
    if (!isLogin) {
      const isNameValid = validateField("name", form.name);
      const isEmailValid = validateField("email", form.email);
      const isPassValid = validateField("password", form.password);
      const isConfValid = validateField("password_confirmation", form.password_confirmation);
      if (!isNameValid || !isEmailValid || !isPassValid || !isConfValid) isValid = false;
    } else {
      const isEmailValid = validateField("email", form.email);
      const isPassValid = validateField("password", form.password);
      if (!isEmailValid || !isPassValid) isValid = false;
    }

    if (!isValid) return;

    setError("");
    setLoading(true);

    try {
      let userData;

      if (isLogin) {
        // POST /api/login — expects { email, password }
        userData = await login({
          email: form.email,
          password: form.password,
        });
      } else {
        // POST /api/register — expects { name, email, password, password_confirmation }
        userData = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        });
      }

      redirectByRole(userData);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 422 && data?.errors) {
        // Laravel validation — map field-level errors
        const mapped = {};
        Object.entries(data.errors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setFieldErrors(mapped);
      } else if (status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (status === 403) {
        setError(data?.message || "Your account is inactive. Please contact support.");
      } else if (status === 401) {
        setError(data?.message || "Invalid email or password.");
      } else {
        setError(
          data?.message ||
          err?.message ||
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── field error display ── */
  const Err = ({ name }) => {
    const msg = fieldErrors[name];
    if (!msg) return null;
    return (
      <p className="mt-1 text-[11px] font-medium text-rose-400">{msg}</p>
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD15A] to-[#E7A90C]">
          <BookOpen className="h-4 w-4 text-[#061426]" />
        </div>
        <div>
          <span className="text-sm font-black text-white block leading-none">OpenShelf</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#F5B82E]/80">Library Network</span>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="rounded-2xl border border-[#1E3A5F]/50 bg-[#0A1929]/90 p-5 sm:p-6 backdrop-blur-sm">

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-1 text-xs text-[#94A3B8]">
            {isLogin
              ? "Welcome back! Enter your credentials to continue."
              : "Join OpenShelf and start discovering great books."}
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
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300">
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-rose-400" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError("")} className="shrink-0 text-rose-400/70 hover:text-rose-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode tabs */}
        <div className="mb-5 flex rounded-lg bg-[#061426] p-0.5">
          {["login", "register"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition-all ${
                mode === m
                  ? "bg-[#0F2744] text-white shadow-sm"
                  : "text-[#64748B] hover:text-slate-400"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
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
            onSubmit={handleSubmit}
            className="space-y-3.5"
          >
            {/* Name — register only */}
            {!isLogin && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Your full name"
                    required
                    className={inputBase}
                  />
                </div>
                <Err name="name" />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="you@example.com"
                  required
                  className={inputBase}
                />
              </div>
              <Err name="email" />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Password</label>
                {isLogin && (
                  <button type="button" className="text-[11px] font-medium text-[#F5B82E]/70 hover:text-[#F5B82E] transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  placeholder={isLogin ? "Enter password" : "Min. 8 characters"}
                  required
                  className={inputWithToggle}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-slate-400 transition-colors"
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
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                  <input
                    type={showPwConfirm ? "text" : "password"}
                    value={form.password_confirmation}
                    onChange={(e) => set("password_confirmation", e.target.value)}
                    onBlur={() => handleBlur("password_confirmation")}
                    placeholder="Re-enter password"
                    required
                    className={inputWithToggle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-slate-400 transition-colors"
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => set("remember", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#1E3A5F] accent-[#F5B82E]"
                />
                <span className="text-xs text-[#94A3B8]">Remember me</span>
              </label>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#F5B82E] to-[#D9A23E] text-sm font-bold text-[#0B1F3A] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0B1F3A]/20 border-t-[#0B1F3A]" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1E3A5F]/60" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#475569]">or</span>
          <div className="h-px flex-1 bg-[#1E3A5F]/60" />
        </div>

        {/* Social */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#1E3A5F]/60 bg-[#0B1A2D] text-xs font-medium text-slate-400 transition hover:border-[#2A4A6B] hover:text-slate-300"
          >
            <span className="text-sm font-bold text-white">G</span>
            Google
          </button>
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#1E3A5F]/60 bg-[#0B1A2D] text-xs font-medium text-slate-400 transition hover:border-[#2A4A6B] hover:text-slate-300"
          >
            <span className="text-xs font-bold text-white">f</span>
            Facebook
          </button>
        </div>

        {/* Toggle */}
        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(isLogin ? "register" : "login")}
            className="font-semibold text-[#F5B82E] hover:text-[#FFD15A] transition-colors"
          >
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
