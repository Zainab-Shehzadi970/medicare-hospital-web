"use client";

import { useEffect, useState } from "react";
import { FaIdCard, FaUser, FaXmark, FaArrowRight } from "react-icons/fa6";

const tabs = [
  { id: "patient", label: "Patient (CNIC)", icon: FaIdCard },
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

// Digits ko XXXXX-XXXXXXX-X shakal mein likhta hai
function formatCnic(value) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

function Dialog({ onClose }) {
  const [tab, setTab] = useState("patient");
  const [cnic, setCnic] = useState("");
  const [staff, setStaff] = useState({
    role: staffRoles[0].id,
    employeeId: "",
    password: "",
  });

  // Escape se band, aur popup khula ho to peeche ka page scroll na ho
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaff((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    console.log("Patient login:", cnic); // TODO(backend): CNIC verify karna
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    // Password ko kabhi console mein na likhein
    console.log("Staff login:", { role: staff.role, employeeId: staff.employeeId }); // TODO(backend)
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
          <form onSubmit={handlePatientSubmit} className="mt-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">Enter your CNIC</h2>
              <p className="mt-2 text-base text-slate-400">
                Booking or checking records for yourself
              </p>
            </div>

            <label className="mt-8 block">
              <span className={labelClass}>CNIC</span>
              <input
                type="text"
                inputMode="numeric"
                value={cnic}
                onChange={(e) => setCnic(formatCnic(e.target.value))}
                placeholder="XXXXX-XXXXXXX-X"
                pattern="\d{5}-\d{7}-\d"
                title="Enter a 13-digit CNIC (XXXXX-XXXXXXX-X)"
                required
                className={`${fieldClass} tracking-wider`}
              />
            </label>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_25px_-5px_rgba(220,38,38,0.4)] transition-colors hover:bg-red-700"
            >
              Continue <FaArrowRight />
            </button>
          </form>
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
              <span className={labelClass}>Employee ID / Email</span>
              <input
                type="text"
                name="employeeId"
                value={staff.employeeId}
                onChange={handleStaffChange}
                placeholder="e.g. DOC-8091"
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

            <button
              type="submit"
              className="w-full rounded-xl bg-[#1e293b] py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-700"
            >
              Login to Staff Console
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