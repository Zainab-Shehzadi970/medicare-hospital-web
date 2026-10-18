"use client";

import { useRef, useEffect, useState } from "react";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaPause,
  FaPlay,
} from "react-icons/fa6";
import { testimonialsList } from "@/data/testimonials";

const GAP = 24; // gap-6


const loopList = [...testimonialsList, ...testimonialsList];

export default function Testimonials() {
  const trackRef = useRef(null);
  const isPaused = useRef(false); // hover par pause
  const [userPaused, setUserPaused] = useState(false); // button se pause

  // direction: 1 = next, -1 = previous
  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const step = track.firstElementChild.getBoundingClientRect().width + GAP;
    const setWidth = step * testimonialsList.length; // ek poori list ki chorai

    
    if (direction === 1 && track.scrollLeft >= setWidth - 2) {
      track.scrollLeft -= setWidth;
    }
    if (direction === -1 && track.scrollLeft < step / 2) {
      track.scrollLeft += setWidth;
    }

    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  // Auto scroll: har 5 second baad ek card
  useEffect(() => {
    if (userPaused) return;
    const interval = setInterval(() => {
      if (!isPaused.current) scroll(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [userPaused]);

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-[#0b1120]">
      <div className="px-25">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block bg-red-950/40 text-red-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-red-900/50">
            Patient Voices
          </span>
          <h2 className="mt-5 text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Trusted By Thousands Of Families
          </h2>
        </div>

        <div className="flex justify-end gap-2 mt-10">
          <button
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Play auto scroll" : "Pause auto scroll"}
            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-brand-red hover:text-brand-red transition-colors"
          >
            {userPaused ? <FaPlay size={12} /> : <FaPause size={12} />}
          </button>
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-brand-red hover:text-brand-red transition-colors"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-brand-red hover:text-brand-red transition-colors"
          >
            <FaChevronRight size={14} />
          </button>
        </div>

        <div
          ref={trackRef}
          onMouseEnter={() => (isPaused.current = true)}
          onMouseLeave={() => (isPaused.current = false)}
          className="mt-4 flex gap-6 pb-2 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loopList.map((testimonial, i) => (
            <div
              key={`${testimonial.id}-${i}`}
              aria-hidden={i >= testimonialsList.length}
              className="snap-start shrink-0 w-[85%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] flex flex-col bg-slate-900/60 rounded-2xl p-7 border border-slate-800"
            >
              <div className="flex gap-0.5 text-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={
                      star <= testimonial.rating
                        ? "text-amber-400"
                        : "text-slate-700"
                    }
                  />
                ))}
              </div>

              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="mt-auto pt-5 flex items-center gap-3">
                <div className="w-11 h-11 shrink-0 rounded-full bg-red-950/60 text-red-300 text-sm font-bold flex items-center justify-center">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}