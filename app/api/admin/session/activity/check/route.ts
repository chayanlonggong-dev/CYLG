import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  apiMethodNotAllowed,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api/response";

const SESSION_TIMEOUT =
  10 * 60 * 1000;

export async function GET(
  request: NextRequest
) {
  try {
    const token =
      request.cookies.get(
        "cylg_admin_session"
      )?.value;

    if(!token){
      return apiUnauthorized("No session.", "NO_SESSION");
    }

    const session =
      await prisma.session.findUnique({
        where:{
          token,
        },
      });

    if(!session){
      const response = apiUnauthorized("Session expired.", "SESSION_EXPIRED");
      response.cookies.delete("cylg_admin_session");
      return response;
    }

    if(
      session.expiresAt <= new Date()
    ){
      await prisma.session.delete({
        where:{
          token,
        },
      }).catch(()=>{});

      const response = apiUnauthorized("Session expired.", "SESSION_EXPIRED");
      response.cookies.delete("cylg_admin_session");
      return response;
    }

    const inactiveTime =
      Date.now()
      -
      new Date(
        session.lastActivityAt
      ).getTime();

    if(
      inactiveTime >= SESSION_TIMEOUT
    ){
      await prisma.session.delete({
        where:{
          token,
        },
      }).catch(()=>{});

      const response = apiUnauthorized("Session expired.", "SESSION_EXPIRED");
      response.cookies.delete("cylg_admin_session");
      return response;
    }

    return apiSuccess({ success: true, expired: false }, "Session active.", 200);
  } catch(error){
    console.error(
      "Session check error:",
      error
    );

    return apiServerError("Internal server error.", "SESSION_CHECK_FAILED");
  }
}

export async function POST() {
  return apiMethodNotAllowed("Method not allowed for this route.", "METHOD_NOT_ALLOWED");
}

export async function DELETE() {
  return apiMethodNotAllowed("Method not allowed for this route.", "METHOD_NOT_ALLOWED");
}