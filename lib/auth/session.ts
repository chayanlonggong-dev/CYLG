import {
  cookies,
} from "next/headers";

import {
  prisma,
} from "@/lib/prisma";


const SESSION_TIMEOUT =
  10 * 60 * 1000;



export async function getAdminSession() {

  const cookieStore =
    await cookies();


  const token =
    cookieStore.get(
      "cylg_admin_session"
    )?.value;



  if (!token) {
    return null;
  }



  const session =
    await prisma.session.findUnique({

      where:{
        token,
      },

      include:{
        adminUser:{
          select:{
            id:true,
            username:true,
            twoFactorEnabled:true,
          },
        },
      },

    });



  if(!session){

    return null;

  }



  const now =
    new Date();



  // =========================
  // Expired Session
  // =========================

  if(
    session.expiresAt <= now
  ){

    await prisma.session.delete({

      where:{
        id:session.id,
      },

    }).catch(()=>{});


    return null;

  }



  // =========================
  // Idle Timeout
  // =========================

  const timeout =
    new Date(
      Date.now()
      -
      SESSION_TIMEOUT
    );



  if(
    session.lastActivityAt < timeout
  ){

    await prisma.session.delete({

      where:{
        id:session.id,
      },

    }).catch(()=>{});


    return null;

  }



  // =========================
  // Refresh Activity
  // =========================

  await prisma.session.update({

    where:{
      id:session.id,
    },

    data:{
      lastActivityAt:
        now,
    },

  });



  return {

    sessionId:
      session.id,


    token:
      session.token,


    adminUserId:
      session.adminUserId,


    username:
      session.adminUser.username,


    twoFactorEnabled:
      session.adminUser.twoFactorEnabled,


    expiresAt:
      session.expiresAt,


    lastActivityAt:
      now,

  };

}





export async function requireAdminSession(){

  const session =
    await getAdminSession();



  if(!session){

    throw new Error(
      "Unauthorized"
    );

  }


  return session;

}