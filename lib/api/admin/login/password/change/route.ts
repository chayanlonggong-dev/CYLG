import {
  NextResponse,
} from "next/server";


import {
  prisma,
} from "@/lib/prisma";


import {
  verifyPassword,
  hashPassword,
} from "@/lib/auth/password";


import {
  validatePasswordStrength,
} from "@/lib/auth/passwordPolicy";



export async function POST(
  request: Request
) {

  try {


    const body =
      await request.json();



    const username =
      body.username;


    const currentPassword =
      body.currentPassword;


    const newPassword =
      body.newPassword;



    if (
      !username ||
      !currentPassword ||
      !newPassword
    ) {

      return NextResponse.json(
        {
          message:
            "Missing required fields.",
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



    const passwordValid =
      verifyPassword(
        currentPassword,
        adminUser.password
      );



    if (!passwordValid) {

      return NextResponse.json(
        {
          message:
            "Current password is incorrect.",
        },
        {
          status:401,
        }
      );

    }



    const strength =
      validatePasswordStrength(
        newPassword
      );



    if (!strength.valid) {

      return NextResponse.json(
        {
          message:
            "Password does not meet requirements.",
          
          errors:
            strength.errors,
        },
        {
          status:400,
        }
      );

    }



    const hashedPassword =
      hashPassword(
        newPassword
      );



    await prisma.adminUser.update({

      where:{
        id:
          adminUser.id,
      },


      data:{

        password:
          hashedPassword,

      },

    });



    return NextResponse.json({

      success:true,

      message:
        "Password changed successfully.",

    });



  } catch(error) {


    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );



    return NextResponse.json(
      {
        message:
          "Password change failed.",
      },
      {
        status:500,
      }
    );

  }

}