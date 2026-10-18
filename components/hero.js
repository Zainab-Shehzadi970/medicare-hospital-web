"use client";

import { useState, useEffect } from "react";
import { useBooking } from "./booking-context";
import { departmentslist } from "@/data/services";
import {
  FaCalendarCheck,
  FaPhoneVolume,
  FaMagnifyingGlass,
  FaArrowRight,
  FaStar,
} from "react-icons/fa6";

const heroImages = [
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
  "/images/hero-3.jpg",
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);
  const [departmentId, setDepartmentId] = useState("");
  const [date, setDate] = useState("");
  const { openBooking } = useBooking();

  const handleSearch = (e) => {
    e.preventDefault();
    openBooking({ departmentId, date });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative overflow-hidden py-16 lg:py-24">
      {heroImages.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${img}')` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 px-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red"></span>
              </span>
              <span className="text-white text-xs font-bold tracking-wide">
                JCI & NABH Accredited Super-Specialty Hospital
              </span>
            </div>

<h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
  Advanced Healthcare for Your <br className="hidden sm:inline" />
  <span className="text-brand-red">
    Most Precious Asset.
  </span>
</h1>

            <p className="text-gray-200 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Top-rated specialists, AI-guided diagnostics, and 24/7 critical
              trauma response—delivering world-class healthcare you can count
              on.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => openBooking()}
                className="bg-brand-red hover:bg-red-700 text-white font-bold px-7 py-4 rounded-2xl text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
              >
                <FaCalendarCheck className="shrink-0 -translate-y-px" /> Book
                Consultation
              </button>
              <a
                href="tel:18005550199"
                className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-bold px-7 py-4 rounded-2xl text-sm border border-white/50 transition-all duration-300 flex items-center justify-center gap-2.5"
              >
                <FaPhoneVolume className="text-brand-red animate-pulse" />{" "}
                Emergency: 24/7
              </a>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <img
                    src="/images/avatar-1.png"
                    alt="Patient"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="/images/avatar-2.jpg"
                    alt="Patient"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="/images/avatar-3.jpg"
                    alt="Patient"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="flex text-amber-400 text-xs gap-0.5">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <p className="text-xs font-semibold text-gray-300 mt-0.5">
                    4.9/5 Rating (50k+ Patients)
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-white/30 hidden sm:block"></div>

              <div>
                <p className="text-xl font-black text-white">100+</p>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                  SENIOR DOCTORS
                </p>
              </div>

              <div>
                <p className="text-xl font-black text-brand-red">15 Min</p>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                  AVG ER RESPONSE
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 lg:mt-19">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FaMagnifyingGlass className="text-brand-red" />
                  Quick OPD Slot Search
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full">
                  Live Status
                </span>
              </div>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                    1. Select Specialization Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-brand-red"
                  >
                    <option value="">Choose Department</option>
                    {departmentslist.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                    2. Preferred Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-brand-red"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider mt-2"
                >
                  <span>Find Available Doctors & Slots</span>
                  <FaArrowRight />
                </button>
                <div className="flex items-center justify-between mt-4 text-[11px] font-semibold text-gray-500">
                  {" "}
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                    Instant Booking
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>{" "}
                    Zero Waiting Time
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}