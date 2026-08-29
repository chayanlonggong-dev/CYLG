import type { Metadata } from "next";


interface LayoutProps {

  children: React.ReactNode;

  params: Promise<{
    level: string;
  }>;

}



const collectionNames: Record<string, string> = {

  CROWN:
    "👑 Crown Collection",

  SSS:
    "SSS Collection",

  SS:
    "SS Collection",

  S:
    "S Collection",

  A:
    "A Collection",

};





export async function generateMetadata({

  params,

}: LayoutProps): Promise<Metadata> {


  const { level } = await params;


  const currentLevel =

    level.toUpperCase();



  const name =

    collectionNames[currentLevel] ||

    "Luxury Collection";





  const baseUrl =

    process.env.NEXT_PUBLIC_SITE_URL ||

    "https://chayanlonggong.com";





  const title =

    `${name} | ChaYanLongGong Luxury Elite Collection`;





  const description =

    `Explore ChaYanLongGong ${currentLevel} luxury collection featuring an exclusive elite model experience.`;





  return {


    title,


    description,



    alternates: {

      canonical:

        `${baseUrl}/collection/${currentLevel.toLowerCase()}`,

    },



    openGraph: {


      title,


      description,


      url:

        `${baseUrl}/collection/${currentLevel.toLowerCase()}`,



      siteName:

        "ChaYanLongGong",



      locale:

        "en_US",



      type:

        "website",



      images: [

        {

          url:

            "/logo.png",


          width:

            1200,


          height:

            630,


          alt:

            name,


        },

      ],


    },



    twitter: {


      card:

        "summary_large_image",



      title,



      description,



      images:

        [

          "/logo.png",

        ],


    },


  };


}







export default function CollectionLayout({

  children,

}: LayoutProps) {


  return children;


}