"use client";

import {
  useEffect,
  useState,
} from "react";

interface Session {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
}

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  async function loadSessions() {
    const res = await fetch("/api/admin/sessions");

    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions);
      setCurrentSessionId(data.currentSessionId);
    }
  }

  async function revokeSession(id: string) {
    const confirmDelete = confirm("Logout this device?");

    if (!confirmDelete) {
      return;
    }

    await fetch("/api/admin/sessions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: id,
      }),
    });

    loadSessions();
  }
async function logoutAllDevices() {
  const confirmed = confirm(
    "Logout ALL devices?"
  );

  if (!confirmed) return;

  await fetch("/api/admin/sessions", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "logoutAll",
    }),
  });

  window.location.href = "/admin/login";
}

async function logoutOtherDevices() {
  const confirmed = confirm(
    "Logout all other devices?"
  );

  if (!confirmed) return;

  await fetch("/api/admin/sessions", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "logoutOthers",
    }),
  });

  loadSessions();
}
  async function setup2FA() {
    const res = await fetch("/api/admin/2fa/setup", {
      method: "POST",
    });

    const data = await res.json();

    if (data.success) {
      setQrCode(data.qrCode);
      setTwoFactorMessage("Scan the QR code with your authenticator app.");
    } else {
      setTwoFactorEnabled(true);
      setTwoFactorMessage(data.message);
    }
  }

  async function verify2FA() {
    const res = await fetch("/api/admin/2fa/setup/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: twoFactorCode,
      }),
    });

    const data = await res.json();

    setTwoFactorMessage(data.message);

    if (data.success) {
      setTwoFactorEnabled(true);
      setQrCode("");
      setTwoFactorCode("");
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

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
          Manage administrator security.
        </p>

        {/* Two-Factor Authentication */}
        <section className="mt-12 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
          <h2 className="text-2xl font-bold text-yellow-400">
            Two-Factor Authentication
          </h2>

          {twoFactorEnabled ? (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-green-400">
              Two-Factor Authentication Enabled ✓
            </div>
          ) : (
            <>
              {!qrCode && (
                <button
                  onClick={setup2FA}
                  className="mt-6 rounded-xl border border-yellow-500/40 px-5 py-3 text-yellow-400"
                >
                  Generate QR Code
                </button>
              )}

              {qrCode && (
                <div className="mt-8">
                  <img
                    src={qrCode}
                    alt="2FA QR Code"
                    className="w-56 rounded-xl"
                  />

                  <input
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="6 digit code"
                    className="mt-6 rounded-xl border border-white/20 bg-black px-5 py-3"
                  />

                  <button
                    onClick={verify2FA}
                    className="ml-4 rounded-xl bg-yellow-500 px-6 py-3 text-black"
                  >
                    Verify
                  </button>
                </div>
              )}
            </>
          )}

          <p className="mt-5 text-gray-400">
            {twoFactorMessage}
          </p>
        </section>

        {/* Active Devices */}
        <section className="mt-12 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
          <h2 className="text-2xl font-bold text-yellow-400">
            Active Devices
          </h2>
<div className="mt-6 flex gap-4">

  <button
    onClick={logoutOtherDevices}
    className="rounded-xl border border-yellow-500 px-5 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
  >
    Logout All Other Devices
  </button>

  <button
    onClick={logoutAllDevices}
    className="rounded-xl border border-red-500 px-5 py-3 font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
  >
    Logout All Devices
  </button>

</div>
          <div className="mt-8 space-y-5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-2xl border border-white/10 bg-black p-6"
              >
                <p className="text-lg font-bold">
                  {session.id === currentSessionId
                    ? "Current Device"
                    : "Logged In Device"}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  IP: {session.ip || "Unknown"}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Browser: {session.userAgent || "Unknown"}
                </p>

                {session.id !== currentSessionId && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="mt-5 rounded-xl border border-red-500/40 px-5 py-3 text-red-400"
                  >
                    Logout
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
