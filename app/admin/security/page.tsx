"use client";

import { useEffect, useMemo, useState } from "react";

interface Session {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
}

type SecurityEventType =
  | "LOGIN_FAILED"
  | "ACCOUNT_LOCKED"
  | "INVALID_2FA"
  | "TWO_FACTOR_RATE_LIMITED"
  | "FIREWALL_BLOCKED"
  | "RATE_LIMIT_EXCEEDED"
  | "SUSPICIOUS_SESSION"
  | "UNAUTHORIZED_ACCESS"
  | "SENSITIVE_ACTION";

type SecurityEventSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

type SecurityEventStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "RESOLVED";

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  status: SecurityEventStatus;
  ip: string | null;
  country: string | null;
  userAgent: string | null;
  adminUserId: number | null;
  description: string;
  metadata: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

interface RecoveryResult {
  recovered: boolean;
  blockedIps: string[];
  blockedIpCount: number;
  revokedSessions: number;
  threatCount: number;
  skippedCurrentIp: boolean;
}

interface IntegritySummary {
  total: number;
  healthy: number;
  modified: number;
  missing: number;
  errors: number;
  results: Array<{
    status: "HEALTHY" | "MODIFIED" | "MISSING" | "ERROR";
    path: string;
    expectedHash: string;
    actualHash: string | null;
    expectedSize: number;
    actualSize: number | null;
  }>;
  /** Serverless 环境跳过完整校验时使用 */
  skipped?: boolean;
  skipReason?: string;
}

interface IntegrityRepairResult {
  path: string;
  status: "REPAIRED" | "SKIPPED" | "FAILED";
  reason: string;
  backupPath: string | null;
}

interface IntegrityRepairSummary {
  requested: number;
  repairedCount: number;
  skipped: number;
  failed: number;
  results: IntegrityRepairResult[];
}

interface IntegrityBaselineUpdateResult {
  updated: boolean;
  requiresConfirmation?: boolean;
  blocked?: boolean;
  backupPath?: string;
  generatedAt?: string;
  protectedFiles?: number;
  integrity?: IntegritySummary;
}

const SECURITY_EVENT_TYPES: SecurityEventType[] = [
  "LOGIN_FAILED",
  "ACCOUNT_LOCKED",
  "INVALID_2FA",
  "TWO_FACTOR_RATE_LIMITED",
  "FIREWALL_BLOCKED",
  "RATE_LIMIT_EXCEEDED",
  "SUSPICIOUS_SESSION",
  "UNAUTHORIZED_ACCESS",
  "SENSITIVE_ACTION",
];

