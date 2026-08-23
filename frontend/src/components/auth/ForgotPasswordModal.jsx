import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, X, ArrowRight, KeyRound } from "lucide-react";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API reset request delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const handleClose = () => {
    setSubmitted(false);
    setEmail("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-[#040D1A]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#294663] bg-[#0B1D32] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-8"
        >
          {/* Top Decorative Amber Line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#F5B82E] to-transparent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-[#294663] bg-[#0A1C31] text-[#7890AA] transition-colors hover:border-[#F5B82E]/50 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {!submitted ? (
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F5B82E]/30 bg-[#F5B82E]/10 text-[#F5B82E]">
                <KeyRound className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-extrabold text-white">Reset your password</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#94A7BF]">
                Enter the email address associated with your OpenShelf account, and we will send you a password reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="reset-email" className="mb-1.5 block text-xs font-bold text-white">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7890AA]" />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#294663] bg-[#0A1C31] px-4 py-3 pl-11 text-sm text-white placeholder:text-[#6E819B] outline-none transition-all duration-200 hover:border-[#416487] focus:border-[#F5B82E] focus:ring-4 focus:ring-[#F5B82E]/10"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC629] px-5 py-3 text-xs font-extrabold text-[#07172B] shadow-[0_8px_20px_rgba(245,184,46,0.2)] transition-colors hover:bg-[#FFD45A] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07172B]/30 border-t-[#07172B]" />
                      Sending Instructions...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          ) : (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-extrabold text-white">Reset link sent!</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#94A7BF]">
                We sent a password reset email to <span className="font-bold text-white">{email}</span>. Please check your inbox and follow the instructions.
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="mt-6 flex w-full items-center justify-center rounded-xl border border-[#294663] bg-[#0A1C31] py-3 text-xs font-bold text-white transition-colors hover:border-[#F5B82E] cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
