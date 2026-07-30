import {
  NextRequest,
  NextResponse,
} from "next/server";


import QRCode from "qrcode";


import {
  generateSecret,
  generateURI,
} from "otplib";


import {
  prisma,
} from "@/lib/prisma";


import {
  getAdminSession,
} from "@/lib/auth/session";


import {
  rateLimit,
} from "@/lib/rateLimit";


import {
  createAuditLog,
} from "@/lib/audit/audit";

import {
  apiError,
  apiMethodNotAllowed,
  apiNotFound,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api/response";


export async function POST(
  request: NextRequest
) {

  try {

    const session =
      await getAdminSession();

    if(!session){
      return apiUnauthorized("Unauthorized.", "UNAUTHORIZED");
    }

    const limit =
      rateLimit(
        `2fa-setup:${session.adminUserId}`,
        {
          limit:5,
          windowMs:
            60 * 60 * 1000,
        }
      );

    if(!limit.success){
      return apiError("Too many requests.", 429, "RATE_LIMITED");
    }

    const adminUser =
      await prisma.adminUser.findUnique({
        where:{
          id:
            session.adminUserId,
        },
      });

    if(!adminUser){
      return apiNotFound("Admin user not found.", "ADMIN_USER_NOT_FOUND");
    }

    if (
      adminUser.twoFactorEnabled
    ) {
      return apiError(
        "Two-factor authentication is already enabled.",
        400,
        "TWO_FACTOR_ALREADY_ENABLED",
        { enabled: true }
      );
    }

    const secret =
      generateSecret();

    const otpauth =
      generateURI({
        issuer:
          "ChaYanLongGong Admin",
        label:
          adminUser.username,
        secret,
      });

    const qrCode =
      await QRCode.toDataURL(
        otpauth
      );

    await prisma.adminUser.update({
      where:{
        id:
          adminUser.id,
      },
      data:{
        twoFactorSecret:
          secret,
        twoFactorEnabled:
          false,
      },
    });

    createAuditLog({
      action:
        "UPDATE",
      entity:
        "AdminUser",
      entityId:
        adminUser.id,
      userId:
        String(
          adminUser.id
        ),
      description:
        "Admin generated new two-factor authentication setup.",
    });

    return apiSuccess({ qrCode }, "2FA setup generated.", 200);

  } catch(error){

    console.error(
      "2FA SETUP ERROR:",
      error
    );

    return apiServerError("2FA setup failed.", "TWO_FACTOR_SETUP_FAILED");

  }

}

export async function OPTIONS() {
  return apiMethodNotAllowed("Method not allowed for this route.", "METHOD_NOT_ALLOWED");
}
