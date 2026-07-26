import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { generateSecret, generateURI } from "otplib";

import { prisma } from "@/lib/prisma";


export async function POST(
  request: NextRequest
) {

  try {

    const adminUser =
      await prisma.adminUser.findFirst();


    if (!adminUser) {

      return NextResponse.json(
        {
          message: "Admin user not found.",
        },
        {
          status: 404,
        }
      );

    }


    const secret =
      generateSecret();



    const otpauth =
      generateURI({
        issuer: "ChaYanLongGong Admin",
        label: adminUser.username,
        secret,
      });



    const qrCode =
      await QRCode.toDataURL(
        otpauth
      );



    await prisma.adminUser.update({

      where: {
        id: adminUser.id,
      },

      data: {

        twoFactorSecret: secret,

        twoFactorEnabled: false,

      },

    });



    return NextResponse.json({

      success: true,

      secret,

      qrCode,

    });


  } catch(error) {


    console.error(
      "2FA SETUP ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "2FA setup failed.",
      },
      {
        status:500,
      }
    );

  }

}