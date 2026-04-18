export default function AuthLayout({ children }) {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center px-6">
      {children}
    </div>
  );
}
