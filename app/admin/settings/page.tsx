"use client";

import { useEffect, useState } from "react";

type WebsiteSettingsState = {
  siteName: string;
  logo: string;
  whatsapp: string;
  telegram: string;
  signal: string;
  email: string;
  enableWhatsApp: boolean;
  enableTelegram: boolean;
  enableSignal: boolean;
  enableFeedbackEmail: boolean;
};

const emptySettings: WebsiteSettingsState = {
  siteName: "ChaYanLongGong",
  logo: "",
  whatsapp: "",
  telegram: "",
  signal: "",
  email: "",
  enableWhatsApp: true,
  enableTelegram: true,
  enableSignal: true,
  enableFeedbackEmail: true,
};

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<WebsiteSettingsState>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();

        setSettings({
          ...emptySettings,
          ...data,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings.");
      }

      setMessage("Settings saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save settings right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-500/20 bg-[#101010]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">CYLG ADMIN</p>
            <h1 className="mt-2 text-3xl font-black">Website Settings</h1>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full border border-yellow-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-500 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-8 py-12">
        <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-10">
          {loading ? (
            <p className="text-gray-400">Loading settings...</p>
          ) : (
            <>
              <div className="mb-8">
                <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                  Website Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(event) => setSettings({ ...settings, siteName: event.target.value })}
                  className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div className="mb-8">
                <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={settings.logo}
                  onChange={(event) => setSettings({ ...settings, logo: event.target.value })}
                  className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div className="mb-8">
                <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(event) => setSettings({ ...settings, whatsapp: event.target.value })}
                  className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div className="mb-8">
                <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                  Telegram
                </label>
                <input
                  type="text"
                  value={settings.telegram}
                  onChange={(event) => setSettings({ ...settings, telegram: event.target.value })}
                  className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div className="mb-8">
                <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                  Signal
                </label>
                <input
                  type="text"
                  value={settings.signal}
                  onChange={(event) => setSettings({ ...settings, signal: event.target.value })}
                  className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div className="mb-10">
                <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                  Feedback Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(event) => setSettings({ ...settings, email: event.target.value })}
                  className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div className="border-t border-yellow-500/20 pt-10">
                <h2 className="mb-8 text-2xl font-bold">Contact Channels</h2>

                <div className="space-y-5">
                  <label className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-[#181818] px-6 py-5">
                    <span>Enable WhatsApp</span>
                    <input
                      type="checkbox"
                      checked={settings.enableWhatsApp}
                      onChange={(event) => setSettings({ ...settings, enableWhatsApp: event.target.checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-[#181818] px-6 py-5">
                    <span>Enable Telegram</span>
                    <input
                      type="checkbox"
                      checked={settings.enableTelegram}
                      onChange={(event) => setSettings({ ...settings, enableTelegram: event.target.checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-[#181818] px-6 py-5">
                    <span>Enable Signal</span>
                    <input
                      type="checkbox"
                      checked={settings.enableSignal}
                      onChange={(event) => setSettings({ ...settings, enableSignal: event.target.checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-[#181818] px-6 py-5">
                    <span>Enable Feedback Email</span>
                    <input
                      type="checkbox"
                      checked={settings.enableFeedbackEmail}
                      onChange={(event) => setSettings({ ...settings, enableFeedbackEmail: event.target.checked })}
                    />
                  </label>
                </div>
              </div>

              {message ? <p className="mt-8 text-sm text-yellow-500">{message}</p> : null}
            </>
          )}
        </div>
      </section>
    </main>
  );
}