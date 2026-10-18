import Image from "next/image";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Services & Wings", href: "#services" },
  { label: "Doctors Faculty", href: "#doctors" },
  { label: "FAQ", href: "#faq" },
];

const linkClass =
  "text-sm text-gray-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red";

function ColumnTitle({ children }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
      {children}
    </h3>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#050914]">
      <div className="px-25 pt-16 pb-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <a
              href="#home"
              aria-label="Medicare Hospital home"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1.5">
                <Image
                  src="/images/logo.png"
                  alt=""
                  width={46}
                  height={46}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="leading-none">
                <span className="block text-2xl font-black tracking-tight text-white">
                  MEDICARE
                </span>
                <span className="mt-1 block text-[10px] font-semibold tracking-[0.25em] text-gray-400">
                  HOSPITAL
                </span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-gray-400">
              Precision tertiary medical care backed by senior clinical faculty
              and state-of-the-art robotic infrastructure.
            </p>
          </div>

          {/* Quick navigation */}
          <nav aria-label="Footer">
            <ColumnTitle>Quick Navigation</ColumnTitle>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <ColumnTitle>Contact Info</ColumnTitle>
            <address className="mt-5 space-y-3 text-sm not-italic text-gray-400">
              <p>124 Healthcare Blvd, Medical Zone, NY</p>
              <p>
                <a
                  href="tel:+18005550199"
                  className="font-semibold text-red-500 transition-colors hover:text-red-400"
                >
                  +1 (800) 555-0199
                </a>
              </p>
              <p>
                <a
                  href="mailto:support@medicarehospital.org"
                  className={linkClass}
                >
                  support@medicarehospital.org
                </a>
              </p>
            </address>
          </div>

          {/* OPD hours */}
          <div>
            <ColumnTitle>OPD Hours</ColumnTitle>
            <ul className="mt-5 space-y-3 text-sm text-gray-400">
              <li>Monday - Saturday: 8:00 AM - 9:00 PM</li>
              <li>Sunday OPD: 9:00 AM - 2:00 PM</li>
              <li className="font-semibold text-red-500">
                Emergency Trauma: 24/7 Active
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Medicare Hospital. All Rights
          Reserved. Designed for Excellence.
        </div>
      </div>
    </footer>
  );
}