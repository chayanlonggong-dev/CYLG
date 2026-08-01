import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

import { notFound } from "next/navigation";


import ModelHero from "@/components/model/ModelHero";
import ModelGallery from "@/components/model/ModelGallery";
import ModelInfo from "@/components/model/ModelInfo";
import ModelVideos from "@/components/model/ModelVideos";



interface PageProps {

  params: Promise<{

    id: string;

  }>;

}





export async function generateMetadata({

  params,

}: PageProps): Promise<Metadata> {


  const { id } = await params;



  const model =

    await prisma.model.findFirst({

      where: {

        code: id,

      },

    });



  if (!model) {

    return {

      title:
        "Model Not Found | ChaYanLongGong",

    };

  }



  const baseUrl =

    process.env.NEXT_PUBLIC_SITE_URL ||

    "https://https://chayanlonggong.vercel.app";




  const title =

    `${model.code} | ChaYanLongGong Luxury Elite Collection`;





  const description =

    `Discover ${model.code} from ChaYanLongGong luxury elite collection. Premium private experience with an exclusive model profile.`;

  const galleryImages =

    model.gallery

      ? model.gallery

          .split(",")

          .map((img: string) => img.trim())

          .filter(Boolean)

      : [];

  const allImages = [model.avatar, ...galleryImages].filter(Boolean);

  const keywords = [
    "luxury escort",
    "elite companion",
    "premium service",
    model.code,
  ].join(", ");





  return {


    title,


    description,

    keywords,

    robots: "index, follow, max-image-preview:large",

    alternates: {

      canonical:

        `${baseUrl}/models/${model.code}`,

    },



    openGraph: {


      title,


      description,


      url:

        `${baseUrl}/models/${model.code}`,



      siteName:

        "ChaYanLongGong",



      locale:

        "en_US",



      type:

        "website",



      images: allImages.map((img, idx) => ({
        url: img,
        width: 1200,
        height: idx === 0 ? 1600 : 900,
        alt: idx === 0 ? model.code : `${model.code} gallery image ${idx}`,
        secureUrl: img.startsWith("https") ? img : `${baseUrl}${img}`,
        type: "image/jpeg",
      })),


    },



    twitter: {


      card:

        "summary_large_image",



      title,



      description,

      creator: "@ChaYanLongGong",

      images: allImages.slice(0, 4),


    },


  };


}








export default async function ModelPage({

  params,

}: PageProps) {



  const { id } = await params;



  const model =

    await prisma.model.findFirst({


      where: {


        code: id,


      },


    });





  if (!model) {

    notFound();

  }







  const settings =

    await prisma.websiteSettings.findUnique({


      where: {


        id: 1,


      },


    });








  const gallery: string[] =


    model.gallery


      ? model.gallery

          .split(",")

          .map(

            (item: string) => item.trim()

          )

          .filter(Boolean)


      : [];









  const languages: string[] =


    model.languages


      ? model.languages

          .split(",")

          .map(

            (item: string) => item.trim()

          )

          .filter(Boolean)


      : [];









  const videos: string[] =


    model.videos


      ? model.videos

          .split(",")

          .map(

            (item: string) => item.trim()

          )

          .filter(Boolean)


      : [];









  const images: string[] = [


    model.avatar,


    ...gallery,


  ].filter(Boolean);








  return (


    <main

      className="
        min-h-screen
        bg-black
      "

    >




      <ModelHero


        id={model.code}



        image={model.avatar}




        whatsapp={

          settings?.whatsapp ?? ""

        }



        telegram={

          settings?.telegram ?? ""

        }



        signal={

          settings?.signal ?? ""

        }



        line={

          settings?.line ?? ""

        }



        wechatQr={

          settings?.wechatQr ?? ""

        }



        enableWhatsapp={

          settings?.enableWhatsApp ?? false

        }



        enableTelegram={

          settings?.enableTelegram ?? false

        }



        enableSignal={

          settings?.enableSignal ?? false

        }



        enableLine={

          settings?.enableLine ?? false

        }



        enableWechat={

          settings?.enableWechat ?? false

        }


      />








      <ModelGallery


        id={model.code}



        images={images}


      />








      <ModelVideos


        videos={videos}


      />








      <ModelInfo


        age={model.age}



        height={model.height}



        weight={model.weight}



        city={model.city}



        nationality={model.nationality}



        languages={languages}



        introduction={

          model.introduction || ""

        }


      />





    </main>


  );


}