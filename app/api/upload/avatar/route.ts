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





import {
  createUploadErrorResponse,
  hasUnsafePathTraversal,
  isAllowedExtension,
  isAllowedMimeType,
  isDangerousFile,
  logUploadEvent,
  sanitizeUploadFilename,
} from "@/lib/upload";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;


const ALLOWED_TYPES = [

  "image/jpeg",

  "image/png",

  "image/webp",

];

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
];







export async function POST(

  request: NextRequest

) {

  let sanitizedFileName = "unknown";
  let fileSize = 0;


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


      logUploadEvent({
        uploadType: "avatar",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "Too many upload requests."
        ),
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


      logUploadEvent({
        uploadType: "avatar",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "No file uploaded."
        ),
        {
          status:400,
        }
      );


    }









    sanitizedFileName =
      sanitizeUploadFilename(file.name);
    fileSize = file.size;

    if(
      hasUnsafePathTraversal(file.name) ||
      hasUnsafePathTraversal(sanitizedFileName) ||
      isDangerousFile(
        sanitizedFileName,
        file.type,
        ALLOWED_TYPES
      ) ||
      !isAllowedExtension(
        sanitizedFileName,
        ALLOWED_EXTENSIONS
      )
    ){


      logUploadEvent({
        uploadType: "avatar",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "Invalid file type."
        ),
        {
          status:400,
        }
      );


    }







    if(

      file.size >
      MAX_FILE_SIZE

    ){


      logUploadEvent({
        uploadType: "avatar",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "File size exceeds 10MB."
        ),
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
          sanitizedFileName,

      },

    });








    logUploadEvent({
      uploadType: "avatar",
      filename: sanitizedFileName,
      size: fileSize,
      success: true,
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


      logUploadEvent({
        uploadType: "avatar",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "Unauthorized."
        ),
        {
          status:401,
        }
      );


    }







    logUploadEvent({
      uploadType: "avatar",
      filename: sanitizedFileName,
      size: fileSize,
      success: false,
    });

    return NextResponse.json(
      createUploadErrorResponse(
        "Upload failed."
      ),
      {
        status:500,
      }
    );


  }


}