export default function FirewallPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Firewall Center
        </h1>

        <p className="mt-4 text-gray-400">
          Website protection and network security.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Cloudflare
            </h2>

            <p className="mt-4 text-gray-400">
              CDN, WAF, DDoS Protection
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Hide Origin IP
            </h2>

            <p className="mt-4 text-gray-400">
              Prevent direct access to the server.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Security Headers
            </h2>

            <p className="mt-4 text-gray-400">
              HSTS, CSP, X-Frame-Options, Referrer Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}