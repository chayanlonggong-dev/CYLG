import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";



const levels = [
  "crown",
  "sss",
  "ss",
  "s",
  "a",
];





export default async function sitemap()
: Promise<MetadataRoute.Sitemap> {


  const baseUrl =

    process.env.NEXT_PUBLIC_SITE_URL ||

    "https://cylg-production.vercel.app";





  const models =

    await prisma.model.findMany({

      select: {

        code: true,

        updatedAt: true,

      },


      orderBy: {

        createdAt: "desc",

      },

    });







  const modelUrls =

    models.map((model: {
      code: string;
      updatedAt: Date;
    }) => ({


      url:

        `${baseUrl}/models/${model.code}`,



      lastModified:

        model.updatedAt,



      changeFrequency:

        "weekly" as const,



      priority:

        0.8,


    }));









  const collectionUrls =

    levels.map((level) => ({


      url:

        `${baseUrl}/collection/${level}`,



      lastModified:

        new Date(),



      changeFrequency:

        "weekly" as const,



      priority:

        0.7,


    }));









  return [



    {


      url:

        baseUrl,



      lastModified:

        new Date(),



      changeFrequency:

        "daily",



      priority:

        1,


    },





    {


      url:

        `${baseUrl}/models`,



      lastModified:

        new Date(),



      changeFrequency:

        "daily",



      priority:

        0.9,


    },





    ...collectionUrls,



    ...modelUrls,



  ];

}