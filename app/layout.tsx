import type { Metadata } from "next";

import Script from "next/script";

import {
  Cinzel,
} from "next/font/google";

import "./globals.css";

import { LanguageProvider } from "@/app/providers/LanguageProvider";

import {
  prisma,
} from "@/lib/prisma";



const cinzel = Cinzel({

  variable:
    "--font-cinzel",

  subsets:[
    "latin",
  ],

  weight:[
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],

});




export async function generateMetadata(): Promise<Metadata> {


  const settings =
    await prisma.websiteSettings.findUnique({

      where:{
        id:1,
      },

    });



  const favicon =
    settings?.favicon || "/favicon.ico";



  return {


    verification: {

      google:
        "97OYqRCTX_X37leMlAgujXq6QrtoKq7qGzHpSWu0lU0",

    },



    metadataBase:

      new URL(

        process.env.NEXT_PUBLIC_SITE_URL ||

        "https://cylg-production.vercel.app"

      ),



    title: {

      default:

        "ChaYanLongGong | Luxury Elite Companion Agency",

      template:

        "%s | ChaYanLongGong",

    },



    description:

      "ChaYanLongGong is a luxury elite companion agency providing a premium private experience.",



    keywords:[

      "Luxury Elite Companion",

      "Luxury Lifestyle",

      "Private Experience",

      "Elite Companion Agency",

      "ChaYanLongGong",

    ],



    authors:[

      {

        name:

          "ChaYanLongGong",

      },

    ],



    creator:

      "ChaYanLongGong",



    icons:{

      icon:

        favicon,

    },



    openGraph:{


      title:

        "ChaYanLongGong | Luxury Elite Companion Agency",



      description:

        "Luxury private experience with an elite collection.",



      url:

        "https://cylg-production.vercel.app",



      siteName:

        "ChaYanLongGong",



      locale:

        "en_US",



      type:

        "website",



      images:[

        {

          url:

            "/logo.png",

          width:

            1200,

          height:

            630,

          alt:

            "ChaYanLongGong",

        },

      ],


    },



    twitter:{


      card:

        "summary_large_image",



      title:

        "ChaYanLongGong | Luxury Elite Companion Agency",



      description:

        "Luxury private experience with an elite collection.",


    },



    robots:{


      index:true,

      follow:true,


    },


  };


}








export default function RootLayout({

  children,

}:Readonly<{

  children:React.ReactNode;

}>) {


  return (


    <html

      lang="en"

      className={`

        ${cinzel.variable}

        h-full

        antialiased

      `}

    >



      <body

        className="

          min-h-full

          flex

          flex-col

          bg-black

          text-white

        "

      >




        {/* Google Analytics */}

        <Script

          src="https://www.googletagmanager.com/gtag/js?id=G-28KCE5VPMT"

          strategy="afterInteractive"

        />



        <Script

          id="google-analytics"

          strategy="afterInteractive"

        >

{`

window.dataLayer = window.dataLayer || [];

function gtag(){

  window.dataLayer.push(arguments);

}

gtag('js', new Date());

gtag(
  'config',
  'G-28KCE5VPMT'
);

`}

        </Script>






        {/* Organization Schema */}

        <Script

          id="organization-schema"

          type="application/ld+json"

          dangerouslySetInnerHTML={{

            __html:

              JSON.stringify({

                "@context":

                  "https://schema.org",


                "@type":

                  "Organization",


                name:

                  "ChaYanLongGong",


                url:

                  "https://cylg-production.vercel.app",


                logo:

                  "https://cylg-production.vercel.app/logo.png",

              }),

          }}

        />






        <LanguageProvider>

          {children}

        </LanguageProvider>



      </body>


    </html>


  );


}