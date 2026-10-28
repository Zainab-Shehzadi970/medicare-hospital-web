"use client";

import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { supabase } from "../lib/supabase";

// Same rules and same Supabase accounts as the mobile app
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400";
const fieldClass =
  "w-full rounded-xl border border-white/10 bg-[#0b0f1a] px-5 py-4 text-base text-white placeholder:text-slate-500 focus:border-brand-red focus:outline-none";

export default function PatientAuthForm({ onSignedIn, heading, subheading }) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Message left by a blocked doctor login (this form is re-created after the sign out)
  useEffect(() => {
    try {
      const msg = sessionStorage.getItem("patientAuthNotice");
      if (msg) {
        setError(msg);
        sessionStorage.removeItem("patientAuthNotice");
      }
    } catch {}
  }, []);

  const validate = () => {
    if (isSignup && fullName.trim().length < 3) return "Please enter your full name.";
    if (isSignup && !/^\+?\d{10,15}$/.test(phone.trim()))
      return "Please enter a valid phone number (10-15 digits).";
    if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setLoading(true);
    if (isSignup) {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim(), phone: phone.trim() } },
      });
      if (err) {
        setError(err.message);
      } else if (data.session) {
        onSignedIn?.(data.session.user);
      } else {
        setInfo("Account created. Please sign in.");
        setIsSignup(false);
      }
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (err) {
        setError(err.message === "Invalid login credentials" ? "Incorrect email or password." : err.message);
      } else {
        // Doctor / staff accounts must use the Staff / Doctor login
        const { data: doctor } = await supabase
          .from("doctors")
          .select("id")
          .eq("profile_id", data.user.id)
          .maybeSingle();
        if (doctor) {
          try {
            sessionStorage.setItem(
              "patientAuthNotice",
              "This is a doctor account. Please use the Staff / Doctor login."
            );
          } catch {}
          await supabase.auth.signOut();
          setError("This is a doctor account. Please use the Staff / Doctor login.");
        } else {
          onSignedIn?.(data.user);
        }
      }
    }
    setLoading(false);
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setInfo("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">
          {heading || (isSignup ? "Create your account" : "Welcome back")}
        </h2>
        <p className="mt-2 text-base text-slate-400">
          {subheading ||
            (isSignup
              ? "Sign up to book appointments with our specialists."
              : "Sign in with the same account you use in the Medicare mobile app.")}
        </p>
      </div>

      {isSignup && (
        <>
          <label className="block">
            <span className={labelClass}>Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ahmed Khan"
              autoComplete="name"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Phone number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 03001234567"
              autoComplete="tel"
              className={fieldClass}
            />
          </label>
        </>
      )}

      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="username"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Password</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={isSignup ? "new-password" : "current-password"}
            className={`${fieldClass} pr-20`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-red"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {error && (
        <p className="rounded-xl bg-red-950/60 px-4 py-3 text-sm text-red-300">{error}</p>
      )}
      {info && (
        <p className="rounded-xl bg-emerald-950/60 px-4 py-3 text-sm text-emerald-300">{info}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_25px_-5px_rgba(220,38,38,0.4)] transition-colors hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
        {!loading && <FaArrowRight />}
      </button>

      <p className="text-center text-sm text-slate-400">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <button type="button" onClick={switchMode} className="font-bold text-brand-red">
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </p>
    </form>
  );
}