import SiteMaster from "./sitemaster";
import Header from "./header";
import { BookingProvider } from "./booking-context";
import BookingModal from "./booking-modal";

export default function Layout({ children }) {
  return (
    <BookingProvider>
      <div className="content">
        <SiteMaster />
        <Header />
        {children}
      </div>
      <BookingModal />
    </BookingProvider>
  );
}