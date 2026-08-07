"use client";

import {
  useEffect,
  useState,
} from "react";

interface Settings {
  siteName: string;
  logo: string;
  favicon: string;
  whatsapp: string;
  telegram: string;
  signal: string;
  line: string;
  wechatQr: string;
  email: string;
  enableWhatsapp: boolean;
  enableTelegram: boolean;
  enableSignal: boolean;
  enableLine: boolean;
  enableWechat: boolean;
  enableFeedbackEmail: boolean;
}

const defaultSettings: Settings = {
  siteName: "",
  logo: "",
  favicon: "",
  whatsapp: "",
  telegram: "",
  signal: "",
  line: "",
  wechatQr: "",
  email: "",
  enableWhatsapp: true,
  enableTelegram: true,
  enableSignal: false,
  enableLine: false,
  enableWechat: false,
  enableFeedbackEmail: true,
};

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();

        if (data) {
          setSettings({
            ...defaultSettings,
            ...data,
          });
        }
      } catch (error) {
        console.error(error);
      }
    }

    load();
  }, []);

  function update(
    key: keyof Settings,
    value: any
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function save() {
    try {
      setLoading(true);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Save failed.");
      }

      alert("Settings Saved");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Save failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function uploadFavicon(file: File) {
    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/favicon", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Upload failed."
        );
      }

      update("favicon", data.url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function uploadWechatQr(file: File) {
    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/wechat", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Upload failed."
        );
      }

      update("wechatQr", data.url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteWechatQr() {
    try {
      setDeleting(true);
      setError("");

      const response = await fetch("/api/settings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: "wechatQr",
          path: settings.wechatQr,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Delete failed."
        );
      }

      update("wechatQr", "");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Delete failed."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black py-20 text-white">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-yellow-500/30 bg-[#111] p-10">
        <h1 className="mb-10 text-4xl font-bold text-yellow-400">
          Website Settings
        </h1>

        {/* Favicon */}
        <div className="mt-8 rounded-2xl border border-yellow-500/20 p-5">
          <label className="mb-3 block text-sm text-yellow-400">
            Favicon
          </label>

          <input
            type="file"
            accept="image/*,.ico"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                uploadFavicon(file);
              }
            }}
            className="w-full text-white"
          />

          {settings.favicon && (
            <img
              src={settings.favicon}
              alt="Favicon"
              className="mt-5 h-20 w-20 rounded-xl"
            />
          )}

          {uploading && (
            <p className="mt-3 text-yellow-400">
              Uploading...
            </p>
          )}

          {error && (
            <p className="mt-3 text-red-400">
              {error}
            </p>
          )}
        </div>

        <Input
          label="Site Name"
          value={settings.siteName}
          onChange={(v) => update("siteName", v)}
        />

        <Input
          label="WhatsApp"
          value={settings.whatsapp}
          onChange={(v) => update("whatsapp", v)}
        />

        <Toggle
          label="Enable WhatsApp"
          checked={settings.enableWhatsapp}
          onChange={(v) => update("enableWhatsapp", v)}
        />

        <Input
          label="Telegram"
          value={settings.telegram}
          onChange={(v) => update("telegram", v)}
        />

        <Toggle
          label="Enable Telegram"
          checked={settings.enableTelegram}
          onChange={(v) => update("enableTelegram", v)}
        />

        <Input
          label="Signal"
          value={settings.signal}
          onChange={(v) => update("signal", v)}
        />

        <Toggle
          label="Enable Signal"
          checked={settings.enableSignal}
          onChange={(v) => update("enableSignal", v)}
        />

        <Input
          label="LINE"
          value={settings.line}
          onChange={(v) => update("line", v)}
        />

        <Toggle
          label="Enable LINE"
          checked={settings.enableLine}
          onChange={(v) => update("enableLine", v)}
        />

        {/* WeChat QR Code */}
        <div className="mt-8 rounded-2xl border border-yellow-500/20 p-5">
          <label className="mb-3 block text-sm text-yellow-400">
            WeChat QR Code
          </label>

          <input
            type="file"
            accept="image/*"
            disabled={uploading || deleting}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                uploadWechatQr(file);
              }
            }}
            className="w-full text-white"
          />

          {settings.wechatQr && (
            <>
              <img
                src={settings.wechatQr}
                alt="WeChat QR Code"
                className="mt-5 h-40 w-40 rounded-xl object-cover"
              />

              <button
                type="button"
                disabled={deleting}
                onClick={deleteWechatQr}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete QR Code"}
              </button>
            </>
          )}

          {uploading && (
            <p className="mt-3 text-yellow-400">
              Uploading...
            </p>
          )}

          {error && (
            <p className="mt-3 text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Enable WeChat 移到這裡（QR 區塊正下方） */}
        <Toggle
          label="Enable WeChat"
          checked={settings.enableWechat}
          onChange={(v) => update("enableWechat", v)}
        />

        <Input
          label="Email"
          value={settings.email}
          onChange={(v) => update("email", v)}
        />

        <Toggle
          label="Enable Feedback Email"
          checked={settings.enableFeedbackEmail}
          onChange={(v) => update("enableFeedbackEmail", v)}
        />

        <button
          onClick={save}
          disabled={loading}
          className="mt-10 w-full rounded-xl bg-yellow-500 py-4 font-bold text-black"
        >
          {loading ? "SAVING..." : "SAVE SETTINGS"}
        </button>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-gray-400">
        {label}
      </label>

      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/20 bg-black px-5 py-4 text-white"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <span>{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}