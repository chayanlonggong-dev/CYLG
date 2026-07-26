import {
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



const MAX_LOGIN_ATTEMPTS = 5;

const LOCK_TIME =
  15 * 60 * 1000;



export async function POST(
  request: Request
) {

  try {


    const body =
      await request.json();



    const username =
      body.username;


    const password =
      body.password;


    const twoFactorToken =
      body.twoFactorToken;



    if (
      !username ||
      !password
    ) {

      return NextResponse.json(
        {
          message:
            "Username and password are required.",
        },
        {
          status:400,
        }
      );

    }



    const adminUser =
      await prisma.adminUser.findUnique({

        where:{
          username,
        },

      });



    if (!adminUser) {

      return NextResponse.json(
        {
          message:
            "Invalid username or password.",
        },
        {
          status:401,
        }
      );

    }



    // =========================
    // Account Lock Check
    // =========================

    if (
      adminUser.lockedUntil
      &&
      adminUser.lockedUntil > new Date()
    ) {

      return NextResponse.json(
        {
          message:
            "Account temporarily locked. Try again later.",
        },
        {
          status:423,
        }
      );

    }



    const valid =
      verifyPassword(
        password,
        adminUser.password
      );



    // =========================
    // Failed Login Handling
    // =========================

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



      return NextResponse.json(
        {
          message:
            "Invalid username or password.",
        },
        {
          status:401,
        }
      );

    }



    // =========================
    // Reset Failed Attempts
    // =========================

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



    // =========================
    // 2FA Check
    // =========================

    if (
      adminUser.twoFactorEnabled
    ) {


      if(
        !twoFactorToken
      ){

        return NextResponse.json(
          {
            requireTwoFactor:true,

            message:
              "Two factor authentication required.",
          },
          {
            status:200,
          }
        );

      }



      if(
        !adminUser.twoFactorSecret
      ){

        return NextResponse.json(
          {
            message:
              "2FA configuration error.",
          },
          {
            status:500,
          }
        );

      }



      const verified =
        verifySync({

          token:
            twoFactorToken,


          secret:
            adminUser.twoFactorSecret,

        });



      if(!verified){

        return NextResponse.json(
          {
            message:
              "Invalid 2FA code.",
          },
          {
            status:401,
          }
        );

      }

    }



    // =========================
    // Create Session
    // =========================


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



    const ip =
      request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim()
      ||
      request.headers.get("x-real-ip")
      ||
      "unknown";



    const userAgent =
      request.headers.get(
        "user-agent"
      )
      ||
      "unknown";



    await prisma.session.create({

      data:{

        token,

        adminUserId:
          adminUser.id,

        expiresAt,

        lastActivityAt:
          new Date(),

        ip,

        userAgent,

      },

    });



    const response =
      NextResponse.json(
        {
          message:
            "Login successful.",
        },
        {
          status:200,
        }
      );



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


    return NextResponse.json(
      {
        message:
          "Internal server error.",
      },
      {
        status:500,
      }
    );

  }

}