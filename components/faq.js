"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { faqList } from "@/data/faq";

export default function Faq() {
  const [openId, setOpenId] = useState(null);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-gray-50">
      <div className="px-10 max-w-5xl mx-auto">
        <div className="text-center">
          <span className="inline-block border border-red-200 bg-red-50 text-brand-red text-xs font-bold tracking-wide uppercase px-4 py-2 rounded-full">
            Got Questions?
          </span>
          <h2 className="mt-5 text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-5 text-gray-600 text-base sm:text-lg leading-relaxed">
            Quick answers to the things patients ask us most.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqList.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-bold text-gray-900 text-base">
                    {faq.question}
                  </span>
                  <FaChevronDown
                    className={`text-brand-red shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}