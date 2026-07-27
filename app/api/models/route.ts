import {
  NextRequest,
  NextResponse,
} from "next/server";


import {
  getAllModels,
  createModel,
} from "@/lib/modelService";


import {
  requireAdminSession,
} from "@/lib/auth/session";


import {
  rateLimit,
} from "@/lib/rateLimit";





function getClientIp(
  request: NextRequest
) {

  return (

    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim()

    ||

    request.headers.get(
      "x-real-ip"
    )

    ||

    "unknown"

  );

}







// =======================
// GET ALL MODELS
// =======================

export async function GET(

  request: NextRequest

) {


  try {


    const ip =
      getClientIp(request);



    const limit =
      rateLimit(

        `models-get:${ip}`,

        {

          limit:60,

          windowMs:
            60 * 1000,

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






    const { searchParams } =

      new URL(
        request.url
      );




    const search =

      searchParams

        .get("search")

        ?.trim()

      ||

      "";





    const level =

      searchParams

        .get("level")

        ?.trim()

      ||

      "";







    const models =

      await getAllModels();






    const filtered =

      models.filter(

        (model:any)=>{


          const matchLevel =

            !level

            ||

            level === "ALL"

            ||

            model.level === level;





          const keyword =

            search.toLowerCase();





          const matchSearch =

            !search

            ||

            model.code

              .toLowerCase()

              .includes(keyword)

            ||

            model.title

              ?.toLowerCase()

              .includes(keyword)

            ||

            model.city

              ?.toLowerCase()

              .includes(keyword)

            ||

            model.nationality

              ?.toLowerCase()

              .includes(keyword);





          return (

            matchLevel

            &&

            matchSearch

          );


        }

      );






    return NextResponse.json(

      filtered

    );





  } catch(error){


    console.error(

      "GET MODELS ERROR:",

      error

    );



    return NextResponse.json(

      {

        message:

          "Failed to fetch models.",

      },

      {

        status:500,

      }

    );


  }


}









// =======================
// CREATE MODEL
// =======================

export async function POST(

  request: NextRequest

) {


  try {


    // Admin Protection

    await requireAdminSession();






    const ip =

      getClientIp(request);





    const limit =

      rateLimit(

        `models-create:${ip}`,

        {

          limit:10,

          windowMs:

            60 * 60 * 1000,

        }

      );





    if(!limit.success){


      return NextResponse.json(

        {

          message:

            "Too many create requests.",

        },

        {

          status:429,

        }

      );


    }







    const body =

      await request.json();







    const model =

      await createModel({




        level:

          body.level ||

          "CROWN",




        title:

          body.title ?? "",





        age:

          Number(

            body.age ?? 18

          ),




        height:

          Number(

            body.height ?? 160

          ),




        weight:

          Number(

            body.weight ?? 50

          ),




        nationality:

          body.nationality ?? "",





        city:

          body.city ?? "",





        languages:

          body.languages ?? "",





        services:

          body.services ?? "",





        avatar:

          body.avatar ?? "",





        gallery:

          body.gallery ?? "",





        videos:

          body.videos ?? "",





        introduction:

          body.introduction ?? "",





        online:

          body.online ?? true,





        featured:

          body.featured ?? false,





      });







    return NextResponse.json(

      model,

      {

        status:201,

      }

    );







  } catch(error:any){



    console.error(

      "CREATE MODEL ERROR:",

      error

    );




    if(

      error.message ===

      "Unauthorized"

    ){


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






    return NextResponse.json(

      {

        message:

          "Create model failed.",

      },

      {

        status:500,

      }

    );


  }


}