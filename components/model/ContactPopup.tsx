"use client";


interface ContactPopupProps {

  open:boolean;

  onClose:()=>void;


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



export default function ContactPopup({

  open,

  onClose,


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


}:ContactPopupProps){



  if(!open) return null;



  return (

    <div

      className="
      fixed
      inset-0
      z-[9999]
      flex
      items-center
      justify-center
      bg-black/80
      backdrop-blur-sm
      px-6
      "

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

      >



        <button

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




        <p

          className="
          text-center
          uppercase
          tracking-[0.4em]
          text-yellow-500
          "

        >

          CONTACT

        </p>



        <h2

          className="
          mt-4
          text-center
          text-3xl
          font-bold
          text-white
          "

        >

          Contact Us

        </h2>




        <p

          className="
          mt-4
          text-center
          text-gray-400
          "

        >

          Choose your preferred contact platform.

        </p>




        <div

          className="
          mt-10
          space-y-4
          "

        >



        {
          enableWhatsapp && whatsapp && (

            <a

              href={whatsapp}

              target="_blank"

              className="
              block
              rounded-full
              border
              border-green-500
              px-6
              py-4
              text-center
              text-green-400
              "

            >

              WhatsApp

            </a>

          )
        }




        {
          enableTelegram && telegram && (

            <a

              href={telegram}

              target="_blank"

              className="
              block
              rounded-full
              border
              border-blue-500
              px-6
              py-4
              text-center
              text-blue-400
              "

            >

              Telegram

            </a>

          )
        }





        {
          enableSignal && signal && (

            <a

              href={signal}

              target="_blank"

              className="
              block
              rounded-full
              border
              border-gray-400
              px-6
              py-4
              text-center
              text-gray-300
              "

            >

              Signal

            </a>

          )
        }





        {
          enableLine && line && (

            <a

              href={line}

              target="_blank"

              className="
              block
              rounded-full
              border
              border-green-400
              px-6
              py-4
              text-center
              text-green-300
              "

            >

              LINE

            </a>

          )
        }





        {
          enableWechat && wechat && (

            <button

              className="
              block
              w-full
              rounded-full
              border
              border-green-600
              px-6
              py-4
              text-center
              text-green-500
              "

            >

              WeChat

            </button>

          )
        }



        </div>



      </div>


    </div>

  );

}