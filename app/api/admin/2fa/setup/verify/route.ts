import {
  NextResponse,
} from "next/server";


import {
  prisma,
} from "@/lib/prisma";


import {
  verifySync,
} from "otplib";


import {
  getAdminSession,
} from "@/lib/auth/session";





export async function POST(
  request: Request
) {


  try {


    const session =
      await getAdminSession();



    if(!session){

      return NextResponse.json(
        {
          message:
            "Unauthorized.",
        },
        {
          status:401,
        }
      );

    }






    const body =
      await request.json();




    const token =
      body.token;





    if(!token){

      return NextResponse.json(
        {
          message:
            "Token is required.",
        },
        {
          status:400,
        }
      );

    }






    const adminUser =
      await prisma.adminUser.findUnique({

        where:{
          id:
            session.adminUserId,
        },

      });






    if(!adminUser){

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







    if(
      adminUser.twoFactorEnabled
    ){

      return NextResponse.json(
        {
          message:
            "Two-factor authentication is already enabled.",
        },
        {
          status:400,
        }
      );

    }








    if(
      !adminUser.twoFactorSecret
    ){

      return NextResponse.json(
        {
          message:
            "2FA setup has not started.",
        },
        {
          status:400,
        }
      );

    }







    const verified =
      verifySync({

        token,

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
        "2FA enabled successfully.",

    });






  } catch(error){


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