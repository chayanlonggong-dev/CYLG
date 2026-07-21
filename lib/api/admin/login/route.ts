import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  verifyPassword,
} from "@/lib/auth/password";



export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();


    const {
      username,
      password,
    } = body;



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





    const admin =
      await prisma.adminUser.findUnique({

        where:{
          username,
        },

      });





    if(!admin){

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
        admin.password
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
          success:true,
          message:
            "Login successful.",
        }
      );






    response.cookies.set(
      "cylg_admin_session",
      String(admin.id),
      {

        httpOnly:true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          "lax",

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