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
  5 * 1024 * 1024;


const ALLOWED_TYPES = [

  "image/jpeg",

  "image/png",

  "image/webp",

];







export async function POST(

  request: NextRequest

) {


  try {


    const session =
      await requireAdminSession();





    const ip =
      request.headers

        .get("x-forwarded-for")

        ?.split(",")[0]

        ?.trim()

      ||

      "unknown";







    const rate =
      rateLimit(

        `avatar-upload:${ip}`,

        {

          limit:10,

          windowMs:
            60 * 1000,

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







    const formData =
      await request.formData();





    const file =
      formData.get("file") as File;






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
            "Invalid file type.",

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
            "File size exceeds 5MB.",

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
                "cylg/avatar",



              resource_type:
                "image",




              transformation:[


                {

                  quality:
                    "auto",

                },


                {

                  fetch_format:
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
        "Avatar",


      userId:
        String(
          session.adminUserId
        ),


      description:
        "Admin uploaded avatar image.",


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







  } catch(error:any){



    console.error(

      "AVATAR UPLOAD ERROR:",

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