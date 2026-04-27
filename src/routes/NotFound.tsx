import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="grid h-screen place-items-center bg-paper px-6 text-ink">
      <div className="max-w-md text-center">
        <h1 className="font-display text-[56px] leading-none">404</h1>
        <p className="mt-3 text-[17px] text-ink-2">This canvas is not in the bundle.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full border border-accent/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-[border-color,transform] duration-150 ease-out hover:border-accent-ink active:scale-[0.97]"
        >
          home
        </Link>
      </div>
    </main>
  );
}
