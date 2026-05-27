export default function StepTitle({ children }) {
  return (
    <div className="flex items-center gap-6 mb-10">
      <div className="w-1 h-12 bg-primary" />
      <h2 className="font-headline text-5xl font-bold italic tracking-tight">
        {children}
      </h2>
    </div>
  );
}
