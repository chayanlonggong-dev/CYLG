import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";



const levels = [
  "CROWN",
  "SSS",
  "SS",
  "S",
  "A",
];



export default async function sitemap()
: Promise<MetadataRoute.Sitemap> {


  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://chayanlonggong.com";




  const models =
    await prisma.model.findMany({

      select:{

        code:true,

        updatedAt:true,

      },

      orderBy:{
        createdAt:"desc",
      },

    });







  const modelUrls =
    models.map((model)=>({

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
    levels.map((level)=>({

      url:
        `${baseUrl}/collection/${level}`,

      lastModified:
        new Date(),

      changeFrequency:
        "daily" as const,

      priority:
        0.7,

    }));








  return [

    {

      url:baseUrl,

      lastModified:new Date(),

      changeFrequency:
        "daily",

      priority:
        1,

    },


    {

      url:
        `${baseUrl}/models`,

      lastModified:new Date(),

      changeFrequency:
        "daily",

      priority:
        0.9,

    },


    ...collectionUrls,


    ...modelUrls,

  ];

}