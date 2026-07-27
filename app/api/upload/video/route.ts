import {
  NextRequest,
  NextResponse,
} from "next/server";


import cloudinary from "@/lib/cloudinary";


import {
  requireAdminSession,
} from "@/lib/auth/session";


import {
  rateLimit,
} from "@/lib/rateLimit";


import {
  createAuditLog,
} from "@/lib/audit/audit";







const MAX_FILE_SIZE =
  100 * 1024 * 1024;






const ALLOWED_TYPES = [

  "video/mp4",

  "video/webm",

  "video/quicktime",

];









function getClientIp(
  request: NextRequest
){

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









export async function POST(

  request: NextRequest

) {


  try {





    const session =
      await requireAdminSession();








    const ip =
      getClientIp(request);








    const rate =

      rateLimit(

        `video-upload:${ip}`,

        {

          limit:5,

          windowMs:

            60 * 60 * 1000,

        }

      );







    if(!rate.success){


      return NextResponse.json(

        {

          message:

            "Too many upload requests.",

        },

        {

          status:429,

        }

      );


    }









    const data =

      await request.formData();






    const file =

      data.get("file") as File;








    if(!file){


      return NextResponse.json(

        {

          message:

            "No file uploaded.",

        },

        {

          status:400,

        }

      );


    }









    if(

      !ALLOWED_TYPES.includes(

        file.type

      )

    ){


      return NextResponse.json(

        {

          message:

            "Invalid video type.",

        },

        {

          status:400,

        }

      );


    }









    if(

      file.size >

      MAX_FILE_SIZE

    ){


      return NextResponse.json(

        {

          message:

            "Video size exceeds 100MB.",

        },

        {

          status:400,

        }

      );


    }









    const bytes =

      await file.arrayBuffer();





    const buffer =

      Buffer.from(bytes);









    const uploadResult =

      await new Promise<any>(

        (

          resolve,

          reject

        ) => {



          cloudinary.uploader.upload_stream(

            {


              folder:

                "cylg/video",




              resource_type:

                "video",






              transformation:[

                {

                  quality:

                    "auto",

                },

              ],


            },



            (

              error,

              result

            ) => {



              if(error){


                reject(error);


              }

              else{


                resolve(result);


              }


            }



          ).end(buffer);



        }

      );









    createAuditLog({

      action:

        "UPLOAD",



      entity:

        "Video",



      userId:

        String(

          session.adminUserId

        ),




      description:

        "Admin uploaded video.",




      metadata:{


        ip,


        fileName:

          file.name,


      },


    });









    return NextResponse.json(

      {


        success:true,



        url:

          uploadResult.secure_url,



      },


      {

        status:200,

      }


    );









  } catch(error:any) {




    console.error(

      "VIDEO UPLOAD ERROR:",

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

          "Upload failed.",

      },

      {

        status:500,

      }

    );


  }


}