const SECURITY_EVENT_SEVERITIES: SecurityEventSeverity[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const SECURITY_EVENT_STATUSES: SecurityEventStatus[] = [
  "OPEN",
  "ACKNOWLEDGED",
  "RESOLVED",
];

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] =
    useState("");

  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] =
    useState("");
  const [twoFactorMessage, setTwoFactorMessage] =
    useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] =
    useState(false);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // Security Events
  // =====================================================

  const [securityEvents, setSecurityEvents] =
    useState<SecurityEvent[]>([]);

  const [securityEventsLoading, setSecurityEventsLoading] =
    useState(true);

  const [securityEventsMessage, setSecurityEventsMessage] =
    useState("");

  const [eventTypeFilter, setEventTypeFilter] =
    useState("");

  const [eventSeverityFilter, setEventSeverityFilter] =
    useState("");

  const [eventStatusFilter, setEventStatusFilter] =
    useState("");

  const [updatingEventId, setUpdatingEventId] =
    useState("");

  // =====================================================
  // Emergency Security Recovery
  // =====================================================

  const [recoveryLoading, setRecoveryLoading] =
    useState(false);

  const [recoveryMessage, setRecoveryMessage] =
    useState("");

  const [recoveryResult, setRecoveryResult] =
    useState<RecoveryResult | null>(null);

  const [recoveryConfirmed, setRecoveryConfirmed] =
    useState(false);

  // =====================================================
  // Security Integrity / Repair
  // =====================================================

  const [integrityLoading, setIntegrityLoading] =
    useState(false);

  const [integrityRepairLoading, setIntegrityRepairLoading] =
    useState(false);

  const [integrityMessage, setIntegrityMessage] =
    useState("");

  const [integrity, setIntegrity] =
    useState<IntegritySummary | null>(null);

  const [integrityRepairResult, setIntegrityRepairResult] =
    useState<IntegrityRepairSummary | null>(null);

  const [integrityBaselineLoading, setIntegrityBaselineLoading] =
    useState(false);

  const [integrityBaselineMessage, setIntegrityBaselineMessage] =
    useState("");

  // =====================================================
  // Active Sessions
  // =====================================================

  async function loadSessions() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/sessions", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setTwoFactorMessage(
          data.message ||
            "Failed to load security information."
        );
        return;
      }

      setSessions(
        Array.isArray(data.sessions)
          ? data.sessions
          : []
      );

      setCurrentSessionId(
        typeof data.currentSessionId === "string"
          ? data.currentSessionId
          : ""
      );

      if (
        typeof data.twoFactorEnabled ===
        "boolean"
      ) {
        setTwoFactorEnabled(
          data.twoFactorEnabled
        );
      }
    } catch (error) {
      console.error(
        "Failed to load security information:",
        error
      );

      setTwoFactorMessage(
        "Failed to load security information."
      );
    } finally {
      setLoading(false);
    }
  }

  async function revokeSession(id: string) {
    const confirmed = window.confirm(
      "Logout this device?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(
        "/api/admin/sessions",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sessionId: id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Failed to logout this device."
        );
        return;
      }

      await loadSessions();
    } catch (error) {
      console.error(
        "Revoke session error:",
        error
      );

      alert(
        "Failed to logout this device."
      );
    }
  }

  async function logoutAllDevices() {
    const confirmed = window.confirm(
      "Logout ALL devices?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(
        "/api/admin/sessions",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "logoutAll",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Failed to logout all devices."
        );
        return;
      }

      window.location.href =
        "/admin/login";
    } catch (error) {
      console.error(
        "Logout all devices error:",
        error
      );

      alert(
        "Failed to logout all devices."
      );
    }
  }

  async function logoutOtherDevices() {
    const confirmed = window.confirm(
      "Logout all other devices?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(
        "/api/admin/sessions",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "logoutOthers",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Failed to logout other devices."
        );
        return;
      }

      await loadSessions();
    } catch (error) {
      console.error(
        "Logout other devices error:",
        error
      );

      alert(
        "Failed to logout other devices."
      );
    }
  }

  // =====================================================
  // 2FA
  // =====================================================

  async function setup2FA() {
    try {
      const res = await fetch(
        "/api/admin/2fa/setup",
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (data.success) {
        setQrCode(
          typeof data.qrCode === "string"
            ? data.qrCode
            : ""
        );

        setTwoFactorMessage(
          "Scan the QR code with your authenticator app."
        );
      } else {
        setTwoFactorMessage(
          data.message ||
            "Failed to generate 2FA setup."
        );
      }
    } catch (error) {
      console.error(
        "2FA setup error:",
        error
      );

      setTwoFactorMessage(
        "Failed to generate 2FA setup."
      );
    }
  }

  async function verify2FA() {
    if (!twoFactorCode.trim()) {
      setTwoFactorMessage(
        "Enter your 6 digit authentication code."
      );
      return;
    }

    try {
      const res = await fetch(
        "/api/admin/2fa/setup/verify",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token:
              twoFactorCode.trim(),
          }),
        }
      );

      const data = await res.json();

      setTwoFactorMessage(
        data.message ||
          "2FA verification completed."
      );

      if (data.success) {
        setTwoFactorEnabled(true);
        setQrCode("");
        setTwoFactorCode("");
      }
    } catch (error) {
      console.error(
        "2FA verification error:",
        error
      );

      setTwoFactorMessage(
        "2FA verification failed."
      );
    }
  }

  // =====================================================
  // Security Events
  // =====================================================

  async function loadSecurityEvents() {
    try {
      setSecurityEventsLoading(true);
      setSecurityEventsMessage("");

      const params =
        new URLSearchParams();

      params.set("limit", "500");

      if (eventTypeFilter) {
        params.set(
          "type",
          eventTypeFilter
        );
      }

      if (eventSeverityFilter) {
        params.set(
          "severity",
          eventSeverityFilter
        );
      }

      if (eventStatusFilter) {
        params.set(
          "status",
          eventStatusFilter
        );
      }

      const res = await fetch(
        `/api/admin/security/events?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        setSecurityEventsMessage(
          payload.message ||
            "Failed to load security events."
        );
        return;
      }

      const events =
        payload.data?.events ??
        payload.events ??
        [];

      setSecurityEvents(
        Array.isArray(events)
          ? events
          : []
      );
    } catch (error) {
      console.error(
        "Security events load error:",
        error
      );

      setSecurityEventsMessage(
        "Failed to load security events."
      );
    } finally {
      setSecurityEventsLoading(false);
    }
  }

  async function updateSecurityEventStatus(
    id: string,
    status: SecurityEventStatus
  ) {
    try {
      setUpdatingEventId(id);
      setSecurityEventsMessage("");

      const res = await fetch(
        "/api/admin/security/events",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        setSecurityEventsMessage(
          payload.message ||
            "Failed to update security event."
        );
        return;
      }

      const updatedEvent =
        payload.data ?? payload.event;

      if (updatedEvent?.id) {
        setSecurityEvents(
          (currentEvents) =>
            currentEvents.map(
              (event) =>
                event.id === id
                  ? updatedEvent
                  : event
            )
        );
      } else {
        await loadSecurityEvents();
      }
    } catch (error) {
      console.error(
        "Security event update error:",
        error
      );

      setSecurityEventsMessage(
        "Failed to update security event."
      );
    } finally {
      setUpdatingEventId("");
    }
  }

  function clearSecurityEventFilters() {
    setEventTypeFilter("");
    setEventSeverityFilter("");
    setEventStatusFilter("");
  }

  // =====================================================
  // Security Integrity
  // =====================================================

  async function runIntegrityCheck() {
    if (integrityLoading || integrityRepairLoading) {
      return;
    }

    try {
      setIntegrityLoading(true);
      setIntegrityMessage("");

      const res = await fetch(
        "/api/admin/security/integrity",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        setIntegrityMessage(
          payload.message ||
            "Security integrity check failed."
        );
        return;
      }

      const result =
        payload.data?.integrity ??
        payload.integrity;

      if (!result) {
        setIntegrityMessage(
          "Security integrity check returned no result."
        );
        return;
      }

      setIntegrity(result as IntegritySummary);

      if (result.skipped) {
        setIntegrityMessage(
          result.skipReason ||
            "正式站（Serverless）不执行完整源文件校验，以本地 / CI 为准"
        );
      } else if (
        result.modified > 0 ||
        result.missing > 0 ||
        result.errors > 0
      ) {
        setIntegrityMessage(
          "Security integrity issues were detected."
        );
      } else {
        setIntegrityMessage(
          "Security integrity is healthy."
        );
      }
    } catch (error) {
      console.error(
        "Security integrity check error:",
        error
      );

      setIntegrityMessage(
        "Security integrity check failed."
      );
    } finally {
      setIntegrityLoading(false);
    }
  }

  async function updateTrustedBaseline() {
    if (
      integrityBaselineLoading ||
      integrityLoading ||
      integrityRepairLoading
    ) {
      return;
    }

    if (!integrity) {
      await runIntegrityCheck();
      return;
    }

    if (integrity.skipped) {
      setIntegrityBaselineMessage(
        "Trusted baseline cannot be updated in Serverless environment. Please update on local and deploy via Git."
      );
      return;
    }

    if (
      integrity.missing > 0 ||
      integrity.errors > 0
    ) {
      setIntegrityBaselineMessage(
        "Trusted baseline cannot be updated while files are missing or unreadable."
      );
      return;
    }

    if (integrity.modified === 0) {
      setIntegrityBaselineMessage(
        "No modified files are present. The trusted baseline is already current."
      );
      return;
    }

    const confirmed = window.confirm(
      "UPDATE TRUSTED INTEGRITY BASELINE\\n\\n" +
        `${integrity.modified} modified file(s) were detected.\\n\\n` +
        "This will make the CURRENT verified application files the new trusted baseline.\\n\\n" +
        "The previous integrity manifest will be backed up before the update.\\n\\n" +
        "Only continue if you intentionally made these code changes and they have been reviewed.\\n\\n" +
        "Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIntegrityBaselineLoading(true);
      setIntegrityBaselineMessage("");
      setIntegrityRepairResult(null);

      const res = await fetch(
        "/api/admin/security/integrity",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            confirmation:
              "UPDATE_TRUSTED_BASELINE",
          }),
        }
      );

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        setIntegrityBaselineMessage(
          payload.message ||
            "Failed to update trusted integrity baseline."
        );
        return;
      }

      const data =
        (payload.data ??
          payload) as IntegrityBaselineUpdateResult;

      if (!data.updated) {
        setIntegrityBaselineMessage(
          payload.message ||
            "Trusted integrity baseline was not updated."
        );
        return;
      }

      if (data.integrity) {
        setIntegrity(
          data.integrity
        );
      }

      setIntegrityBaselineMessage(
        `Trusted integrity baseline updated and verified. ${
          data.protectedFiles ?? integrity.total
        } protected files are now registered.`
      );

      await runIntegrityCheck();
    } catch (error) {
      console.error(
        "Trusted integrity baseline update error:",
        error
      );

      setIntegrityBaselineMessage(
        "Failed to update trusted integrity baseline."
      );
    } finally {
      setIntegrityBaselineLoading(false);
    }
  }

  async function repairDamagedFiles() {
    if (
      integrityRepairLoading ||
      integrityLoading
    ) {
      return;
    }

    if (!integrity) {
      await runIntegrityCheck();
      return;
    }

    if (integrity.skipped) {
      setIntegrityMessage(
        "Repair is not available in Serverless environment."
      );
      return;
    }

    const issueCount =
      integrity.modified +
      integrity.missing +
      integrity.errors;

    if (issueCount === 0) {
      setIntegrityMessage(
        "No damaged files require repair."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "REPAIR DAMAGED FILES\n\n" +
          `${issueCount} integrity issue(s) were detected.\n\n` +
          "The current affected files will be backed up before restoration from the trusted repair source.\n\n" +
          "Continue?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setIntegrityRepairLoading(true);
      setIntegrityMessage("");
      setIntegrityRepairResult(null);

      const res = await fetch(
        "/api/admin/security/integrity/repair",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            confirm: true,
          }),
        }
      );

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        setIntegrityMessage(
          payload.message ||
            "Security integrity repair failed."
        );
        return;
      }

      const data =
        payload.data ??
        payload;

      const repairResult: IntegrityRepairSummary = {
        requested:
          Number(data.requested) || 0,

        repairedCount:
          Number(
            data.repairedCount ??
              data.repaired
          ) || 0,

        skipped:
          Number(data.skipped) || 0,

        failed:
          Number(data.failed) || 0,

        results:
          Array.isArray(data.results)
            ? data.results
            : [],
      };

      setIntegrityRepairResult(
        repairResult
      );

      if (
        repairResult.failed === 0
      ) {
        setIntegrityMessage(
          "Security integrity repair completed successfully."
        );
      } else {
        setIntegrityMessage(
          "Security integrity repair completed with failures."
        );
      }

      await runIntegrityCheck();
    } catch (error) {
      console.error(
        "Security integrity repair error:",
        error
      );

      setIntegrityMessage(
        "Security integrity repair failed."
      );
    } finally {
      setIntegrityRepairLoading(false);
    }
  }

  // =====================================================
  // Security Event Statistics
  // =====================================================

  const securityStats = useMemo(() => {
    return {
      total:
        securityEvents.length,

      open:
        securityEvents.filter(
          (event) =>
            event.status === "OPEN"
        ).length,

      acknowledged:
        securityEvents.filter(
          (event) =>
            event.status ===
            "ACKNOWLEDGED"
        ).length,

      resolved:
        securityEvents.filter(
          (event) =>
            event.status === "RESOLVED"
        ).length,

      critical:
        securityEvents.filter(
          (event) =>
            event.severity ===
            "CRITICAL"
        ).length,

      high:
        securityEvents.filter(
          (event) =>
            event.severity ===
            "HIGH"
        ).length,

      firewall:
        securityEvents.filter(
          (event) =>
            event.type ===
            "FIREWALL_BLOCKED"
        ).length,
    };
  }, [securityEvents]);

  // =====================================================
  // Recovery Threat IPs
  // =====================================================

  const recoveryThreatIps = useMemo(() => {
    return Array.from(
      new Set(
        securityEvents
          .filter(
            (event) =>
              event.status === "OPEN" &&
              (
                event.type ===
                  "FIREWALL_BLOCKED" ||
                event.type ===
                  "RATE_LIMIT_EXCEEDED"
              )
          )
          .map(
            (event) => event.ip
          )
          .filter(
            (ip): ip is string =>
              Boolean(ip) &&
              ip !== "127.0.0.1" &&
              ip !== "::1" &&
              ip !== "localhost"
          )
      )
    );
  }, [securityEvents]);

  // =====================================================
  // Emergency Security Recovery
  // =====================================================

  async function executeEmergencyRecovery() {
    if (recoveryLoading) {
      return;
    }

    if (!recoveryConfirmed) {
      setRecoveryMessage(
        "You must confirm the emergency recovery action."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "EMERGENCY SECURITY RECOVERY\n\n" +
          "This will revoke ALL administrator sessions and block the selected threat IPs.\n\n" +
          "You will be logged out and must sign in again.\n\n" +
          "Continue?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setRecoveryLoading(true);
      setRecoveryMessage("");
      setRecoveryResult(null);

      const res = await fetch(
        "/api/admin/security/recovery",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            confirm: true,
          }),
        }
      );

      const payload =
        await res.json();

      if (
        !res.ok ||
        !payload.success
      ) {
        setRecoveryMessage(
          payload.message ||
            "Emergency security recovery failed."
        );
        return;
      }

      const result =
        payload.data ??
        payload;

      setRecoveryResult(
        result as RecoveryResult
      );

      setRecoveryMessage(
        result.message ||
          "Emergency security recovery completed successfully."
      );

      /*
       * Emergency Recovery revokes every administrator
       * session, including the current one.
       *
       * Give the API response time to complete before
       * redirecting to login.
       */
      window.setTimeout(() => {
        window.location.href =
          "/admin/login";
      }, 1800);
    } catch (error) {
      console.error(
        "Emergency security recovery error:",
        error
      );

      setRecoveryMessage(
        "Emergency security recovery failed."
      );
    } finally {
      setRecoveryLoading(false);
    }
  }

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    runIntegrityCheck();
  }, []);

  useEffect(() => {
    loadSecurityEvents();
  }, [
    eventTypeFilter,
    eventSeverityFilter,
    eventStatusFilter,
  ]);

  return (
    <main>
      <div>
        <div className="text-sm font-bold tracking-[0.3em] text-yellow-400">
          CYLG CMS
        </div>

        <h1 className="mt-4 text-5xl font-black">
          Security Center
        </h1>

        <p className="mt-4 text-gray-400">
          Manage administrator security,
          sessions, authentication and
          security incidents.
        </p>

        {/* =====================================================
            Security Overview
        ===================================================== */}

        <section className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
            <p className="text-xs font-bold tracking-[0.2em] text-gray-500">
              SECURITY EVENTS
            </p>

            <p className="mt-4 text-4xl font-black text-yellow-400">
              {securityStats.total}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Recorded security events
            </p>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-[#101010] p-6">
            <p className="text-xs font-bold tracking-[0.2em] text-gray-500">
              OPEN INCIDENTS
            </p>

            <p className="mt-4 text-4xl font-black text-red-400">
              {securityStats.open}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Require investigation
            </p>
          </div>

          <div className="rounded-3xl border border-orange-500/20 bg-[#101010] p-6">
            <p className="text-xs font-bold tracking-[0.2em] text-gray-500">
              HIGH / CRITICAL
            </p>

            <p className="mt-4 text-4xl font-black text-orange-400">
              {securityStats.high +
                securityStats.critical}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Elevated security events
            </p>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-[#101010] p-6">
            <p className="text-xs font-bold tracking-[0.2em] text-gray-500">
              FIREWALL BLOCKS
            </p>

            <p className="mt-4 text-4xl font-black text-blue-400">
              {securityStats.firewall}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Requests blocked by firewall
            </p>
          </div>
        </section>

        {/* =====================================================
            Security Integrity
        ===================================================== */}

        <section className="mt-12 rounded-3xl border border-yellow-500/30 bg-[#101010] p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    integrity?.skipped
                      ? "bg-blue-500"
                      : integrity &&
                        integrity.modified === 0 &&
                        integrity.missing === 0 &&
                        integrity.errors === 0
                      ? "bg-green-500"
                      : "animate-pulse bg-yellow-500"
                  }`}
                />

                <h2 className="text-2xl font-bold text-yellow-400">
                  Security Integrity
                </h2>
              </div>

              <p className="mt-3 text-gray-400">
                Verify protected application files against the
                trusted SHA-256 integrity baseline.
              </p>

              <p className="mt-3 text-sm text-gray-500">
                If code has been modified or removed, affected
                files can be restored from the trusted repair
                source. The current affected files are backed up
                before restoration.
              </p>
            </div>

            <div
              className={`rounded-xl border px-4 py-3 text-xs font-bold tracking-[0.15em] ${
                integrity?.skipped
                  ? "border-blue-500/20 bg-blue-500/5 text-blue-400"
                  : integrity &&
                    integrity.modified === 0 &&
                    integrity.missing === 0 &&
                    integrity.errors === 0
                  ? "border-green-500/20 bg-green-500/5 text-green-400"
                  : "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
              }`}
            >
              {integrity?.skipped
                ? "INTEGRITY SKIPPED (SERVERLESS)"
                : integrity &&
                  integrity.modified === 0 &&
                  integrity.missing === 0 &&
                  integrity.errors === 0
                ? "INTEGRITY HEALTHY"
                : "INTEGRITY CHECK REQUIRED"}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs font-bold tracking-[0.15em] text-gray-500">
                PROTECTED
              </p>
              <p className="mt-3 text-3xl font-black text-white">
                {integrity?.total ?? "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
              <p className="text-xs font-bold tracking-[0.15em] text-gray-500">
                HEALTHY
              </p>
              <p className="mt-3 text-3xl font-black text-green-400">
                {integrity?.healthy ?? "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-xs font-bold tracking-[0.15em] text-gray-500">
                MODIFIED
              </p>
              <p className="mt-3 text-3xl font-black text-red-400">
                {integrity?.modified ?? "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
              <p className="text-xs font-bold tracking-[0.15em] text-gray-500">
                MISSING
              </p>
              <p className="mt-3 text-3xl font-black text-orange-400">
                {integrity?.missing ?? "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
              <p className="text-xs font-bold tracking-[0.15em] text-gray-500">
                ERRORS
              </p>
              <p className="mt-3 text-3xl font-black text-purple-400">
                {integrity?.errors ?? "—"}
              </p>
            </div>
          </div>

          {integrityMessage && (
            <div
              className={`mt-6 rounded-xl border p-4 ${
                integrity?.skipped
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : integrity &&
                    integrity.modified === 0 &&
                    integrity.missing === 0 &&
                    integrity.errors === 0
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {integrityMessage}
            </div>
          )}

          {integrity &&
            !integrity.skipped &&
            integrity.results.some(
              (item) =>
                item.status === "MODIFIED" ||
                item.status === "MISSING" ||
                item.status === "ERROR"
            ) && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                <h3 className="font-bold text-red-400">
                  Integrity Issues Detected
                </h3>

                <div className="mt-4 space-y-3">
                  {integrity.results
                    .filter(
                      (item) =>
                        item.status === "MODIFIED" ||
                        item.status === "MISSING" ||
                        item.status === "ERROR"
                    )
                    .map((item) => (
                      <div
                        key={item.path}
                        className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <span className="break-all text-sm text-white">
                          {item.path}
                        </span>

                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${
                            item.status === "MODIFIED"
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : item.status === "MISSING"
                              ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                              : "border-purple-500/30 bg-purple-500/10 text-purple-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {integrityRepairResult && (
            <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
              <h3 className="font-bold text-green-400">
                Repair Result
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-600">
                    REQUESTED
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {integrityRepairResult.requested}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-600">
                    REPAIRED
                  </p>
                  <p className="mt-2 text-2xl font-black text-green-400">
                    {integrityRepairResult.repairedCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-600">
                    SKIPPED
                  </p>
                  <p className="mt-2 text-2xl font-black text-yellow-400">
                    {integrityRepairResult.skipped}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-600">
                    FAILED
                  </p>
                  <p className="mt-2 text-2xl font-black text-red-400">
                    {integrityRepairResult.failed}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {integrityRepairResult.results.map(
                  (item) => (
                    <div
                      key={`${item.path}-${item.status}`}
                      className="rounded-xl border border-white/10 bg-black/40 p-4"
                    >
                      <p className="break-all text-sm font-bold text-white">
                        {item.path}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.status}: {item.reason}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {integrityBaselineMessage && (
            <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
              {integrityBaselineMessage}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs leading-6 text-gray-600">
                <span className="font-bold text-gray-500">
                  UPDATE TRUSTED BASELINE
                </span>{" "}
                registers the current reviewed application files as
                trusted. Use it after intentional code changes.
              </p>

              <p className="mt-2 text-xs leading-6 text-gray-600">
                <span className="font-bold text-gray-500">
                  REPAIR DAMAGED FILES
                </span>{" "}
                restores modified or missing files from the separate
                trusted repair source. Do not use repair to approve
                intentional code changes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runIntegrityCheck}
                disabled={
                  integrityLoading ||
                  integrityRepairLoading ||
                  integrityBaselineLoading
                }
                className="rounded-xl border border-yellow-500/40 px-5 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {integrityLoading
                  ? "CHECKING..."
                  : "RUN INTEGRITY CHECK"}
              </button>

              <button
                type="button"
                onClick={updateTrustedBaseline}
                disabled={
                  integrityLoading ||
                  integrityRepairLoading ||
                  integrityBaselineLoading ||
                  !integrity ||
                  !!integrity.skipped ||
                  integrity.modified === 0 ||
                  integrity.missing > 0 ||
                  integrity.errors > 0
                }
                className="rounded-xl border border-green-500/40 bg-green-500/5 px-5 py-3 font-black text-green-400 transition hover:bg-green-500 hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-600"
              >
                {integrityBaselineLoading
                  ? "UPDATING..."
                  : "UPDATE TRUSTED BASELINE"}
              </button>

              <button
                type="button"
                onClick={repairDamagedFiles}
                disabled={
                  integrityLoading ||
                  integrityRepairLoading ||
                  integrityBaselineLoading ||
                  !integrity ||
                  !!integrity.skipped ||
                  integrity.modified +
                    integrity.missing +
                    integrity.errors ===
                    0
                }
                className="rounded-xl border border-red-500 bg-red-500/10 px-5 py-3 font-black text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-600"
              >
                {integrityRepairLoading
                  ? "REPAIRING..."
                  : "REPAIR DAMAGED FILES"}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            Emergency Security Recovery
        ===================================================== */}

        <section className="mt-12 rounded-3xl border border-red-500/30 bg-[#101010] p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 animate-pulse rounded-full bg-red-500" />

                <h2 className="text-2xl font-bold text-red-400">
                  Emergency Security Recovery
                </h2>
              </div>

              <p className="mt-3 text-gray-400">
                Use this emergency procedure if you
                suspect that administrator access or
                the security layer has been compromised.
              </p>

              <p className="mt-3 text-sm text-gray-500">
                This operation does not restore or
                delete database data. It immediately
                revokes administrator sessions,
                blocks selected threat IPs, clears
                the application firewall cache and
                records a critical security event.
              </p>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-bold tracking-[0.15em] text-red-400">
              HIGH RISK ACTION
            </div>
          </div>

          {/* Recovery Actions */}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs font-bold tracking-[0.15em] text-gray-500">
                ADMIN SESSIONS
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                ALL
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Other administrator sessions will
                be revoked.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs font-bold tracking-[0.15em] text-gray-500">
                THREAT IPS
              </p>

              <p className="mt-3 text-3xl font-black text-red-400">
                {recoveryThreatIps.length}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Recent firewall/rate-limit threat
                IPs currently detected.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs font-bold tracking-[0.15em] text-gray-500">
                DATABASE
              </p>

              <p className="mt-3 text-3xl font-black text-green-400">
                SAFE
              </p>

              <p className="mt-2 text-sm text-gray-500">
                No database restore is performed.
              </p>
            </div>
          </div>

          {/* Threat IP List */}

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-bold text-white">
                  Threat IPs
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Recent firewall and rate-limit
                  incidents associated with an IP
                  address. Final blocking is performed
                  by the server recovery endpoint.
                </p>
              </div>

              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                {recoveryThreatIps.length} detected
              </span>
            </div>

            {recoveryThreatIps.length === 0 ? (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-5 text-sm text-gray-500">
                No recent firewall/rate-limit threat IPs
                are currently detected.
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-3">
                {recoveryThreatIps.map(
                  (ip) => (
                    <span
                      key={ip}
                      className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 font-mono text-sm text-red-300"
                    >
                      {ip}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          {/* Confirmation */}

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <label className="flex cursor-pointer items-start gap-4">
              <input
                type="checkbox"
                checked={
                  recoveryConfirmed
                }
                onChange={(event) =>
                  setRecoveryConfirmed(
                    event.target.checked
                  )
                }
                disabled={
                  recoveryLoading
                }
                className="mt-1 h-5 w-5 accent-red-500"
              />

              <span>
                <span className="block font-bold text-white">
                  I understand and confirm
                  Emergency Security Recovery.
                </span>

                <span className="mt-2 block text-sm text-gray-500">
                  I understand that other administrator
                  sessions will be revoked. My current
                  session remains active so recovery can
                  complete safely.
                </span>
              </span>
            </label>
          </div>

          {recoveryMessage && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                recoveryResult?.recovered
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {recoveryMessage}
            </div>
          )}

          {recoveryResult?.recovered && (
            <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
              <h3 className="font-bold text-green-400">
                Recovery Completed
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-600">
                    SESSIONS REVOKED
                  </p>

                  <p className="mt-2 text-2xl font-black text-white">
                    {
                      recoveryResult.revokedSessions
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-600">
                    IPS BLOCKED
                  </p>

                  <p className="mt-2 text-2xl font-black text-white">
                    {
                      recoveryResult.blockedIps
                        .length
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-600">
                    THREATS
                  </p>

                  <p className="mt-2 text-2xl font-black text-white">
                    {recoveryResult.threatCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-600">
                    STATUS
                  </p>

                  <p className="mt-2 text-2xl font-black text-green-400">
                    SECURED
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm text-gray-500">
                Emergency recovery completed. Other
                administrator sessions were revoked and
                detected threat IPs were blocked.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-xs leading-6 text-gray-600">
              Emergency Recovery is intentionally
              separated from Backup Restore.
              Database restoration will only be
              available through a separate verified
              recovery workflow.
            </p>

            <button
              type="button"
              onClick={
                executeEmergencyRecovery
              }
              disabled={
                recoveryLoading ||
                !recoveryConfirmed
              }
              className="rounded-xl border border-red-500 bg-red-500/10 px-7 py-4 font-black tracking-wide text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-600"
            >
              {recoveryLoading
                ? "EXECUTING RECOVERY..."
                : "START EMERGENCY RECOVERY"}
            </button>
          </div>
        </section>

        {/* =====================================================
            Two-Factor Authentication
        ===================================================== */}

        <section className="mt-12 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
          <h2 className="text-2xl font-bold text-yellow-400">
            Two-Factor Authentication
          </h2>

          {loading ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5 text-gray-400">
              Loading security status...
            </div>
          ) : twoFactorEnabled ? (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-green-400">
              Two-Factor Authentication
              Enabled
            </div>
          ) : (
            <>
              {!qrCode && (
                <button
                  type="button"
                  onClick={setup2FA}
                  className="mt-6 rounded-xl border border-yellow-500/40 px-5 py-3 text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
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

                  <div className="mt-6 flex flex-wrap gap-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(event) =>
                        setTwoFactorCode(
                          event.target.value
                        )
                      }
                      placeholder="6 digit code"
                      className="rounded-xl border border-white/20 bg-black px-5 py-3 text-white outline-none focus:border-yellow-500"
                    />

                    <button
                      type="button"
                      onClick={verify2FA}
                      className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black transition hover:bg-yellow-400"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {twoFactorMessage && (
            <p className="mt-5 text-gray-400">
              {twoFactorMessage}
            </p>
          )}
        </section>

        {/* =====================================================
            Active Devices
        ===================================================== */}

        <section className="mt-12 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">
                Active Devices
              </h2>

              <p className="mt-2 text-gray-400">
                Manage active administrator
                sessions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={logoutOtherDevices}
                className="rounded-xl border border-yellow-500 px-5 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
              >
                Logout All Other Devices
              </button>

              <button
                type="button"
                onClick={logoutAllDevices}
                className="rounded-xl border border-red-500 px-5 py-3 font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                Logout All Devices
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6 text-gray-400">
              Loading active devices...
            </div>
          ) : sessions.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6 text-gray-400">
              No active sessions found.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-white">
                      {session.id ===
                      currentSessionId
                        ? "Current Device"
                        : "Active Device"}
                    </h3>

                    {session.id ===
                      currentSessionId && (
                      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-gray-400">
                    IP:{" "}
                    {session.ip ||
                      "Unknown"}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    Browser:{" "}
                    <span className="break-all">
                      {session.userAgent ||
                        "Unknown"}
                    </span>
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Created:{" "}
                    {new Date(
                      session.createdAt
                    ).toLocaleString()}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Last Activity:{" "}
                    {new Date(
                      session.lastActivityAt
                    ).toLocaleString()}
                  </p>

                  {session.id !==
                    currentSessionId && (
                    <button
                      type="button"
                      onClick={() =>
                        revokeSession(
                          session.id
                        )
                      }
                      className="mt-5 rounded-xl border border-red-500/40 px-5 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      Logout
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            Security Event Monitor
        ===================================================== */}

        <section className="mt-12 rounded-3xl border border-red-500/20 bg-[#101010] p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

                <h2 className="text-2xl font-bold text-red-400">
                  Security Event Monitor
                </h2>
              </div>

              <p className="mt-2 text-gray-400">
                Detect, investigate and resolve
                administrator security incidents.
              </p>
            </div>

            <button
              type="button"
              onClick={loadSecurityEvents}
              disabled={securityEventsLoading}
              className="rounded-xl border border-yellow-500/40 px-5 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {securityEventsLoading
                ? "Refreshing..."
                : "Refresh Events"}
            </button>
          </div>

          {/* Event Status Summary */}

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs font-bold tracking-[0.18em] text-gray-500">
                TOTAL
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {securityStats.total}
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-xs font-bold tracking-[0.18em] text-gray-500">
                OPEN
              </p>

              <p className="mt-3 text-3xl font-black text-red-400">
                {securityStats.open}
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
              <p className="text-xs font-bold tracking-[0.18em] text-gray-500">
                ACKNOWLEDGED
              </p>

              <p className="mt-3 text-3xl font-black text-yellow-400">
                {securityStats.acknowledged}
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
              <p className="text-xs font-bold tracking-[0.18em] text-gray-500">
                RESOLVED
              </p>

              <p className="mt-3 text-3xl font-black text-green-400">
                {securityStats.resolved}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
              <p className="text-xs font-bold tracking-[0.18em] text-gray-500">
                CRITICAL
              </p>

              <p className="mt-3 text-3xl font-black text-orange-400">
                {securityStats.critical}
              </p>
            </div>
          </div>

          {/* Filters */}

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-bold tracking-[0.15em] text-gray-500">
                  EVENT TYPE
                </label>

                <select
                  value={eventTypeFilter}
                  onChange={(event) =>
                    setEventTypeFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                >
                  <option value="">
                    All Event Types
                  </option>

                  {SECURITY_EVENT_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex-1">
                <label className="mb-2 block text-xs font-bold tracking-[0.15em] text-gray-500">
                  SEVERITY
                </label>

                <select
                  value={eventSeverityFilter}
                  onChange={(event) =>
                    setEventSeverityFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                >
                  <option value="">
                    All Severities
                  </option>

                  {SECURITY_EVENT_SEVERITIES.map(
                    (severity) => (
                      <option
                        key={severity}
                        value={severity}
                      >
                        {severity}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex-1">
                <label className="mb-2 block text-xs font-bold tracking-[0.15em] text-gray-500">
                  STATUS
                </label>

                <select
                  value={eventStatusFilter}
                  onChange={(event) =>
                    setEventStatusFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                >
                  <option value="">
                    All Statuses
                  </option>

                  {SECURITY_EVENT_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={
                  clearSecurityEventFilters
                }
                className="rounded-xl border border-white/20 px-5 py-3 font-bold text-gray-300 transition hover:border-yellow-500 hover:text-yellow-400"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {securityEventsMessage && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {securityEventsMessage}
            </div>
          )}

          {/* Event List */}

          {securityEventsLoading ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-8 text-center text-gray-400">
              Loading security events...
            </div>
          ) : securityEvents.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-10 text-center">
              <p className="text-lg font-bold text-white">
                No security events found.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                The security event monitor
                has no matching incidents.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {securityEvents.map(
                (event) => {
                  const severityClass =
                    event.severity ===
                    "CRITICAL"
                      ? "border-red-500/40 bg-red-500/5 text-red-400"
                      : event.severity ===
                        "HIGH"
                      ? "border-orange-500/40 bg-orange-500/5 text-orange-400"
                      : event.severity ===
                        "MEDIUM"
                      ? "border-yellow-500/40 bg-yellow-500/5 text-yellow-400"
                      : "border-blue-500/40 bg-blue-500/5 text-blue-400";

                  const statusClass =
                    event.status ===
                    "OPEN"
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : event.status ===
                        "ACKNOWLEDGED"
                      ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                      : "border-green-500/30 bg-green-500/10 text-green-400";

                  return (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-white/10 bg-black/40 p-6"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${severityClass}`}
                            >
                              {event.severity}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
                            >
                              {event.status}
                            </span>

                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                              {event.type}
                            </span>
                          </div>

                          <h3 className="mt-4 text-lg font-bold text-white">
                            {event.description}
                          </h3>

                          <div className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <span className="text-gray-600">
                                IP
                              </span>

                              <p className="mt-1 break-all text-gray-300">
                                {event.ip ||
                                  "Unknown"}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-600">
                                Country
                              </span>

                              <p className="mt-1 text-gray-300">
                                {event.country ||
                                  "Unknown"}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-600">
                                Created
                              </span>

                              <p className="mt-1 text-gray-300">
                                {new Date(
                                  event.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-600">
                                Admin
                              </span>

                              <p className="mt-1 text-gray-300">
                                {event.adminUserId ??
                                  "System"}
                              </p>
                            </div>
                          </div>

                          {event.userAgent && (
                            <div className="mt-4">
                              <span className="text-xs font-bold tracking-[0.15em] text-gray-600">
                                USER AGENT
                              </span>

                              <p className="mt-1 break-all text-sm text-gray-500">
                                {
                                  event.userAgent
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 xl:w-48 xl:flex-col">
                          {event.status !==
                            "ACKNOWLEDGED" &&
                            event.status !==
                              "RESOLVED" && (
                              <button
                                type="button"
                                disabled={
                                  updatingEventId ===
                                  event.id
                                }
                                onClick={() =>
                                  updateSecurityEventStatus(
                                    event.id,
                                    "ACKNOWLEDGED"
                                  )
                                }
                                className="rounded-xl border border-yellow-500/40 px-4 py-2 text-sm font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black disabled:opacity-50"
                              >
                                Acknowledge
                              </button>
                            )}

                          {event.status !==
                            "RESOLVED" && (
                            <button
                              type="button"
                              disabled={
                                updatingEventId ===
                                event.id
                              }
                              onClick={() =>
                                updateSecurityEventStatus(
                                  event.id,
                                  "RESOLVED"
                                )
                              }
                              className="rounded-xl border border-green-500/40 px-4 py-2 text-sm font-bold text-green-400 transition hover:bg-green-500 hover:text-black disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          )}

                          {event.status ===
                            "RESOLVED" && (
                            <span className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-2 text-center text-sm font-bold text-green-400">
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}