import { prisma } from "@/lib/prisma";

import HomeClient from "./HomeClient";



export default async function Home(){


  const settings = await prisma.websiteSettings.findUnique({

    where:{
      id:1
    }

  });



  return (

    <HomeClient

      settings={settings}

    />

  );

}