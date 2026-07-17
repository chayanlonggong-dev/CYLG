"use client";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-3xl border border-yellow-500/20 bg-[#101010] p-10 shadow-2xl">

        {/* Logo */}
        <div className="text-center">

          <p className="uppercase tracking-[0.45em] text-yellow-500 text-sm">
            CYLG
          </p>

          <h1 className="mt-4 text-4xl font-black text-white">
            Admin Login
          </h1>

          <p className="mt-4 text-gray-400 leading-7">
            ChaYanLongGong Management System
          </p>

        </div>

        {/* Username */}
        <div className="mt-10">

          <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
            Username
          </label>

          <input
            type="text"
            placeholder="Enter username"
            className="w-full rounded-2xl border border-yellow-500/20 bg-[#161616] px-5 py-4 text-white outline-none transition focus:border-yellow-500"
          />

        </div>

        {/* Password */}
        <div className="mt-6">

          <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            className="w-full rounded-2xl border border-yellow-500/20 bg-[#161616] px-5 py-4 text-white outline-none transition focus:border-yellow-500"
          />

        </div>

        {/* Login Button */}
        <button
          className="mt-10 w-full rounded-full border border-yellow-500 bg-transparent py-4 font-bold uppercase tracking-[0.3em] text-yellow-500 transition duration-300 hover:bg-yellow-500 hover:text-black"
        >
          Login
        </button>

        {/* Footer */}
        <p className="mt-10 text-center text-sm text-gray-500">
          CYLG Admin CMS v1.0
        </p>

      </div>

    </main>
  );
}