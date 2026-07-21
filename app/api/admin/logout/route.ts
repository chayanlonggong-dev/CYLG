import { NextResponse } from "next/server";


export async function POST() {

  const response = NextResponse.json(
    {
      message: "Logout successful.",
    },
    {
      status: 200,
    }
  );


  response.cookies.delete(
    "cylg_admin_session"
  );


  return response;

}