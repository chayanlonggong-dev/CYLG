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

        `gallery-upload:${ip}`,

        {

          limit:20,

          windowMs:
            60 * 1000,

        }

      );







    if(!rate.success){


      logUploadEvent({
        uploadType: "gallery",
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








    const data =
      await request.formData();






    const file =
      data.get("file") as File;






    if(!file){


      logUploadEvent({
        uploadType: "gallery",
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
        uploadType: "gallery",
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
        uploadType: "gallery",
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
                "cylg/gallery",



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
        "Gallery",


      userId:
        String(
          session.adminUserId
        ),


      description:
        "Admin uploaded gallery image.",


      metadata:{

        ip,

        fileName:
          sanitizedFileName,

      },

    });








    logUploadEvent({
      uploadType: "gallery",
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

      "GALLERY UPLOAD ERROR:",

      error

    );







    if(

      error.message ===

      "Unauthorized"

    ){


      logUploadEvent({
        uploadType: "gallery",
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
      uploadType: "gallery",
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