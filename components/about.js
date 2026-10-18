import { FaCircleCheck } from "react-icons/fa6";

const features = [
  { title: "24/7 Critical Trauma", desc: "Instant ER resuscitation units" },
  { title: "Robotic Surgeries", desc: "Sub-millimeter surgical accuracy" },
  { title: "100,000+ Patients", desc: "Treated annually across all units" },
  { title: "50+ Specialists", desc: "Board-certified clinical experts" },
];

export default function About() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-white">
      <div className="px-25">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 relative">
            <img
              src="/images/about-us.jpg"
              alt="Medicare Hospital reception"
              className="relative rounded-3xl shadow-xl w-full h-[480px] object-cover"
            />
            <div className="absolute bottom-6 -right-6 bg-white rounded-2xl shadow-2xl px-6 py-4 border border-gray-100 hidden sm:block">
              <p className="text-3xl font-black text-brand-red">24+</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Years of Trust
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <span className="inline-block border-red-800 bg-red-50 text-brand-red text-xs font-bold tracking-wide uppercase px-4 py-2 rounded-full">
              About Medicare Hospital
            </span>

            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Delivering World-Class Healthcare{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-red-600">
                With Excellence
              </span>
            </h2>

            <p className="mt-5 text-gray-600 text-base sm:text-lg leading-relaxed">
              Established in 2001, Medicare Hospital has grown into a
              premier healthcare institution. Equipped with multi-specialty
              ICU wings, modern cath labs, and advanced surgical robotics,
              we treat over 100,000 patients annually.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-7">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="bg-red-50 rounded-full p-1.5 mt-0.5 shrink-0">
                    <FaCircleCheck className="text-brand-red text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {feature.title}
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}