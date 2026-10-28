"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaIdCard, FaUser, FaXmark } from "react-icons/fa6";
import { supabase } from "../lib/supabase";
import { getHomeRoute } from "../lib/auth";
import { useSession } from "../lib/useSession";
import PatientAuthForm from "./patient-auth-form";

const tabs = [
  { id: "patient", label: "Patient", icon: FaIdCard },
  { id: "staff", label: "Staff / Doctor", icon: FaUser },
];

const staffRoles = [
  { id: "doctor", label: "Doctor (OPD & Clinical Console)" },
  { id: "nurse", label: "Nurse Station (Ward Management)" },
  { id: "pharmacy", label: "Pharmacy & Medicine POS" },
  { id: "lab", label: "Lab Technician & Diagnostics" },
  { id: "admin", label: "System Administrator" },
];

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-[#0b0f1a] px-5 py-4 text-base text-white placeholder:text-slate-500 focus:border-brand-red focus:outline-none";

function Dialog({ onClose }) {
  const router = useRouter();
  const session = useSession();
  const [tab, setTab] = useState("patient");
  const [staff, setStaff] = useState({
    role: staffRoles[0].id,
    employeeId: "",
    password: "",
  });
  const [staffError, setStaffError] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);
  const [route, setRoute] = useState(null);

  // Work out whether the signed-in account is a doctor or a patient
  useEffect(() => {
    if (!session) {
      setRoute(null);
      return undefined;
    }
    let alive = true;
    getHomeRoute(session.user.id).then((r) => alive && setRoute(r));
    return () => {
      alive = false;
    };
  }, [session]);

  // Close on Escape, and lock the page scroll behind the dialog while it is open
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const goToDashboard = async () => {
    const route = await getHomeRoute(session.user.id);
    onClose();
    router.push(route);
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaff((prev) => ({ ...prev, [name]: value }));
  };

  // Patients sign in with the same account as the mobile app; doctors are sent to their console
  const handlePatientSignedIn = async (user) => {
    const route = await getHomeRoute(user.id);
    onClose();
    router.push(route);
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffError("");

    // Only the Doctor console is built so far
    if (staff.role !== "doctor") {
      setStaffError("Only the Doctor console is available right now.");
      return;
    }

    setStaffLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: staff.employeeId.trim().toLowerCase(),
      password: staff.password,
    });

    if (error) {
      setStaffError("Incorrect email or password.");
      setStaffLoading(false);
      return;
    }

    // Only accounts linked to the doctors table may enter
    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("profile_id", data.user.id)
      .maybeSingle();

    if (!doctor) {
      await supabase.auth.signOut();
      setStaffError("This account is not linked to a doctor profile.");
      setStaffLoading(false);
      return;
    }

    onClose();
    router.push("/doctor-appointments");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Portal sign in"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-10"
      >
        {/* Tabs + close */}
        <div className="flex items-center gap-3">
          <div
            role="tablist"
            className="flex flex-1 rounded-xl border border-white/10 bg-[#0b0f1a] p-1.5"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-colors ${
                  tab === id
                    ? "bg-brand-red text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="text-sm" />
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-slate-400 transition-colors hover:text-white"
          >
            <FaXmark className="text-xl" />
          </button>
        </div>

        {tab === "patient" ? (
          <div className="mt-10">
            {session === undefined || (session && route === null) ? (
              <p className="py-10 text-center text-slate-400">Loading...</p>
            ) : session && route === "/doctor-appointments" ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Doctor account</h2>
                <p className="mt-3 break-all text-base text-slate-400">{session.user.email}</p>
                <p className="mt-3 text-base text-slate-400">
                  The patient portal is for patients only. Doctors should use the Staff / Doctor login.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("staff")}
                  className="mt-8 w-full rounded-xl bg-brand-red py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700"
                >
                  Go to Staff / Doctor login
                </button>
                <button
                  type="button"
                  onClick={() => supabase.auth.signOut()}
                  className="mt-3 w-full rounded-xl border border-white/10 py-4 text-sm font-bold uppercase tracking-wider text-slate-300 transition-colors hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : session ? (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white">You are signed in</h2>
                <p className="mt-2 break-all text-base text-slate-400">{session.user.email}</p>
                <button
                  type="button"
                  onClick={goToDashboard}
                  className="mt-8 w-full rounded-xl bg-brand-red py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_25px_-5px_rgba(220,38,38,0.4)] transition-colors hover:bg-red-700"
                >
                  Go to my dashboard
                </button>
                <button
                  type="button"
                  onClick={() => supabase.auth.signOut()}
                  className="mt-3 w-full rounded-xl border border-white/10 py-4 text-sm font-bold uppercase tracking-wider text-slate-300 transition-colors hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <PatientAuthForm onSignedIn={handlePatientSignedIn} />
            )}
          </div>
        ) : (
          <form onSubmit={handleStaffSubmit} className="mt-10 space-y-6">
            <label className="block">
              <span className={labelClass}>Select Department / Staff Role</span>
              <select
                name="role"
                value={staff.role}
                onChange={handleStaffChange}
                className={fieldClass}
              >
                {staffRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                name="employeeId"
                value={staff.employeeId}
                onChange={handleStaffChange}
                placeholder="doctor@example.com"
                autoComplete="username"
                required
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Password</span>
              <input
                type="password"
                name="password"
                value={staff.password}
                onChange={handleStaffChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={fieldClass}
              />
            </label>

            {staffError && (
              <p className="rounded-xl bg-red-950/60 px-4 py-3 text-sm text-red-300">
                {staffError}
              </p>
            )}

            <button
              type="submit"
              disabled={staffLoading}
              className="w-full rounded-xl bg-[#1e293b] py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
            >
              {staffLoading ? "Signing in..." : "Login to Staff Console"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PortalLoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return <Dialog onClose={onClose} />;
}