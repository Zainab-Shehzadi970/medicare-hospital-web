"use client";

import { useEffect, useState } from "react";
import { FaCalendarCheck, FaXmark, FaCircleCheck } from "react-icons/fa6";
import { useBooking } from "./booking-context";
import { departmentslist } from "@/data/services";
import { doctors } from "@/data/doctors";
import { getBookedSlots } from "@/data/booked-slots";

// TODO(backend): slots baad mein doctor + date ke hisaab se API se aayenge
const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
];

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

// Doctor card se sirf doctorId aaye to department bhi khud nikal leta hai
function getInitialForm({ departmentId, doctorId, date } = {}) {
  const doctor = doctors.find((d) => d.id === doctorId);
  const department =
    departmentId ??
    departmentslist.find((d) => d.name === doctor?.specialty)?.id;

  return {
    ...emptyForm,
    departmentId: department ?? "",
    doctorId: doctor?.id ?? "",
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
  // Dialog har dafa naya mount hota hai, isliye prefill seedha initial state ban jata hai
  const [form, setForm] = useState(() => getInitialForm(prefill));
  const [submitted, setSubmitted] = useState(false);

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

  // Form mein ids hain, naam sirf screen par dikhane ke liye nikalte hain
  const department = departmentslist.find((d) => d.id === form.departmentId);
  const doctor = doctors.find((d) => d.id === form.doctorId);
  const departmentDoctors = doctors.filter(
    (doc) => doc.specialty === department?.name
  );

  // Slots tab dikhte hain jab doctor chuna ho; booked slots disabled hote hain
  const bookedSlots = getBookedSlots(form.doctorId);
  const slotsLocked = !form.doctorId || !form.date;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
        // department badle to doctor dobara chunna parega
        ...(name === "departmentId" && { doctorId: "" }),
      };
      // doctor badalne par chuna hua slot booked nikle to hata do
      return getBookedSlots(next.doctorId).includes(next.timeSlot)
        ? { ...next, timeSlot: "" }
        : next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Appointment request:", form); // baad mein yahan API call lagegi
    setSubmitted(true);
  };

  const today = new Date().toISOString().split("T")[0];

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

        {submitted ? (
          <div className="py-12 text-center">
            <FaCircleCheck className="mx-auto text-6xl text-emerald-500" />
            <h3 className="mt-6 text-2xl font-bold text-white">
              Appointment Requested
            </h3>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-400">
              {form.name}, your {department?.name} appointment with{" "}
              {doctor?.name} on {form.date} at {form.timeSlot} has been
              received. We will confirm on {form.phone}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 rounded-xl bg-brand-red px-10 py-3.5 font-bold text-white transition-colors hover:bg-red-700"
            >
              Close
            </button>
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
                {departmentslist.map((dept) => (
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
                  const isBooked = bookedSlots.includes(slot);
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
                          {slot}
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

            <button
              type="submit"
              className="rounded-xl bg-brand-red py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_25px_-5px_rgba(220,38,38,0.4)] transition-colors hover:bg-red-700 sm:col-span-2"
            >
              Confirm Appointment Slot
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