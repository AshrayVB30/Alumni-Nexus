import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-8xl font-black text-zinc-100 select-none">404</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Page not found</h1>
          <p className="text-sm text-zinc-500 font-medium">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
