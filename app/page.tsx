import { prisma } from "@/lib/prisma";

import HomeClient from "./HomeClient";



export default async function Home(){


  const settings =
    await prisma.websiteSettings.findUnique({

      where:{
        id:1,
      },

    });





  const websiteSettings = {

    siteName:
      settings?.siteName ?? "ChaYanLongGong",


    whatsapp:
      settings?.whatsapp ?? "",


    telegram:
      settings?.telegram ?? "",


    signal:
      settings?.signal ?? "",


    line:
      settings?.line ?? "",


    wechatQr:
      settings?.wechatQr ?? "",


    email:
      settings?.email ?? "",



    enableWhatsapp:
      settings?.enableWhatsApp ?? true,


    enableTelegram:
      settings?.enableTelegram ?? true,


    enableSignal:
      settings?.enableSignal ?? false,


    enableLine:
      settings?.enableLine ?? false,


    enableWechat:
      settings?.enableWechat ?? false,


  };





  return (

    <HomeClient

      settings={
        websiteSettings
      }

    />

  );

}