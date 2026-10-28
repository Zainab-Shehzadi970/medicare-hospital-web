import { useBooking } from "./booking-context";

export default function DoctorCard({ doctor, departmentName }) {
  const { id, name, specialization, credentials, image_url } = doctor;
  const { openBooking } = useBooking();

  return (
    <div className="group snap-start shrink-0 w-[85%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)] rounded-2xl overflow-hidden bg-slate-900/85 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-red-600/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.25)]">
      <div className="h-72 bg-slate-900 overflow-hidden flex items-center justify-center">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl font-bold text-slate-700">
            {name.replace(/^dr\.?\s*/i, "").charAt(0)}
          </span>
        )}
      </div>

      <div className="p-5">
        <span className="text-[13px] font-bold text-red-700 uppercase tracking-wider">
          {specialization || departmentName}
        </span>
        <h4 className="text-lg font-bold text-white mt-1">{name}</h4>
        {credentials && <p className="text-xs text-slate-400">{credentials}</p>}
        <button
          type="button"
          onClick={() => openBooking({ doctorId: id })}
          className="w-full mt-4 bg-zinc-950 hover:bg-red-800 text-white border border-slate-800 py-2.5 rounded-xl font-bold text-xs transition-all"
        >
          Book Consultation
        </button>
      </div>
    </div>
  );
}