import {
  NextResponse,
} from "next/server";


import {
  prisma,
} from "@/lib/prisma";


import {
  getAdminSession,
} from "@/lib/auth/session";



// =========================
// GET ALL ADMIN SESSIONS
// =========================

export async function GET() {

  try {


    const currentSession =
      await getAdminSession();



    if(!currentSession){

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



    const sessions =
      await prisma.session.findMany({

        where:{
          adminUserId:
            currentSession.adminUserId,
        },


        orderBy:{
          createdAt:
            "desc",
        },


        select:{

          id:true,

          ip:true,

          userAgent:true,

          createdAt:true,

          lastActivityAt:true,

          expiresAt:true,

        },

      });



    return NextResponse.json({

      sessions,

      currentSessionId:
        currentSession.sessionId,

    });



  } catch(error){


    console.error(
      "GET ADMIN SESSIONS ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to fetch sessions.",
      },
      {
        status:500,
      }
    );

  }

}





// =========================
// DELETE SESSION
// =========================

export async function DELETE(
  request: Request
) {

  try {


    const currentSession =
      await getAdminSession();



    if(!currentSession){

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



    const sessionId =
      body.sessionId;



    if(!sessionId){

      return NextResponse.json(
        {
          message:
            "Session ID required.",
        },
        {
          status:400,
        }
      );

    }



    const targetSession =
      await prisma.session.findUnique({

        where:{
          id:
            sessionId,
        },

      });



    if(!targetSession){

      return NextResponse.json(
        {
          message:
            "Session not found.",
        },
        {
          status:404,
        }
      );

    }



    if(
      targetSession.adminUserId
      !==
      currentSession.adminUserId
    ){

      return NextResponse.json(
        {
          message:
            "Forbidden.",
        },
        {
          status:403,
        }
      );

    }



    await prisma.session.delete({

      where:{
        id:
          sessionId,
      },

    });



    return NextResponse.json({

      success:true,

      message:
        "Session revoked.",

    });



  } catch(error){


    console.error(
      "DELETE ADMIN SESSION ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to revoke session.",
      },
      {
        status:500,
      }
    );

  }

}