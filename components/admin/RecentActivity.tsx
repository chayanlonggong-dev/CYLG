"use client";

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "create" | "update" | "delete" | "system";
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading: boolean;
}

export default function RecentActivity({
  activities,
  loading,
}: RecentActivityProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
        <h2 className="text-2xl font-black text-white">
          Recent Activity
        </h2>

        <p className="mt-6 text-gray-400">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
      <h2 className="text-2xl font-black text-white">
        Recent Activity
      </h2>

      <div className="mt-8 space-y-5">
        {activities.length === 0 ? (
          <p className="text-gray-400">
            No recent activity.
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 rounded-2xl border border-yellow-500/10 bg-[#181818] p-5"
            >
              <div
                className={`mt-1 h-3 w-3 rounded-full ${
                  activity.type === "create"
                    ? "bg-green-500"
                    : activity.type === "update"
                    ? "bg-yellow-500"
                    : activity.type === "delete"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              />

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-white">
                    {activity.title}
                  </p>

                  <span className="text-xs text-gray-500">
                    {activity.time}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {activity.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}