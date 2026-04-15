export default function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-semibold tracking-[2.5px] uppercase text-accent mb-4">
      {children}
    </span>
  );
}
