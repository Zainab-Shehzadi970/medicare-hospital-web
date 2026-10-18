import { FaPhoneVolume } from "react-icons/fa6";

export default function Emergency() {
  return (
    <section
      id="emergency"
      className="py-12 lg:py-16 bg-[#0a0a0a] border-y border-white/10"
    >
      <div className="px-25">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-red-900 to-brand-red px-8 py-10 sm:px-12 sm:py-12">
          <div>
            <span className="inline-block bg-black/30 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
              24/7 Critical Response
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Medical Emergency? Call Immediately
            </h2>
            <p className="mt-2 text-red-100 text-base">
              GPS Ambulance Dispatch &amp; Critical Resuscitation Team Active
            </p>
          </div>

          <a
            href="tel:+18005550199"
            className="inline-flex w-fit shrink-0 items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <FaPhoneVolume className="text-brand-red" />
            +1 (800) 555-0199
          </a>
        </div>
      </div>
    </section>
  );
}