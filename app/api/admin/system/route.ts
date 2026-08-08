import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import os from "os";
import { performance } from "perf_hooks";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

function getCpuSnapshot() {
  const cpus = os.cpus();

  let idle = 0;
  let total = 0;

  for (const cpu of cpus) {
    const times = cpu.times;

    idle += times.idle;

    total +=
      times.user +
      times.nice +
      times.sys +
      times.irq +
      times.idle;
  }

  return {
    idle,
    total,
  };
}

async function getCpuUsage(): Promise<number> {
  const first = getCpuSnapshot();

  await new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

  const second = getCpuSnapshot();

  const idleDelta = second.idle - first.idle;
  const totalDelta = second.total - first.total;

  if (totalDelta <= 0) {
    return 0;
  }

  const usage =
    100 -
    (idleDelta / totalDelta) * 100;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(usage)
    )
  );
}

type DiskInfo = {
  total: number | null;
  free: number | null;
  used: number | null;
  usage: number | null;
};

async function getDiskInfo(): Promise<DiskInfo> {
  try {
    /*
     * Windows
     */
    if (process.platform === "win32") {
      const { stdout } = await execFileAsync(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          `
            $drive = Get-PSDrive -Name C;
            $total = [double]($drive.Used + $drive.Free);
            $free = [double]$drive.Free;
            $used = [double]$drive.Used;

            [PSCustomObject]@{
              total = $total;
              free = $free;
              used = $used;
            } | ConvertTo-Json -Compress
          `,
        ],
        {
          windowsHide: true,
          timeout: 5000,
        }
      );

      const data = JSON.parse(stdout.trim());

      const totalBytes = Number(data.total);
      const freeBytes = Number(data.free);
      const usedBytes = Number(data.used);

      if (
        !Number.isFinite(totalBytes) ||
        !Number.isFinite(freeBytes) ||
        !Number.isFinite(usedBytes) ||
        totalBytes <= 0
      ) {
        return {
          total: null,
          free: null,
          used: null,
          usage: null,
        };
      }

      const totalGB = Math.round(
        totalBytes /
          1024 /
          1024 /
          1024
      );

      const freeGB = Math.round(
        freeBytes /
          1024 /
          1024 /
          1024
      );

      const usedGB = Math.round(
        usedBytes /
          1024 /
          1024 /
          1024
      );

      const usage = Math.round(
        (usedBytes / totalBytes) * 100
      );

      return {
        total: totalGB,
        free: freeGB,
        used: usedGB,
        usage,
      };
    }

    /*
     * Linux / macOS
     */
    const { stdout } = await execFileAsync(
      "df",
      ["-k", "/"],
      {
        timeout: 5000,
      }
    );

    const lines = stdout
      .trim()
      .split(/\r?\n/);

    if (lines.length < 2) {
      return {
        total: null,
        free: null,
        used: null,
        usage: null,
      };
    }

    const parts = lines[1]
      .trim()
      .split(/\s+/);

    const totalKB = Number(parts[1]);
    const usedKB = Number(parts[2]);
    const freeKB = Number(parts[3]);

    if (
      !Number.isFinite(totalKB) ||
      !Number.isFinite(usedKB) ||
      !Number.isFinite(freeKB) ||
      totalKB <= 0
    ) {
      return {
        total: null,
        free: null,
        used: null,
        usage: null,
      };
    }

    const totalBytes =
      totalKB * 1024;

    const usedBytes =
      usedKB * 1024;

    const freeBytes =
      freeKB * 1024;

    const totalGB = Math.round(
      totalBytes /
        1024 /
        1024 /
        1024
    );

    const freeGB = Math.round(
      freeBytes /
        1024 /
        1024 /
        1024
    );

    const usedGB = Math.round(
      usedBytes /
        1024 /
        1024 /
        1024
    );

    const usage = Math.round(
      (usedBytes / totalBytes) * 100
    );

    return {
      total: totalGB,
      free: freeGB,
      used: usedGB,
      usage,
    };
  } catch (error) {
    console.error(
      "Disk information error:",
      error
    );

    return {
      total: null,
      free: null,
      used: null,
      usage: null,
    };
  }
}

function isUnauthorizedError(
  error: unknown
) {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return false;
  }

  const value = error as {
    status?: number;
    statusCode?: number;
    name?: string;
    message?: string;
  };

  return (
    value.status === 401 ||
    value.statusCode === 401 ||
    value.name === "UnauthorizedError" ||
    value.name === "Unauthorized" ||
    value.message
      ?.toLowerCase()
      .includes("unauthorized") ||
    value.message
      ?.toLowerCase()
      .includes("not authenticated")
  );
}

export async function GET() {
  try {
    await requireAdminSession();

    let database = "Disconnected";
    let databasePing = 0;

    try {
      const start =
        performance.now();

      await prisma.$queryRaw`SELECT 1`;

      databasePing = Math.round(
        performance.now() - start
      );

      database = "Connected";
    } catch (error) {
      console.error(
        "Database health check error:",
        error
      );

      database = "Disconnected";
    }

    const totalMemory =
      os.totalmem();

    const freeMemory =
      os.freemem();

    const usedMemory =
      totalMemory - freeMemory;

    const totalGB = Math.round(
      totalMemory /
        1024 /
        1024 /
        1024
    );

    const freeGB = Math.round(
      freeMemory /
        1024 /
        1024 /
        1024
    );

    const usedGB = Math.round(
      usedMemory /
        1024 /
        1024 /
        1024
    );

    const memoryUsage = Math.round(
      (usedMemory / totalMemory) * 100
    );

    const cpuInfo = os.cpus();

    const cpuUsage =
      await getCpuUsage();

    const disk =
      await getDiskInfo();

    const health =
      database === "Connected"
        ? "Healthy"
        : "Warning";

    return NextResponse.json({
      success: true,

      data: {
        server: "Online",

        database,

        databasePing,

        health,

        environment:
          process.env.NODE_ENV,

        platform:
          os.platform(),

        hostname:
          os.hostname(),

        uptime:
          Math.floor(os.uptime()),

        memory: {
          total: totalGB,
          free: freeGB,
          used: usedGB,
          usage: memoryUsage,
        },

        cpu: {
          cores: cpuInfo.length,

          model:
            cpuInfo[0]?.model ??
            "Unknown CPU",

          usage: cpuUsage,
        },

        disk,

        node:
          process.version,

        next: "16.2.10",

        react: "19.2.4",

        prisma: "6.19.3",

        version: "0.1.0",
      },
    });
  } catch (error) {
    console.error(
      "System monitor error:",
      error
    );

    if (isUnauthorizedError(error)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load system information.",
      },
      {
        status: 500,
      }
    );
  }
}