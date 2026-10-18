"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { facilitiesList } from "@/data/facilities";

export default function Facilities() {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [active, setActive] = useState(0);
  const [dots, setDots] = useState(1);

  // Ek step = ek card ki width + gap
  const getStep = () => {
    const el = scrollerRef.current;
    const card = el?.firstElementChild;
    if (!el || !card) return 1;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = getStep();
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
    setDots(Math.max(1, Math.round(maxScroll / step) + 1));
    setActive(Math.round(el.scrollLeft / step));
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scrollToIndex = (i) => {
    const el = scrollerRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * getStep(), behavior: reduce ? "auto" : "smooth" });
  };

  const go = (dir) => scrollToIndex(Math.max(0, Math.min(active + dir, dots - 1)));

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-brand-red hover:bg-brand-red hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red";

  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="px-25">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block border border-red-200 bg-red-50 text-red-700 text-sm font-bold tracking-wide uppercase px-4 py-2 rounded-full">
            Why Choose Us
          </span>
          <h2 className="mt-5 text-3xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Advanced Care Facilities{" "}
            
          </h2>
          <p className="mt-5 text-gray-600 text-base sm:text-lg leading-relaxed">
            Equipped with cutting-edge infrastructure to deliver safe, fast,
            and reliable care at every step.
          </p>
        </div>

        {/* Single row, swipe + arrows */}
        <div
          ref={scrollerRef}
          onScroll={update}
          tabIndex={0}
          role="region"
          aria-label="Hospital facilities"
          className="mt-14 flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-8 -my-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none"
        >
          {facilitiesList.map((facility) => {
            const Icon = facility.icon;
            return (
              <article
                key={facility.id}
                className="group snap-start shrink-0 basis-[85%] sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_3rem)/3)] rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-1 hover:border-brand-red/40 hover:shadow-[0_20px_40px_-14px_rgba(220,38,38,0.28)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 transition-colors duration-300 group-hover:bg-brand-red">
                  <Icon className="text-3xl text-brand-red transition-colors duration-300 group-hover:text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  {facility.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {facility.desc}
                </p>
              </article>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center justify-center gap-5">
          <button
            onClick={() => go(-1)}
            disabled={!canPrev}
            aria-label="Previous facilities"
            className={arrow}
          >
            <FaChevronLeft className="text-sm" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: dots }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to position ${i + 1}`}
                aria-current={i === active}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-8 bg-brand-red"
                    : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            disabled={!canNext}
            aria-label="Next facilities"
            className={arrow}
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>
    </section>
  );
}