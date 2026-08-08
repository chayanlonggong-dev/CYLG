"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type FirewallBlockType =
  | "IP"
  | "COUNTRY";

interface FirewallBlock {
  id: string;
  type: FirewallBlockType;
  value: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FirewallStatistics {
  total: number;
  enabled: number;
  disabled: number;
  ip: number;
  country: number;
}

interface FirewallResponse {
  success: boolean;
  message?: string;
  blocks?: FirewallBlock[];
  statistics?: FirewallStatistics;
  data?: {
    blocks?: FirewallBlock[];
    statistics?: FirewallStatistics;
  };
}

export default function FirewallPage() {
  const [blocks, setBlocks] =
    useState<FirewallBlock[]>([]);

  const [statistics, setStatistics] =
    useState<FirewallStatistics>({
      total: 0,
      enabled: 0,
      disabled: 0,
      ip: 0,
      country: 0,
    });

  const [type, setType] =
    useState<FirewallBlockType>("IP");

  const [value, setValue] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================================
  // Load Firewall Blocks
  // =====================================================

  async function loadFirewall() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/firewall",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        (await response.json()) as FirewallResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load firewall."
        );
      }

      const nextBlocks =
        result.blocks ??
        result.data?.blocks ??
        [];

      const nextStatistics =
        result.statistics ??
        result.data?.statistics ?? {
          total: 0,
          enabled: 0,
          disabled: 0,
          ip: 0,
          country: 0,
        };

      setBlocks(nextBlocks);
      setStatistics(nextStatistics);
    } catch (err) {
      console.error(
        "Load firewall error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load firewall."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // Add Firewall Block
  // =====================================================

  async function addBlock(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedValue =
      value.trim();

    if (!normalizedValue) {
      setError(
        type === "IP"
          ? "Please enter an IP address."
          : "Please enter a country code."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/admin/firewall",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            type,
            value:
              type === "COUNTRY"
                ? normalizedValue.toUpperCase()
                : normalizedValue,
          }),
        }
      );

      const result =
        (await response.json()) as FirewallResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to create firewall block."
        );
      }

      setValue("");

      setMessage(
        type === "IP"
          ? "IP address blocked successfully."
          : "Country blocked successfully."
      );

      await loadFirewall();
    } catch (err) {
      console.error(
        "Create firewall block error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create firewall block."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // Toggle Firewall Block
  // =====================================================

  async function toggleBlock(
    block: FirewallBlock
  ) {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/admin/firewall",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: block.id,
            enabled: !block.enabled,
          }),
        }
      );

      const result =
        (await response.json()) as FirewallResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update firewall block."
        );
      }

      setMessage(
        !block.enabled
          ? "Firewall block enabled."
          : "Firewall block disabled."
      );

      await loadFirewall();
    } catch (err) {
      console.error(
        "Toggle firewall block error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update firewall block."
      );
    }
  }

  // =====================================================
  // Delete Firewall Block
  // =====================================================

  async function deleteBlock(
    block: FirewallBlock
  ) {
    const confirmed = window.confirm(
      `Delete ${block.type} block "${block.value}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/admin/firewall",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: block.id,
          }),
        }
      );

      const result =
        (await response.json()) as FirewallResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to delete firewall block."
        );
      }

      setMessage(
        "Firewall block deleted."
      );

      await loadFirewall();
    } catch (err) {
      console.error(
        "Delete firewall block error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete firewall block."
      );
    }
  }

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    loadFirewall();
  }, []);

  // =====================================================
  // Render
  // =====================================================

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-500">
            CYLG CMS
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Firewall Center
          </h1>

          <p className="mt-4 text-gray-400">
            Website protection and network
            security.
          </p>
        </div>

        {/* ================================================= */}
        {/* Status Messages */}
        {/* ================================================= */}

        {message && (
          <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* Statistics */}
        {/* ================================================= */}

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-7">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Total Blocks
            </p>

            <p className="mt-3 text-4xl font-black text-yellow-400">
              {statistics.total}
            </p>
          </div>

          <div className="rounded-3xl border border-green-500/20 bg-[#101010] p-7">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Enabled
            </p>

            <p className="mt-3 text-4xl font-black text-green-400">
              {statistics.enabled}
            </p>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-[#101010] p-7">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Disabled
            </p>

            <p className="mt-3 text-4xl font-black text-red-400">
              {statistics.disabled}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-[#101010] p-7">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              IP / Country
            </p>

            <p className="mt-3 text-3xl font-black">
              <span className="text-blue-400">
                {statistics.ip}
              </span>

              <span className="mx-2 text-gray-600">
                /
              </span>

              <span className="text-purple-400">
                {statistics.country}
              </span>
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* Add Block */}
        {/* ================================================= */}

        <section className="mt-10 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-yellow-400">
              Add Firewall Block
            </h2>

            <p className="text-gray-400">
              Block an IP address or country
              code.
            </p>
          </div>

          <form
            onSubmit={addBlock}
            className="mt-8 flex flex-col gap-4 lg:flex-row"
          >
            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target
                    .value as FirewallBlockType
                )
              }
              className="rounded-xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500 lg:w-48"
            >
              <option value="IP">
                IP Address
              </option>

              <option value="COUNTRY">
                Country
              </option>
            </select>

            <input
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
              placeholder={
                type === "IP"
                  ? "e.g. 192.168.1.100"
                  : "e.g. CN"
              }
              className="flex-1 rounded-xl border border-white/10 bg-black px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-yellow-500"
            />

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-yellow-500 px-7 py-4 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Adding..."
                : "Add Block"}
            </button>
          </form>
        </section>

        {/* ================================================= */}
        {/* Firewall Protection */}
        {/* ================================================= */}

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Cloudflare
            </h2>

            <p className="mt-3 text-gray-400">
              CDN, WAF and DDoS protection
              should be configured at the
              infrastructure layer.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Origin Protection
            </h2>

            <p className="mt-3 text-gray-400">
              Direct origin access should
              remain restricted in production.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Application Firewall
            </h2>

            <p className="mt-3 text-gray-400">
              IP, country and rate-limit
              rules are enforced by CYLG.
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* Firewall Blocks */}
        {/* ================================================= */}

        <section className="mt-10 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">
                Firewall Rules
              </h2>

              <p className="mt-2 text-gray-400">
                Manage active IP and country
                blocks.
              </p>
            </div>

            <button
              type="button"
              onClick={loadFirewall}
              disabled={loading}
              className="rounded-xl border border-yellow-500/40 px-5 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-500 hover:text-black disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading firewall rules...
            </div>
          ) : blocks.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/5 bg-black/30 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-gray-300">
                No firewall blocks configured.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Add an IP address or country
                code above.
              </p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-700px border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-gray-500">
                    <th className="px-4 py-4">
                      Type
                    </th>

                    <th className="px-4 py-4">
                      Value
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-4 py-4">
                      Created
                    </th>

                    <th className="px-4 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {blocks.map((block) => (
                    <tr
                      key={block.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-4 py-5">
                        <span
                          className={
                            block.type ===
                            "IP"
                              ? "rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400"
                              : "rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400"
                          }
                        >
                          {block.type}
                        </span>
                      </td>

                      <td className="px-4 py-5 font-mono text-sm text-white">
                        {block.value}
                      </td>

                      <td className="px-4 py-5">
                        {block.enabled ? (
                          <span className="text-sm font-semibold text-green-400">
                            Enabled
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-500">
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-5 text-sm text-gray-500">
                        {new Date(
                          block.createdAt
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              toggleBlock(
                                block
                              )
                            }
                            className={
                              block.enabled
                                ? "rounded-lg border border-gray-500/30 px-4 py-2 text-sm text-gray-400 transition hover:border-yellow-500 hover:text-yellow-400"
                                : "rounded-lg border border-green-500/30 px-4 py-2 text-sm text-green-400 transition hover:bg-green-500/10"
                            }
                          >
                            {block.enabled
                              ? "Disable"
                              : "Enable"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteBlock(
                                block
                              )
                            }
                            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}