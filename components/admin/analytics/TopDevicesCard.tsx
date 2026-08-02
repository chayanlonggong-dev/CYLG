type Device = {
  device: string | null;
  _count: {
    device: number;
  };
};

type Props = {
  devices: Device[];
};

export default function TopDevicesCard({
  devices,
}: Props) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">
        Top Devices
      </h2>

      <div className="mt-6 space-y-4">
        {devices.length === 0 && (
          <p className="text-gray-500">
            No data
          </p>
        )}

        {devices.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-white/10 pb-3"
          >
            <span>
              {item.device || "Unknown"}
            </span>

            <span className="font-bold text-yellow-400">
              {item._count.device}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}