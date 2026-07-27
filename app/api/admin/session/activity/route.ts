import {
  NextRequest,
  NextResponse,
} from "next/server";


import {
  prisma,
} from "@/lib/prisma";

export async function POST(
  request: NextRequest
) {


  try {


    const token =
      request.cookies.get(
        "cylg_admin_session"
      )?.value;





    if(!token){


      return NextResponse.json(

        {
          success:false,

          message:
            "No session.",
        },

        {
          status:401,
        }

      );


    }






    const session =
      await prisma.session.findUnique({

        where:{
          token,
        },

      });







    if(!session){


      const response =
        NextResponse.json(

          {
            success:false,

            message:
              "Session expired.",
          },

          {
            status:401,
          }

        );



      response.cookies.delete(
        "cylg_admin_session"
      );



      return response;


    }








    if(

      session.expiresAt <= new Date()

    ){


      await prisma.session.delete({

        where:{
          id:
            session.id,
        },

      }).catch(()=>{});




      const response =
        NextResponse.json(

          {
            success:false,

            message:
              "Session expired.",
          },

          {
            status:401,
          }

        );



      response.cookies.delete(
        "cylg_admin_session"
      );



      return response;


    }








    await prisma.session.update({

      where:{
        id:
          session.id,
      },


      data:{


        lastActivityAt:
          new Date(),


      },


    });








    return NextResponse.json({

      success:true,

      message:
        "Activity updated.",

    });






  } catch(error){



    console.error(

      "Session activity error:",

      error

    );





    return NextResponse.json(

      {

        success:false,

        message:
          "Internal server error.",

      },

      {

        status:500,

      }

    );


  }


}