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
  100 * 1024 * 1024;






const ALLOWED_TYPES = [

  "video/mp4",

  "video/webm",

];

const ALLOWED_EXTENSIONS = [
  "mp4",
  "webm",
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

  let sanitizedFileName = "unknown";
  let fileSize = 0;


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


      logUploadEvent({
        uploadType: "video",
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
        uploadType: "video",
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
        uploadType: "video",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "Invalid video type."
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
        uploadType: "video",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "Video size exceeds 100MB."
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

          sanitizedFileName,


      },


    });









    logUploadEvent({
      uploadType: "video",
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









  } catch(error:any) {




    console.error(

      "VIDEO UPLOAD ERROR:",

      error

    );







    if(

      error.message ===

      "Unauthorized"

    ){


      logUploadEvent({
        uploadType: "video",
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
      uploadType: "video",
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