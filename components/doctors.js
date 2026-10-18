"use client";

import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { doctors } from "../data/doctors";
import DoctorCard from "./doctor-card";

const filters = ["All Doctors", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology"];

export default function Doctors() {
  const trackRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("All Doctors");

  const filteredDoctors =
    activeFilter === "All Doctors"
      ? doctors
      : doctors.filter((doc) => doc.specialty === activeFilter);

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    trackRef.current?.scrollTo({ left: 0 });
  };

  const scroll = (direction) => {
    const track = trackRef.current;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  return (
    <section id="doctors" className="py-20 bg-zinc-950 text-white">
      <div className="px-25">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-extrabold text-red-700 tracking-widest uppercase bg-red-600/10 px-3.5 py-1.5 rounded-full border border-red-600/20">
            Senior Medical Faculty
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold mt-5 ">
            Consult Board-Certified Specialists
          </h2>
          <p className="text-slate-400 mt-4 text-sm">
            Direct access to internationally trained clinical leaders.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeFilter === filter
                    ? "bg-red-800 text-white"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-8">
          <button
            onClick={() => scroll(-1)}
            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-red-600 hover:text-red-500 transition-colors"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-red-600 hover:text-red-500 transition-colors"
          >
            <FaChevronRight size={14} />
          </button>
        </div>

        <div
          ref={trackRef}
          className="flex gap-6 pt-4 pb-8 overflow-x-auto snap-x snap-proximity  scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <p className="text-center text-slate-400">No doctors found in this department.</p>
        )}
      </div>
    </section>
  );
}