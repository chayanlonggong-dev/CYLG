export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Security Center
        </h1>

        <p className="mt-4 text-gray-400">
          Protect your CMS and website.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Login Protection
            </h2>

            <p className="mt-4 text-gray-400">
              5 failed login attempts require 2FA verification.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Two-Factor Authentication
            </h2>

            <p className="mt-4 text-gray-400">
              Google Authenticator / Authy support.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              IP Protection
            </h2>

            <p className="mt-4 text-gray-400">
              Hide server IP and enable Cloudflare protection.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}