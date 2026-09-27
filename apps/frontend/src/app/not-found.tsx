import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          404 error
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-base text-slate-600">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}

