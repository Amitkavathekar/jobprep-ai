"use client"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ reset }: ErrorProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-4 text-base text-slate-600">
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
