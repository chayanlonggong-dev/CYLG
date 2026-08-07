export default function LogsFilters() {
  return (
    <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <input
          type="text"
          placeholder="Search logs..."
          className="rounded-xl border border-yellow-500/20 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-yellow-400"
        />

        <select className="rounded-xl border border-yellow-500/20 bg-[#050505] px-4 py-3 text-white outline-none">
          <option>All Actions</option>
          <option>LOGIN</option>
          <option>LOGOUT</option>
          <option>CREATE</option>
          <option>UPDATE</option>
          <option>DELETE</option>
          <option>SETTINGS_CHANGE</option>
        </select>

        <select className="rounded-xl border border-yellow-500/20 bg-[#050505] px-4 py-3 text-white outline-none">
          <option>All Status</option>
          <option>Success</option>
          <option>Warning</option>
          <option>Failed</option>
        </select>

        <select className="rounded-xl border border-yellow-500/20 bg-[#050505] px-4 py-3 text-white outline-none">
          <option>Today</option>
          <option>Yesterday</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>All Time</option>
        </select>

        <button className="rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400">
          Search
        </button>
      </div>
    </div>
  );
}