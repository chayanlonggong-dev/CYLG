"use client";

import ContactPopup from "./ContactPopup";


interface HomeContactPopupProps {

  isOpen:boolean;

  onClose:()=>void;


  whatsapp?:string;
  telegram?:string;
  signal?:string;
  line?:string;
  wechatQr?:string;
  email?:string;



  enableWhatsapp?:boolean;
  enableTelegram?:boolean;
  enableSignal?:boolean;
  enableLine?:boolean;
  enableWechat?:boolean;

}





export default function HomeContactPopup({

  isOpen,

  onClose,


  whatsapp,

  telegram,

  signal,

  line,

  wechatQr,



  enableWhatsapp,

  enableTelegram,

  enableSignal,

  enableLine,

  enableWechat,


}:HomeContactPopupProps){



  return (

    <ContactPopup


      open={isOpen}


      onClose={onClose}



      whatsapp={
        whatsapp
      }


      telegram={
        telegram
      }


      signal={
        signal
      }


      line={
        line
      }


      wechatQr={
        wechatQr
      }




      enableWhatsapp={
        enableWhatsapp
      }


      enableTelegram={
        enableTelegram
      }


      enableSignal={
        enableSignal
      }


      enableLine={
        enableLine
      }


      enableWechat={
        enableWechat
      }



    />


  );


}