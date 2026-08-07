"use client";

type AuditLog = {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  userId: string | null;
  description: string;
  metadata: {
    operator?: string;
    result?: string;
    modelCode?: string;
    actionLabel?: string;
    ip?: string;
    browser?: string;
    os?: string;
    device?: string;
  } | null;
  createdAt: string;
};

interface Props {
  open: boolean;
  log: AuditLog | null;
  onClose: () => void;
}

export default function LogDetailsModal({
  open,
  log,
  onClose,
}: Props) {
  if (!open || !log) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-3xl border border-yellow-500/20 bg-[#101010] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-white">
          Log Details
        </h2>

        <div className="mt-6 space-y-4">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info
              title="Time"
              value={new Date(log.createdAt).toLocaleString()}
            />

            <Info
              title="Action"
              value={log.action}
            />
          </div>

          <Info
            title="Description"
            value={log.description}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info
              title="User ID"
              value={log.userId ?? "-"}
            />

            <Info
              title="Status"
              value={log.metadata?.result ?? "Success"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info
              title="Operator"
              value={log.metadata?.operator ?? "-"}
            />

            <Info
              title="Model"
              value={log.metadata?.modelCode ?? "-"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info
              title="IP Address"
              value={log.metadata?.ip ?? "-"}
            />

            <Info
              title="Browser"
              value={log.metadata?.browser ?? "-"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info
              title="Operating System"
              value={log.metadata?.os ?? "-"}
            />

            <Info
              title="Device"
              value={log.metadata?.device ?? "-"}
            />
          </div>

        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black transition hover:bg-yellow-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-[#050505] p-4">
      <p className="text-[11px] uppercase tracking-wider text-gray-500">
        {title}
      </p>

      <p className="mt-1 break-all text-base font-medium text-white">
        {value}
      </p>
    </div>
  );
}