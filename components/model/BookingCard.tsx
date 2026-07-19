"use client";


interface BookingCardProps {


  modelId:string;


  whatsapp?:string;

  telegram?:string;

  signal?:string;

  line?:string;

  wechat?:string;



  enableWhatsapp?:boolean;

  enableTelegram?:boolean;

  enableSignal?:boolean;

  enableLine?:boolean;

  enableWechat?:boolean;


}



export default function BookingCard({

  modelId,

  whatsapp,

  telegram,

  signal,

  line,

  wechat,


  enableWhatsapp,

  enableTelegram,

  enableSignal,

  enableLine,

  enableWechat,


}:BookingCardProps){



  const message =
    encodeURIComponent(
      `Hi, I'm interested in ${modelId}`
    );





  function openChat(type:string){



    if(type==="WhatsApp"){

      window.open(

        `https://wa.me/${whatsapp?.replace(/\D/g,"")}?text=${message}`,

        "_blank"

      );

    }





    if(type==="Telegram"){

      window.open(

        `https://t.me/${telegram?.replace("@","")}`,

        "_blank"

      );

    }





    if(type==="Signal"){

      window.open(

        `https://signal.me/#p/${signal?.replace("+","")}`,

        "_blank"

      );

    }





    if(type==="LINE"){

      window.open(

        `https://line.me/ti/p/${line}`,

        "_blank"

      );

    }





    if(type==="WeChat"){

      alert(

        `Please add WeChat: ${wechat}`

      );

    }



  }






  const channels = [

    {

      name:"WhatsApp",

      show:
        enableWhatsapp &&
        whatsapp

    },


    {

      name:"Telegram",

      show:
        enableTelegram &&
        telegram

    },


    {

      name:"Signal",

      show:
        enableSignal &&
        signal

    },


    {

      name:"LINE",

      show:
        enableLine &&
        line

    },


    {

      name:"WeChat",

      show:
        enableWechat &&
        wechat

    },


  ];






  return (


    <section

      className="
      bg-black
      py-24
      flex
      justify-center
      "

    >



      <div

        className="
        w-full
        max-w-md
        px-6
        "

      >




        <h2

          className="
          text-center
          text-yellow-400
          text-2xl
          tracking-[0.5em]
          mb-8
          "

        >

          BOOK NOW

        </h2>






        <div

          className="
          space-y-4
          "

        >



        {

          channels

          .filter(

            item=>item.show

          )

          .map(channel=>(


            <button


              key={channel.name}


              onClick={()=>openChat(channel.name)}


              className="

              w-full

              rounded-full

              border

              border-yellow-500

              py-4

              text-yellow-400

              hover:bg-yellow-500

              hover:text-black

              transition

              "


            >


              {channel.name}


            </button>


          ))


        }



        </div>



      </div>



    </section>


  );


}