import {
  NextRequest,
  NextResponse,
} from "next/server";


import {
  prisma,
} from "@/lib/prisma";


import {
  verifyPassword,
} from "@/lib/auth/password";


import {
  randomBytes,
} from "crypto";


import {
  verifySync,
} from "otplib";


import {
  rateLimit,
} from "@/lib/rateLimit";


import {
  createAuditLog,
} from "@/lib/audit/audit";

import {
  apiBadRequest,
  apiMethodNotAllowed,
  apiServerError,
  apiUnauthorized,
} from "@/lib/api/response";
import { apiError, apiSuccess } from "@/lib/api/response";

import {
  isEmptyJsonBody,
  parseRequestJson,
} from "@/lib/api/request";





const MAX_LOGIN_ATTEMPTS = 5;


const LOCK_TIME =
  15 * 60 * 1000;





export async function POST(
  request: NextRequest
) {


  try {


    const ip =
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim()
        ||
        request.headers.get(
          "x-real-ip"
        )
        ||
        "unknown";





    const limit =
      rateLimit(

        `admin-login:${ip}`,

        {
          limit:5,

          windowMs:
            60 * 1000,

        }

      );




    if (!limit.success) {
      return apiError(
        "Too many login attempts. Please try again later.",
        429,
        "RATE_LIMITED"
      );
    }








    const { body, error } = await parseRequestJson<Record<string, unknown>>(request);

    if (error === "INVALID_JSON") {
      return apiBadRequest("Invalid JSON body.", "INVALID_JSON");
    }

    if (!body || isEmptyJsonBody(body)) {
      return apiBadRequest("Request body is required.", "EMPTY_BODY");
    }





    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const twoFactorToken = typeof body.twoFactorToken === "string" ? body.twoFactorToken : "";






    if (
      !username ||
      !password
    ) {


      return apiBadRequest("Username and password are required.", "MISSING_CREDENTIALS");


    }









    const adminUser =
      await prisma.adminUser.findUnique({


        where:{
          username,
        },


      });







    if (!adminUser) {
      return apiUnauthorized("Invalid username or password.", "INVALID_CREDENTIALS");
    }









    if (
      adminUser.lockedUntil
      &&
      adminUser.lockedUntil > new Date()
    ) {
      return apiError("Account temporarily locked. Try again later.", 423, "ACCOUNT_LOCKED");
    }








    const valid =
      verifyPassword(

        password,

        adminUser.password

      );








    if (!valid) {


      const attempts =
        adminUser.failedLoginAttempts + 1;



      const shouldLock =
        attempts >= MAX_LOGIN_ATTEMPTS;





      await prisma.adminUser.update({


        where:{
          id:
            adminUser.id,
        },


        data:{


          failedLoginAttempts:
            shouldLock
            ?
            0
            :
            attempts,



          lockedUntil:
            shouldLock
            ?

            new Date(

              Date.now()

              +

              LOCK_TIME

            )

            :

            null,


        },


      });






      return apiUnauthorized("Invalid username or password.", "INVALID_CREDENTIALS");


    }









    if (

      adminUser.failedLoginAttempts > 0

      ||

      adminUser.lockedUntil

    ) {


      await prisma.adminUser.update({


        where:{
          id:
            adminUser.id,
        },


        data:{


          failedLoginAttempts:
            0,


          lockedUntil:
            null,


        },


      });


    }









    if (

      adminUser.twoFactorEnabled

    ) {



      if (!twoFactorToken) {
        return apiSuccess(
          { requireTwoFactor: true },
          "Two factor authentication required.",
          200
        );
      }






      if (
        !adminUser.twoFactorSecret
      ) {
        return apiServerError("2FA configuration error.", "INVALID_2FA_CONFIGURATION");
      }







      const verified =
        verifySync({

          token:
            twoFactorToken,


          secret:
            adminUser.twoFactorSecret,

        });






      if (!verified) {
        return apiUnauthorized("Invalid 2FA code.", "INVALID_2FA_CODE");
      }


    }









    const token =
      randomBytes(32)
      .toString("hex");







    const expiresAt =
      new Date(

        Date.now()

        +

        1000 *
        60 *
        60 *
        24 *
        7

      );






    const userAgent =
      request.headers.get(
        "user-agent"
      )
      ||
      "unknown";








    const session = await prisma.session.create({
  data: {
    token,
    adminUserId: adminUser.id,
    expiresAt,
    lastActivityAt: new Date(),
    ip,
    userAgent,
  },
});

if (!session) {
  return apiServerError(
    "Failed to create session.",
    "SESSION_CREATE_FAILED"
  );
}







    await createAuditLog({

      action:
        "LOGIN",


      entity:
        "AdminUser",


      entityId:
        adminUser.id,


      userId:
        String(adminUser.id),


      description:
        "Admin login successful.",


      metadata:{

        ip,

        userAgent,

      },


    });








    const response = apiSuccess(null, "Login successful.", 200);








    response.cookies.set(

      "cylg_admin_session",

      token,

      {


        httpOnly:true,


        secure:
          process.env.NODE_ENV
          ===
          "production",


        sameSite:"lax",


        maxAge:

          60 *
          60 *
          24 *
          7,


        path:"/",


      }


    );






    return response;






  } catch(error) {


    console.error(

      "Admin login error:",

      error

    );





    return apiServerError("Internal server error.", "ADMIN_LOGIN_FAILED");


  }


}

export async function OPTIONS() {
  return apiMethodNotAllowed("Method not allowed for this route.", "METHOD_NOT_ALLOWED");
}