"use client";

import {
  useMemo,
  useState,
} from "react";

import WechatQrModal from "./WechatQrModal";



interface ContactPopupProps {

  open:boolean;

  onClose:()=>void;


  whatsapp?:string;
  telegram?:string;
  signal?:string;
  line?:string;
  wechatQr?:string;


  enableWhatsapp?:boolean;
  enableTelegram?:boolean;
  enableSignal?:boolean;
  enableLine?:boolean;
  enableWechat?:boolean;


  modelId?:string;

}




function buildContactMessage(
  modelId?:string
){

  if(modelId){

    return [
      "Hi,",
      "",
      `I'm interested in ${modelId}.`,
      "",
      "Could you please provide more information?",
      "",
      "Thank you.",
    ].join("\n");

  }



  return [
    "Hi,",
    "",
    "I'm interested in your services.",
    "",
    "Could you please provide more information?",
    "",
    "Thank you.",
  ].join("\n");

}




function normalizeSignalTarget(
  value?:string
){

  if(!value) return "";

  const target =
    value.replace(
      /[^\d+]/g,
      ""
    );


  if(!target) return "";


  return target.startsWith("+")
    ? target
    : `+${target}`;

}





export default function ContactPopup({

  open,

  onClose,

  whatsapp,

  telegram,

  signal,

  line,

  wechatQr,


  enableWhatsapp=true,

  enableTelegram=true,

  enableSignal=false,

  enableLine=false,

  enableWechat=false,


  modelId,


}:ContactPopupProps){



  const [
    isWechatQrOpen,
    setIsWechatQrOpen,
  ] = useState(false);




  const message =
    useMemo(
      ()=>buildContactMessage(modelId),
      [modelId]
    );





  if(!open){

    return null;

  }





  function openContact(
    platform:
      |"whatsapp"
      |"telegram"
      |"signal"
      |"line"
      |"wechat"
  ){


    if(platform==="wechat"){


      if(!wechatQr){

        return;

      }


      setIsWechatQrOpen(true);

      return;

    }





    const text =
      encodeURIComponent(message);



    let url="";





    switch(platform){


      case "whatsapp":{


        const phone =
          whatsapp?.replace(
            /\D/g,
            ""
          );


        if(phone){

          url =
            `https://wa.me/${phone}?text=${text}`;

        }


        break;

      }





      case "telegram":{


        const username =
          telegram
          ?.replace(
            /^https?:\/\/t\.me\//i,
            ""
          )
          .replace(
            /^@/,
            ""
          );


        if(username){

          url =
            `https://t.me/${username}?start=${text}`;

        }


        break;

      }





      case "signal":{


        const target =
          normalizeSignalTarget(signal);


        if(target){

          url =
            `https://signal.me/#p/${target}`;

        }


        break;

      }





      case "line":{


        if(line){

          url =
            `https://line.me/R/msg/text/${text}`;

        }


        break;

      }


    }





    if(url){


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );


    }


  }





  return (

    <>


      <div

        className="
          fixed
          inset-0
          z-[9999]
          flex
          items-center
          justify-center
          bg-black/85
          px-6
          backdrop-blur-sm
        "

        onClick={onClose}

      >



        <div

          className="
            relative
            w-full
            max-w-md
            rounded-3xl
            border
            border-yellow-500/30
            bg-[#101010]
            p-8
            shadow-2xl
          "

          onClick={(e)=>
            e.stopPropagation()
          }

        >



          <button

            type="button"

            onClick={onClose}

            className="
              absolute
              right-5
              top-5
              text-3xl
              text-gray-400
              hover:text-white
            "

          >

            ×

          </button>




          <p className="
            text-center
            uppercase
            tracking-[0.4em]
            text-yellow-500
          ">

            CONTACT

          </p>




          <h2 className="
            mt-4
            text-center
            text-3xl
            font-bold
            text-white
          ">

            Contact Us

          </h2>




          <p className="
            mt-4
            text-center
            text-gray-400
          ">

            Choose your preferred contact platform.

          </p>






          <div className="
            mt-10
            space-y-4
          ">





            {
              enableWhatsapp &&
              whatsapp && (

                <ContactButton

                  text="WhatsApp"

                  color="#25D366"

                  onClick={()=>
                    openContact(
                      "whatsapp"
                    )
                  }

                />

              )
            }





            {
              enableTelegram &&
              telegram && (

                <ContactButton

                  text="Telegram"

                  color="#229ED9"

                  onClick={()=>
                    openContact(
                      "telegram"
                    )
                  }

                />

              )
            }





            {
              enableSignal &&
              signal && (

                <ContactButton

                  text="Signal"

                  color="#3A76F0"

                  onClick={()=>
                    openContact(
                      "signal"
                    )
                  }

                />

              )
            }





            {
              enableLine &&
              line && (

                <ContactButton

                  text="LINE"

                  color="#06C755"

                  onClick={()=>
                    openContact(
                      "line"
                    )
                  }

                />

              )
            }





            {
              enableWechat &&
              wechatQr && (

                <ContactButton

                  text="WeChat"

                  color="#07C160"

                  onClick={()=>
                    openContact(
                      "wechat"
                    )
                  }

                />

              )
            }





          </div>





        </div>



      </div>






      <WechatQrModal

        open={isWechatQrOpen}

        onClose={()=>
          setIsWechatQrOpen(false)
        }

        image={wechatQr}

      />



    </>

  );

}






function ContactButton({

text,

color,

onClick,

}:{

text:string;

color:string;

onClick:()=>void;

}){


return (

<button

type="button"

onClick={onClick}

style={{
  borderColor:color,
  color,
}}

className="
  w-full
  rounded-full
  border
  px-6
  py-4
  text-center
  transition-all
  hover:text-white
"

onMouseEnter={(e)=>{

  e.currentTarget.style.backgroundColor =
    color;

}}

onMouseLeave={(e)=>{

  e.currentTarget.style.backgroundColor =
    "";

}}


>

{text}

</button>

);


}