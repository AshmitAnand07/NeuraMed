import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
            Manage Medicines. <br /> <span className="text-teal-600">Save Lives.</span>
          </h1>
          <p className="mt-8 text-xl leading-10 text-gray-600 font-medium">
            NeuraMed AI helps you track your medicine inventory, receive expiry alerts, and donate unexpired medicines to those in need.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link href="/register" className="w-full sm:w-auto rounded-2xl bg-teal-600 px-8 py-5 text-xl font-bold text-white shadow-md hover:bg-teal-500 hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 active:scale-95 text-center">
              Get Started
            </Link>
            <Link href="/how-it-works" className="w-full sm:w-auto text-xl font-bold leading-6 text-teal-700 bg-teal-50 px-8 py-5 rounded-2xl hover:bg-teal-100 transition-colors text-center shadow-sm">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
