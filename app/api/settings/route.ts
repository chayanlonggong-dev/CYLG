import {
  NextResponse,
} from "next/server";


import {
  prisma,
} from "@/lib/prisma";


import {
  unlink,
} from "fs/promises";


import path from "path";


import {
  requireAdminSession,
} from "@/lib/auth/session";


import {
  rateLimit,
} from "@/lib/rateLimit";


import {
  createAuditLog,
} from "@/lib/audit/audit";








// =======================
// GET SETTINGS
// =======================

export async function GET() {


  try {


    let settings =
      await prisma.websiteSettings.findUnique({

        where:{
          id:1,
        },

      });





    if(!settings){


      settings =
        await prisma.websiteSettings.create({


          data:{


            id:1,


            siteName:
              "ChaYanLongGong",


            logo:"",


            favicon:"",


            whatsapp:"",


            telegram:"",


            signal:"",


            line:"",


            wechatQr:"",


            email:"",


            enableWhatsApp:true,


            enableTelegram:true,


            enableSignal:false,


            enableLine:false,


            enableWechat:false,


            enableFeedbackEmail:true,


          },


        });


    }






    return NextResponse.json(
      settings
    );





  }catch(error){


    console.error(error);



    return NextResponse.json(

      {

        success:false,

        message:
          "Failed to load website settings.",

      },

      {

        status:500,

      }

    );


  }


}









// =======================
// DELETE FAVICON
// =======================

export async function DELETE(

  request:Request

){


  try{


    const session =
      await requireAdminSession();





    const limit =
      rateLimit(

        `settings-delete:${session.adminUserId}`,

        {

          limit:5,

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







    const body =
      await request.json();





    const storedPath =
      typeof body?.path === "string"
      ?
      body.path
      :
      "";






    if(storedPath){


      const relativePath =
        storedPath.replace(
          /^\/+/,
          ""
        );



      const absolutePath =
        path.join(

          process.cwd(),

          "public",

          relativePath

        );



      try{


        await unlink(
          absolutePath
        );


      }catch(error:any){


        if(
          error?.code !== "ENOENT"
        ){

          throw error;

        }


      }


    }








    const settings =
      await prisma.websiteSettings.update({


        where:{
          id:1,
        },


        data:{


          favicon:"",


        },


      });







    createAuditLog({

      action:
        "UPDATE",


      entity:
        "WebsiteSettings",


      entityId:
        1,


      userId:
        String(
          session.adminUserId
        ),


      description:
        "Admin deleted website favicon.",


    });








    return NextResponse.json({


      success:true,


      settings,


    });






  }catch(error){


    console.error(error);



    return NextResponse.json(

      {

        success:false,

        message:
          "Failed to delete favicon.",

      },

      {

        status:500,

      }

    );


  }


}









// =======================
// UPDATE SETTINGS
// =======================

export async function PUT(

  request:Request

){


  try{


    const session =
      await requireAdminSession();







    const limit =
      rateLimit(

        `settings-update:${session.adminUserId}`,

        {

          limit:20,

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








    const body =
      await request.json();







    const settings =
      await prisma.websiteSettings.upsert({


        where:{
          id:1,
        },


        update:{


          siteName:
            body.siteName ?? "",


          logo:
            body.logo ?? "",


          favicon:
            body.favicon ?? "",


          whatsapp:
            body.whatsapp ?? "",


          telegram:
            body.telegram ?? "",


          signal:
            body.signal ?? "",


          line:
            body.line ?? "",


          wechatQr:
            body.wechatQr ?? "",


          email:
            body.email ?? "",


          enableWhatsApp:
            body.enableWhatsApp ?? true,


          enableTelegram:
            body.enableTelegram ?? true,


          enableSignal:
            body.enableSignal ?? false,


          enableLine:
            body.enableLine ?? false,


          enableWechat:
            body.enableWechat ?? false,


          enableFeedbackEmail:
            body.enableFeedbackEmail ?? true,


        },





        create:{


          id:1,


          siteName:
            body.siteName ?? "ChaYanLongGong",


          logo:
            body.logo ?? "",


          favicon:
            body.favicon ?? "",


          whatsapp:
            body.whatsapp ?? "",


          telegram:
            body.telegram ?? "",


          signal:
            body.signal ?? "",


          line:
            body.line ?? "",


          wechatQr:
            body.wechatQr ?? "",


          email:
            body.email ?? "",


          enableWhatsApp:
            body.enableWhatsApp ?? true,


          enableTelegram:
            body.enableTelegram ?? true,


          enableSignal:
            body.enableSignal ?? false,


          enableLine:
            body.enableLine ?? false,


          enableWechat:
            body.enableWechat ?? false,


          enableFeedbackEmail:
            body.enableFeedbackEmail ?? true,


        },


      });








    createAuditLog({

      action:
        "SETTINGS_CHANGE",


      entity:
        "WebsiteSettings",


      entityId:
        1,


      userId:
        String(
          session.adminUserId
        ),


      description:
        "Admin updated website settings.",


    });








    return NextResponse.json({


      success:true,


      settings,


    });







  }catch(error){


    console.error(error);



    return NextResponse.json(

      {

        success:false,

        message:
          "Failed to save website settings.",

      },

      {

        status:500,

      }

    );


  }


}