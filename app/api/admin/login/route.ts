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



    const valid =
      verifyPassword(
        password,
        adminUser.password
      );



    if (!valid) {

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
    // 2FA Check
    // =========================

    if (
      adminUser.twoFactorEnabled
    ) {


      if (
        !twoFactorToken
      ) {

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



      if (
        !adminUser.twoFactorSecret
      ) {

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


      const {
        verifySync,
      } = await import(
        "otplib"
      );


      const verified =
  verifySync({

    token:
      twoFactorToken,

    secret:
      adminUser.twoFactorSecret,

  });



      if (!verified) {

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