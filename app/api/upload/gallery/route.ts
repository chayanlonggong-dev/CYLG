import { NextRequest, NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";


export async function POST(
  request: NextRequest
) {

  try {

    const data =
      await request.formData();


    const file =
      data.get("file") as File;


    if (!file) {

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
            },


            (
              error,
              result
            ) => {


              if(error){

                reject(error);

              } else {

                resolve(result);

              }


            }

          ).end(buffer);


        }
      );





    return NextResponse.json(
      {
        success:true,

        url:
          uploadResult.secure_url,
      }
    );



  } catch(error) {


    console.error(
      "GALLERY UPLOAD ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Upload failed.",

        error:
          String(error),
      },
      {
        status:500,
      }
    );


  }

}