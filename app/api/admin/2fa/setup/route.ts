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





export async function POST(
  request: NextRequest
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


      return NextResponse.json(

        {
          message:
            "Too many requests.",
        },

        {
          status:429,
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

          success:false,

          enabled:true,


          message:
            "Two-factor authentication is already enabled.",

        },

        {
          status:400,
        }

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








    return NextResponse.json({

      success:true,

      qrCode,

    });







  } catch(error){



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