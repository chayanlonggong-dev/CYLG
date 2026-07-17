"use client";

import { useState } from "react";
import { websiteSettings } from "@/app/data/websiteSettings";

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState(websiteSettings);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-[#101010]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">

          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              CYLG ADMIN
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Website Settings
            </h1>
          </div>

          <button
            className="rounded-full border border-yellow-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
          >
            Save Changes
          </button>

        </div>
      </header>

      <section className="mx-auto max-w-6xl px-8 py-12">

        <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-10">

          {/* Website Name */}
          <div className="mb-8">
            <label className="mb-3 block uppercase tracking-[0.2em] text-yellow-500 text-sm">
              Website Name
            </label>

            <input
              type="text"
              value={settings.websiteName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  websiteName: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* WhatsApp */}
          <div className="mb-8">
            <label className="mb-3 block uppercase tracking-[0.2em] text-yellow-500 text-sm">
              WhatsApp
            </label>

            <input
              type="text"
              value={settings.whatsapp}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  whatsapp: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* Telegram */}
          <div className="mb-8">
            <label className="mb-3 block uppercase tracking-[0.2em] text-yellow-500 text-sm">
              Telegram
            </label>

            <input
              type="text"
              value={settings.telegram}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  telegram: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* Signal */}
          <div className="mb-8">
            <label className="mb-3 block uppercase tracking-[0.2em] text-yellow-500 text-sm">
              Signal
            </label>

            <input
              type="text"
              value={settings.signal}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  signal: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* Feedback Email */}
          <div className="mb-10">
            <label className="mb-3 block uppercase tracking-[0.2em] text-yellow-500 text-sm">
              Feedback Email
            </label>

            <input
              type="email"
              value={settings.feedbackEmail}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  feedbackEmail: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* Contact Switches */}
          <div className="border-t border-yellow-500/20 pt-10">

            <h2 className="mb-8 text-2xl font-bold">
              Contact Channels
            </h2>

            <div className="space-y-5">

              <label className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-[#181818] px-6 py-5">
                <span>Enable WhatsApp</span>

                <input
                  type="checkbox"
                  checked={settings.contact.enableWhatsApp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: {
                        ...settings.contact,
                        enableWhatsApp: e.target.checked,
                      },
                    })
                  }
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-[#181818] px-6 py-5">
                <span>Enable Telegram</span>

                <input
                  type="checkbox"
                  checked={settings.contact.enableTelegram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: {
                        ...settings.contact,
                        enableTelegram: e.target.checked,
                      },
                    })
                  }
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-[#181818] px-6 py-5">
                <span>Enable Signal</span>

                <input
                  type="checkbox"
                  checked={settings.contact.enableSignal}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: {
                        ...settings.contact,
                        enableSignal: e.target.checked,
                      },
                    })
                  }
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-[#181818] px-6 py-5">
                <span>Enable Feedback Email</span>

                <input
                  type="checkbox"
                  checked={settings.contact.enableFeedbackEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: {
                        ...settings.contact,
                        enableFeedbackEmail: e.target.checked,
                      },
                    })
                  }
                />
              </label>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}