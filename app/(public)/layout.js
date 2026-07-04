export default function PublicLayout({ children }) {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {children}
    </main>
  );
}