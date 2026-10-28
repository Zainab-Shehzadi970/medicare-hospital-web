"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaCalendarCheck, FaXmark, FaCircleCheck } from "react-icons/fa6";
import { useBooking } from "./booking-context";
import { supabase } from "../lib/supabase";
import { useSession } from "../lib/useSession";
import { getHomeRoute } from "../lib/auth";
import PatientAuthForm from "./patient-auth-form";
import { useClinicData, buildSlots, fmt12, todayISO } from "../lib/useClinicData";

const emptyForm = {
  departmentId: "",
  doctorId: "",
  timeSlot: "",
  date: "",
  reason: "",
  phone: "",
  name: "",
};

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-brand-red focus:outline-none disabled:opacity-50";

function getInitialForm({ departmentId, doctorId, date } = {}) {
  return {
    ...emptyForm,
    departmentId: departmentId ?? "",
    doctorId: doctorId ?? "",
    date: date ?? "",
  };
}

function Field({ label, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function Dialog({ prefill, onClose }) {
  // The dialog mounts fresh every time, so the prefill becomes the initial state directly
  const [form, setForm] = useState(() => getInitialForm(prefill));
  const [submitted, setSubmitted] = useState(false);
  const [booked, setBooked] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const session = useSession();
  const [isDoctorUser, setIsDoctorUser] = useState(false);

  // Doctor accounts cannot book appointments as patients
  useEffect(() => {
    if (!session) {
      setIsDoctorUser(false);
      return undefined;
    }
    let alive = true;
    getHomeRoute(session.user.id).then((r) => alive && setIsDoctorUser(r === "/doctor-appointments"));
    return () => {
      alive = false;
    };
  }, [session]);

  // Pre-fill name and phone from the patient's account
  useEffect(() => {
    const u = session?.user;
    if (!u) return;
    setForm((p) => ({
      ...p,
      name: p.name || u.user_metadata?.full_name || "",
      phone: p.phone || u.user_metadata?.phone || "",
    }));
  }, [session]);
  const { departments, doctors, schedules, loading: dataLoading, error: dataError } = useClinicData();

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

  // Once data has loaded, resolve the department from the prefill (doctor id or department name/id)
  useEffect(() => {
    if (!departments.length) return;
    setForm((prev) => {
      if (prev.departmentId && departments.some((d) => d.id === prev.departmentId)) return prev;
      const doc = doctors.find((d) => d.id === prev.doctorId);
      const key = String(prev.departmentId || "").toLowerCase();
      const dept =
        departments.find((d) => d.id === doc?.department_id) ||
        departments.find((d) => d.id === prev.departmentId || d.name.toLowerCase() === key);
      return dept ? { ...prev, departmentId: dept.id } : prev;
    });
  }, [departments, doctors]);

  const department = departments.find((d) => d.id === form.departmentId);
  const doctor = doctors.find((d) => d.id === form.doctorId);
  const departmentDoctors = doctors.filter((doc) => doc.department_id === form.departmentId);

  // Slots come from the doctor's schedule; booked slots come from Supabase (refreshed every 10 seconds)
  const timeSlots = buildSlots(doctor, schedules, form.date);
  const slotsLocked = !form.doctorId || !form.date;

  useEffect(() => {
    if (!form.doctorId || !form.date) {
      setBooked([]);
      return;
    }
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase.rpc("get_booked_slots", {
        p_doctor: form.doctorId,
        p_date: form.date,
      });
      if (!alive) return;
      setBooked(
        error || !data
          ? []
          : data.map((r) => String(typeof r === "string" ? r : r.time_slot).slice(0, 5))
      );
    };
    load();
    const t = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [form.doctorId, form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmitError("");
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "departmentId" && { doctorId: "", timeSlot: "" }),
      ...(name === "doctorId" && { timeSlot: "" }),
      ...(name === "date" && { timeSlot: "" }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    setSubmitError("");
    setSaving(true);
    // Same appointments table as the mobile app, saved under the signed-in patient
    const { error } = await supabase.from("appointments").insert({
      patient_id: session.user.id,
      doctor_id: form.doctorId,
      appointment_date: form.date,
      time_slot: form.timeSlot,
      patient_name: form.name.trim(),
      patient_phone: form.phone.trim(),
      reason: form.reason.trim() || null,
      status: "pending",
    });
    setSaving(false);
    if (error) {
      setSubmitError(
        error.code === "23505"
          ? "This slot was just booked. Please choose another time."
          : error.message
      );
      if (error.code === "23505") setForm((p) => ({ ...p, timeSlot: "" }));
      return;
    }
    setSubmitted(true);
  };

  const today = todayISO();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-950/60 text-brand-red ring-1 ring-red-900/60">
              <FaCalendarCheck className="text-2xl" />
            </span>
            <div>
              <h2
                id="booking-title"
                className="text-2xl font-bold text-white sm:text-3xl"
              >
                Book OPD Appointment
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Medicare Hospital Direct OPD Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-slate-400 transition-colors hover:text-white"
          >
            <FaXmark className="text-2xl" />
          </button>
        </div>

        {session === undefined ? (
          <p className="py-16 text-center text-slate-400">Loading...</p>
        ) : !session ? (
          <div className="mt-9">
            <PatientAuthForm
              heading="Sign in to book"
              subheading="Use the same account as the Medicare mobile app, or create a new one."
              onSignedIn={() => {}}
            />
          </div>
        ) : isDoctorUser ? (
          <div className="py-12 text-center">
            <h3 className="text-2xl font-bold text-white">Doctor account</h3>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-400">
              Appointments can only be booked from a patient account. Please sign out and log in as a patient.
            </p>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="mt-8 rounded-xl bg-brand-red px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700"
            >
              Sign out
            </button>
          </div>
        ) : submitted ? (
          <div className="py-12 text-center">
            <FaCircleCheck className="mx-auto text-6xl text-emerald-500" />
            <h3 className="mt-6 text-2xl font-bold text-white">
              Appointment Requested
            </h3>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-400">
              {form.name}, your {department?.name} appointment with{" "}
              {doctor?.name} on {form.date} at {fmt12(form.timeSlot)} has been
              received. We will confirm on {form.phone}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 rounded-xl bg-brand-red px-10 py-3.5 font-bold text-white transition-colors hover:bg-red-700"
            >
              Close
            </button>
            <p className="mt-6 text-sm text-slate-400">
              Track this request in{" "}
              <Link href="/patient-dashboard" onClick={onClose} className="font-bold text-brand-red">
                My Dashboard
              </Link>
              .
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-9 grid gap-6 sm:grid-cols-2"
          >
            <Field label="Department">
              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                required
                className={fieldClass}
              >
                <option value="">Choose Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Doctor">
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                disabled={!form.departmentId}
                required
                className={fieldClass}
              >
                <option value="">
                  {form.departmentId ? "Choose Doctor" : "Select department first"}
                </option>
                {departmentDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={today}
                required
                className={fieldClass}
              />
            </Field>

            <Field label="Reason for Visit">
              <input
                type="text"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Routine checkup..."
                className={fieldClass}
              />
            </Field>

            <fieldset className="sm:col-span-2">
              <legend className={labelClass}>Choose Time Slot</legend>
              <div
                className={`grid grid-cols-3 gap-3 ${
                  slotsLocked ? "opacity-50" : ""
                }`}
              >
                {timeSlots.map((slot) => {
                  const isBooked = booked.includes(slot);
                  const disabled = slotsLocked || isBooked;
                  return (
                    <label
                      key={slot}
                      className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    >
                      <input
                        type="radio"
                        name="timeSlot"
                        value={slot}
                        checked={form.timeSlot === slot}
                        onChange={handleChange}
                        disabled={disabled}
                        required
                        className="peer sr-only"
                      />
                      <span
                        className={`block rounded-xl border py-3 text-center text-sm font-bold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-red ${
                          isBooked
                            ? "border-white/5 bg-slate-900/40 text-slate-600"
                            : "border-white/10 bg-[#0b1120] text-white peer-enabled:hover:border-brand-red/60 peer-checked:border-brand-red peer-checked:bg-brand-red"
                        }`}
                      >
                        <span className={isBooked ? "line-through" : ""}>
                          {fmt12(slot)}
                        </span>
                        {isBooked && (
                          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide">
                            Booked
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
              {slotsLocked && (
                <p className="mt-2 text-xs text-slate-500">
                  Select doctor and date to see available slots.
                </p>
              )}
              {!slotsLocked && timeSlots.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Doctor is not available on this date. Please pick another day.
                </p>
              )}
            </fieldset>

            <Field label="Phone Number">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required
                className={fieldClass}
              />
            </Field>

            <Field label="Patient Full Name">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter Patient Full Name"
                required
                className={fieldClass}
              />
            </Field>

            {(submitError || dataError) && (
              <p className="sm:col-span-2 rounded-lg bg-red-950/60 px-4 py-3 text-sm text-red-300">
                {submitError || dataError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || dataLoading}
              className="rounded-xl bg-brand-red py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_25px_-5px_rgba(220,38,38,0.4)] transition-colors hover:bg-red-700 disabled:opacity-60 sm:col-span-2"
            >
              {saving ? "Booking..." : "Confirm Appointment Slot"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function BookingModal() {
  const { isOpen, prefill, closeBooking } = useBooking();

  if (!isOpen) return null;
  return <Dialog prefill={prefill} onClose={closeBooking} />;
}