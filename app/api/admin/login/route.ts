import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  verifyPassword,
} from "@/lib/auth/password";





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




    if(
      !username ||
      !password
    ){

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







    if(!adminUser){

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







    if(!valid){

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
      adminUser.id.toString(),
      {
        httpOnly:true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:"lax",

        maxAge:
          60 * 60 * 24 * 7,

        path:"/",
      }
    );







    return response;






  } catch(error){


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

