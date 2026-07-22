import type { Metadata } from "next";

import {
  Cinzel,
} from "next/font/google";

import "./globals.css";

import { LanguageProvider } from "@/app/providers/LanguageProvider";



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





export const metadata: Metadata = {


  metadataBase:
    new URL(
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://chayanlonggong.com"
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






  openGraph:{


    title:
      "ChaYanLongGong | Luxury Elite Companion Agency",



    description:
      "Luxury private experience with an elite collection.",



    url:
      "https://chayanlonggong.com",



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

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ChaYanLongGong",
      url: "https://chayanlonggong.com",
      logo: "https://chayanlonggong.com/logo.png",
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