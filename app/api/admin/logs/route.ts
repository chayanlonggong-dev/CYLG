import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";


export async function GET() {

  try {

    const logs =
      await prisma.auditLog.findMany({

        orderBy: {
          createdAt: "desc",
        },

        take: 200,

      });


    const result = logs.map((log) => ({

      ...log,

      metadata:
        log.metadata
          ? JSON.parse(log.metadata)
          : null,

    }));


    return NextResponse.json({

      success: true,

      data: result,

    });


  } catch (error) {


    console.error(
      "Audit log fetch error:",
      error
    );


    return NextResponse.json(

      {
        success: false,
        message:
          "Failed to fetch audit logs",
      },

      {
        status: 500,
      }

    );

  }

}