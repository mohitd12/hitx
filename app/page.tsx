import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-6 rounded-lg shadow surface bg-surface">
        <h1 className="text-2xl font-bold">Minimal Next.js theme starter</h1>
        <p className="mt-2">Customizable fonts, colors and theme switching.</p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>
    </main>
  );
}
