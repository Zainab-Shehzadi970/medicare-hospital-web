"use client";

import { departmentslist } from "@/data/services";
import { useState } from "react";
import { useBooking } from "./booking-context";

export default function Services() {
  const [activeId, setActiveId] = useState(departmentslist[0].id);
  const active = departmentslist.find((dept) => dept.id === activeId);
  const { openBooking } = useBooking();

  return (
    <section id="services" className="py-20 lg:py-28 bg-gray-50">
      <div className="px-25">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block border border-red-700 bg-red-50 text-brand-red text-xs font-bold tracking-wide uppercase px-4 py-2 rounded-full">
            Clinical Excellence
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Specialized Medical Wings
          </h2>
          <p className="mt-3 text-gray-500 text-base">
            Comprehensive tertiary care departments managed by senior clinical directors.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {departmentslist.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveId(dept.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeId === dept.id
                  ? "bg-brand-red text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-brand-red hover:text-brand-red"
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-sm font-bold text-brand-red uppercase tracking-wide">
                {active.label}
              </span>
              <h3 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                {active.title}
              </h3>
              <p className="mt-4 text-gray-600 text-base leading-relaxed">
                {active.desc}
              </p>
              <button
                type="button"
                onClick={() => openBooking({ departmentId: active.id })}
                className="mt-7 bg-gray-900 hover:bg-brand-red text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-colors"
              >
                {active.ctaText}
              </button>
            </div>

            <img
              src={active.image}
              alt={active.title}
              className="w-full h-[320px] sm:h-[380px] object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}