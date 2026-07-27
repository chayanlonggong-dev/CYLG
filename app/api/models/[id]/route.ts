import {
  NextRequest,
  NextResponse,
} from "next/server";


import {
  prisma,
} from "@/lib/prisma";


import {
  requireAdminSession,
} from "@/lib/auth/session";


import {
  rateLimit,
} from "@/lib/rateLimit";


import {
  createAuditLog,
} from "@/lib/audit/audit";





interface Params {

  params: Promise<{

    id:string;

  }>;

}








// =========================
// GET MODEL
// =========================

export async function GET(

  request:NextRequest,

  { params }:Params

){


  try{


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
          message:
            "Model not found.",
        },

        {
          status:404,
        }

      );


    }






    return NextResponse.json(
      model
    );





  }catch(error){


    console.error(error);



    return NextResponse.json(

      {
        message:
          "Failed to fetch model.",
      },

      {
        status:500,
      }

    );


  }


}









// =========================
// UPDATE MODEL
// =========================

export async function PUT(

  request:NextRequest,

  { params }:Params

){


  try{


    const session =
      await requireAdminSession();





    const limit =
      rateLimit(

        `model-update:${session.adminUserId}`,

        {

          limit:30,

          windowMs:
            60 * 60 * 1000,

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
          message:
            "Model not found.",
        },

        {
          status:404,
        }

      );


    }








    const level =
      body.level ??
      oldModel.level;



    const number =
      Number(

        body.number ??
        oldModel.number

      );




    const code =
      level +

      String(number)
        .padStart(
          3,
          "0"
        );







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
            body.title ??
            oldModel.title,


          age:
            Number(
              body.age ??
              oldModel.age
            ),


          height:
            Number(
              body.height ??
              oldModel.height
            ),


          weight:
            Number(
              body.weight ??
              oldModel.weight
            ),


          nationality:
            body.nationality ??
            oldModel.nationality,


          city:
            body.city ??
            oldModel.city,


          languages:
            body.languages ??
            oldModel.languages,


          services:
            body.services ??
            oldModel.services,


          avatar:
            body.avatar ??
            oldModel.avatar,


          gallery:
            body.gallery ??
            oldModel.gallery,


          videos:
            body.videos ??
            oldModel.videos,


          introduction:
            body.introduction ??
            oldModel.introduction,


          online:
            Boolean(
              body.online
            ),


          featured:
            Boolean(
              body.featured
            ),


        },


      });







    createAuditLog({

      action:
        "UPDATE",


      entity:
        "Model",


      entityId:
        model.id,


      userId:
        String(
          session.adminUserId
        ),


      description:
        "Admin updated model.",


    });








    return NextResponse.json(
      model
    );





  }catch(error){


    console.error(error);



    return NextResponse.json(

      {
        message:
          "Update failed.",
      },

      {
        status:500,
      }

    );


  }


}









// =========================
// DELETE MODEL
// =========================

export async function DELETE(

  request:NextRequest,

  { params }:Params

){


  try{


    const session =
      await requireAdminSession();





    const limit =
      rateLimit(

        `model-delete:${session.adminUserId}`,

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
            "Too many requests.",
        },

        {
          status:429,
        }

      );


    }







    const { id } =
      await params;








    const model =
      await prisma.model.findUnique({

        where:{
          id:Number(id),
        },

      });






    if(!model){


      return NextResponse.json(

        {
          message:
            "Model not found.",
        },

        {
          status:404,
        }

      );


    }







    await prisma.model.delete({

      where:{
        id:Number(id),
      },

    });








    createAuditLog({

      action:
        "DELETE",


      entity:
        "Model",


      entityId:
        model.id,


      userId:
        String(
          session.adminUserId
        ),


      description:
        "Admin deleted model.",


    });








    return NextResponse.json({

      success:true,

    });







  }catch(error){


    console.error(error);



    return NextResponse.json(

      {
        message:
          "Delete failed.",
      },

      {
        status:500,
      }

    );


  }


}