import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
