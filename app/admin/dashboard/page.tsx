export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-[#101010]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              CYLG ADMIN
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Dashboard
            </h1>
          </div>

          <button className="rounded-full border border-yellow-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-500 transition hover:bg-yellow-500 hover:text-black">
            Logout
          </button>

        </div>
      </header>

      {/* Dashboard Cards */}
      <section className="mx-auto max-w-7xl px-8 py-12">

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              Models
            </p>

            <h2 className="mt-5 text-5xl font-black">
              1
            </h2>

            <p className="mt-4 text-gray-400">
              Active Profiles
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              Contact
            </p>

            <h2 className="mt-5 text-5xl font-black">
              4
            </h2>

            <p className="mt-4 text-gray-400">
              Contact Channels
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              Website
            </p>

            <h2 className="mt-5 text-5xl font-black">
              ON
            </h2>

            <p className="mt-4 text-gray-400">
              Website Status
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              Version
            </p>

            <h2 className="mt-5 text-5xl font-black">
              1.0
            </h2>

            <p className="mt-4 text-gray-400">
              CYLG CMS
            </p>
          </div>

        </div>

      </section>

      {/* Management */}
      <section className="mx-auto max-w-7xl px-8 pb-16">

        <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-10">

          <h2 className="text-3xl font-black">
            Management
          </h2>

          <p className="mt-3 text-gray-400">
            Choose a module to manage your website.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <button className="rounded-2xl border border-yellow-500/20 bg-[#181818] p-8 text-left transition hover:border-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400">
                Website Settings
              </h3>

              <p className="mt-3 text-gray-400">
                Manage logo, contact and website information.
              </p>
            </button>

            <button className="rounded-2xl border border-yellow-500/20 bg-[#181818] p-8 text-left transition hover:border-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400">
                Models CMS
              </h3>

              <p className="mt-3 text-gray-400">
                Add, edit and manage model profiles.
              </p>
            </button>

            <button className="rounded-2xl border border-yellow-500/20 bg-[#181818] p-8 text-left transition hover:border-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400">
                Media Library
              </h3>

              <p className="mt-3 text-gray-400">
                Manage images and videos.
              </p>
            </button>

            <button className="rounded-2xl border border-yellow-500/20 bg-[#181818] p-8 text-left transition hover:border-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400">
                SEO
              </h3>

              <p className="mt-3 text-gray-400">
                Search engine optimization settings.
              </p>
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}