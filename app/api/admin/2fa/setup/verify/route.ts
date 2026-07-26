import {
  NextResponse,
} from "next/server";


import {
  prisma,
} from "@/lib/prisma";


import {
  verifySync,
} from "otplib";



export async function POST(
  request: Request
) {

  try {


    const body =
      await request.json();



    const username =
      body.username;


    const token =
      body.token;



    if (
      !username ||
      !token
    ) {

      return NextResponse.json(
        {
          message:
            "Username and token are required.",
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
            "Admin user not found.",
        },
        {
          status:404,
        }
      );

    }



    if (
      !adminUser.twoFactorSecret
    ) {

      return NextResponse.json(
        {
          message:
            "2FA is not setup.",
        },
        {
          status:400,
        }
      );

    }



    const verified =
      verifySync(
        token,
        adminUser.twoFactorSecret
      );



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



    await prisma.adminUser.update({

      where:{
        id:
          adminUser.id,
      },


      data:{

        twoFactorEnabled:
          true,

      },

    });



    return NextResponse.json({

      success:true,

      message:
        "2FA verified successfully.",

    });



  } catch(error) {


    console.error(
      "2FA VERIFY ERROR:",
      error
    );



    return NextResponse.json(
      {
        message:
          "2FA verification failed.",
      },
      {
        status:500,
      }
    );

  }

}