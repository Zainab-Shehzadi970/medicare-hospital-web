import { useState } from "react";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaCalendarCheck,
} from "react-icons/fa";
import { FaRightToBracket } from "react-icons/fa6";
import { useBooking } from "./booking-context";
import PortalLoginModal from "./portal-login-modal";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About Us", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Doctors", href: "/#doctors" },
  { label: "Features", href: "/#features" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Contact Us", href: "/#emergency" },
];

export default function Header() {
  const { openBooking } = useBooking();
  const [portalOpen, setPortalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden lg:flex bg-black text-white justify-between items-center px-10 py-4 text-sm">
        <div className="flex items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          <p className="text-red-500 font-extrabold">
            24/7 TRAUMA & EMERGENCY DISPATCH ACTIVE
          </p>
          <p className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-brand-red" /> 124 Healthcare Blvd,
            Medical Zone, NY
          </p>
        </div>
        <div className="flex items-center gap-6">
          <p className="flex items-center gap-1 font-extrabold">
            <FaPhoneAlt className="text-brand-red animate-bounce" /> +1 (800)
            555-0199
          </p>
          <p className="flex items-center gap-1">
            <FaClock className="text-brand-red" /> OPD: 8:00 AM - 9:00 PM
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm">
        <div className="px-20 h-24 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Medicare Hospital"
              className="h-12 w-auto"
            />
            <div className="leading-tight">
              <p className="text-3xl font-extrabold text-brand-dark tracking-tight">
                MEDICARE
              </p>
              <p className="text-m font-semibold text-gray-500 tracking-widest">
                HOSPITAL
              </p>
            </div>
          </Link>

          <nav>
            <ul className="hidden lg:flex gap-13 list-none">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="nav-link text-lg text-black font-semibold hover:text-brand-red"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPortalOpen(true)}
              className="border border-gray-300 hover:border-brand-red text-gray-700 hover:text-brand-red font-bold text-medium px-4 py-3 rounded-lg flex items-center gap-2 bg-gray-50 hover:bg-white shadow-sm transition-all duration-200"
            >
              <FaRightToBracket className="text-brand-red" /> Portal Sign In
            </button>

            <button
              type="button"
              onClick={() => openBooking()}
              className="bg-brand-red hover:bg-red-700 text-white font-bold text-lg px-5 py-3 rounded-lg flex items-center gap-2 shadow-[0_10px_25px_-5px_rgba(220,38,38,0.4)] hover:shadow-xl transition-all duration-200"
            >
              <FaCalendarCheck /> Book Appointment
            </button>
          </div>
        </div>
      </div>
      <PortalLoginModal
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
      />
    </header>
  );
}