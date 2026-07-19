"use client";

import { useEffect, useState } from "react";


export default function WebsiteSettingsPage() {


  const [settings,setSettings] = useState<any>({

    siteName:"",

    whatsapp:"",
    telegram:"",
    signal:"",
    line:"",
    wechat:"",

    email:"",

    enableWhatsapp:true,
    enableTelegram:true,
    enableSignal:false,
    enableLine:false,
    enableWechat:false,

  });



  useEffect(()=>{


    fetch("/api/settings")
      .then(res=>res.json())
      .then(data=>{

        if(data){

          setSettings(data);

        }

      });


  },[]);





  function update(
    key:string,
    value:any
  ){

    setSettings({

      ...settings,

      [key]:value

    });

  }






  async function save(){


    await fetch("/api/settings",{

      method:"PUT",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify(settings)

    });


    alert("Settings Saved");


  }






  return (

    <main
      className="
      min-h-screen
      bg-black
      text-white
      flex
      justify-center
      py-20
      "
    >


      <div
        className="
        w-full
        max-w-3xl
        bg-[#111]
        border
        border-yellow-500/30
        rounded-3xl
        p-10
        "
      >



        <h1
          className="
          text-4xl
          font-bold
          text-yellow-400
          mb-10
          "
        >
          Website Settings
        </h1>






        <Input

          label="Site Name"

          value={settings.siteName}

          onChange={(v)=>update("siteName",v)}

        />






        <Input

          label="WhatsApp Number"

          value={settings.whatsapp}

          onChange={(v)=>update("whatsapp",v)}

        />

        <Toggle

          label="Enable WhatsApp"

          checked={settings.enableWhatsapp}

          onChange={(v)=>update("enableWhatsapp",v)}

        />






        <Input

          label="Telegram Username"

          value={settings.telegram}

          onChange={(v)=>update("telegram",v)}

        />


        <Toggle

          label="Enable Telegram"

          checked={settings.enableTelegram}

          onChange={(v)=>update("enableTelegram",v)}

        />







        <Input

          label="Signal Number"

          value={settings.signal}

          onChange={(v)=>update("signal",v)}

        />


        <Toggle

          label="Enable Signal"

          checked={settings.enableSignal}

          onChange={(v)=>update("enableSignal",v)}

        />







        <Input

          label="LINE ID"

          value={settings.line}

          onChange={(v)=>update("line",v)}

        />


        <Toggle

          label="Enable LINE"

          checked={settings.enableLine}

          onChange={(v)=>update("enableLine",v)}

        />







        <Input

          label="WeChat ID"

          value={settings.wechat}

          onChange={(v)=>update("wechat",v)}

        />


        <Toggle

          label="Enable WeChat"

          checked={settings.enableWechat}

          onChange={(v)=>update("enableWechat",v)}

        />






        <Input

          label="Email"

          value={settings.email}

          onChange={(v)=>update("email",v)}

        />







        <button

          onClick={save}

          className="
          mt-10
          w-full
          bg-yellow-500
          text-black
          py-4
          rounded-xl
          font-bold
          "
        >

          SAVE SETTINGS

        </button>




      </div>


    </main>

  );

}







function Input({

label,

value,

onChange,

}:{

label:string;

value:string;

onChange:(v:string)=>void;

}){


return (

<div className="mb-5">


<label
className="
block
text-gray-400
mb-2
"
>

{label}

</label>


<input

value={value || ""}

onChange={
e=>onChange(e.target.value)
}

className="
w-full
bg-black
border
border-white/20
rounded-xl
px-5
py-4
outline-none
"

/>


</div>

)

}







function Toggle({

label,

checked,

onChange,

}:{

label:string;

checked:boolean;

onChange:(v:boolean)=>void;

}){


return (

<div
className="
flex
justify-between
items-center
mb-6
"
>


<span>

{label}

</span>


<input

type="checkbox"

checked={checked}

onChange={
e=>onChange(e.target.checked)
}

/>


</div>

)


}