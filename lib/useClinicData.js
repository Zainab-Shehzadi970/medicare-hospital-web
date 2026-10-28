import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Same tables as the mobile app: departments, doctors, doctor_schedules
let cache = null;

async function fetchAll() {
  const [d, doc, sch] = await Promise.all([
    supabase.from("departments").select("id, name").order("name"),
    supabase
      .from("doctors")
      .select(
        "id, department_id, name, specialization, credentials, image_url, consultation_fee, slot_duration_minutes"
      )
      .order("name"),
    supabase.from("doctor_schedules").select("doctor_id, day_of_week, start_time, end_time"),
  ]);
  const err = d.error || doc.error || sch.error;
  if (err) throw err;
  return { departments: d.data, doctors: doc.data, schedules: sch.data };
}

export function useClinicData() {
  const [state, setState] = useState({
    departments: [],
    doctors: [],
    schedules: [],
    ...(cache || {}),
    loading: !cache,
    error: "",
  });

  useEffect(() => {
    let alive = true;
    fetchAll()
      .then((r) => {
        cache = r;
        if (alive) setState({ ...r, loading: false, error: "" });
      })
      .catch((e) => alive && setState((s) => ({ ...s, loading: false, error: e.message })));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

// ---- time helpers (same as the mobile app) ----
export const toMinutes = (t) => {
  const [h, m] = String(t).split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};
export const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
export const fmt12 = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Builds time slots from the doctor's schedule and the selected date
export function buildSlots(doctor, schedules, dateISO) {
  if (!doctor || !dateISO) return [];
  const dow = new Date(`${dateISO}T00:00:00`).getDay(); // 0 = Sunday
  const dur = doctor.slot_duration_minutes || 30;
  const now = new Date();
  const isToday = dateISO === todayISO();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const out = [];
  schedules
    .filter((x) => x.doctor_id === doctor.id && Number(x.day_of_week) === dow)
    .forEach((sch) => {
      const end = toMinutes(sch.end_time);
      for (let t = toMinutes(sch.start_time); t + dur <= end; t += dur) {
        if (isToday && t <= nowMins) continue;
        out.push(toHHMM(t));
      }
    });
  return [...new Set(out)].sort();
}