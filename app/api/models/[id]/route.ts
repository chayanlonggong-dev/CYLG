import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


interface Params {
  params: Promise<{
    id: string;
  }>;
}




export async function GET(
  request: NextRequest,
  { params }: Params
) {

  try {

    const { id } =
      await params;


    const model =
      await prisma.model.findUnique({

        where:{
          code:id,
        },

      });



    if(!model){

      return NextResponse.json(
        {
          message:"Model not found.",
        },
        {
          status:404,
        }
      );

    }



    return NextResponse.json(model);



  }catch(error){

    console.error(error);


    return NextResponse.json(
      {
        message:"Failed to fetch model.",
      },
      {
        status:500,
      }
    );

  }

}






export async function PUT(
  request: NextRequest,
  { params }: Params
){

  try{


    const { id } =
      await params;


    const body =
      await request.json();



    const oldModel =
      await prisma.model.findUnique({

        where:{
          id:Number(id),
        },

      });



    if(!oldModel){

      return NextResponse.json(
        {
          message:"Model not found.",
        },
        {
          status:404,
        }
      );

    }




    const level =
      body.level ?? oldModel.level;



    const number =
      Number(
        body.number ??
        oldModel.number
      );



    const code =
      level +
      String(number)
        .padStart(3,"0");





    const model =
      await prisma.model.update({

        where:{
          id:Number(id),
        },


        data:{


          level,

          number,

          code,



          title:
            body.title ?? "",



          age:
            Number(body.age ?? 18),



          height:
            Number(body.height ?? 160),



          weight:
            Number(body.weight ?? 50),



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
            Boolean(body.online),



          featured:
            Boolean(body.featured),


        },


      });



    return NextResponse.json(model);



  }catch(error){


    console.error(error);



    return NextResponse.json(
      {
        message:"Update failed.",
      },
      {
        status:500,
      }
    );

  }

}







export async function DELETE(
  request: NextRequest,
  { params }: Params
){

  try{


    const { id } =
      await params;



    await prisma.model.delete({

      where:{
        id:Number(id),
      },

    });



    return NextResponse.json({

      success:true,

    });



  }catch(error){


    console.error(error);



    return NextResponse.json(
      {
        message:"Delete failed.",
      },
      {
        status:500,
      }
    );

  }

}