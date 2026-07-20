"use client";

import { useEffect, useState } from "react";


export default function WebsiteSettingsPage() {


  const [settings,setSettings] = useState<any>({

    siteName:"",

    whatsapp:"",
    telegram:"",
    signal:"",
    line:"",
    wechatQr:"",

    email:"",

    enableWhatsApp:true,
    enableTelegram:true,
    enableSignal:false,
    enableLine:false,
    enableWechat:false,

  });

  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [isDeletingQr, setIsDeletingQr] = useState(false);
  const [qrUploadError, setQrUploadError] = useState("");



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

    setSettings((prev:any) => ({

      ...prev,

      [key]:value

    }));

  }






  async function save(nextSettings: any = settings){

    const payload = nextSettings ?? settings;

    await fetch("/api/settings",{

      method:"PUT",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify(payload)

    });


    alert("Settings Saved");


  }

  async function uploadWechatQr(file: File) {
    if (!file) return;

    setIsUploadingQr(true);
    setQrUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.message || "WeChat QR upload failed.");
      }

      update("wechatQr", payload.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "WeChat QR upload failed.";
      setQrUploadError(message);
    } finally {
      setIsUploadingQr(false);
    }
  }

  async function deleteWechatQr() {
    const nextSettings = {
      ...settings,
      wechatQr: "",
    };

    setSettings(nextSettings);
    setQrUploadError("");

    try {
      setIsDeletingQr(true);

      if (settings.wechatQr) {
        const response = await fetch("/api/settings", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: settings.wechatQr,
          }),
        });

        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "WeChat QR delete failed.");
        }
      }

      await save(nextSettings);
    } catch (error) {
      const message = error instanceof Error ? error.message : "WeChat QR delete failed.";
      setQrUploadError(message);
    } finally {
      setIsDeletingQr(false);
    }
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

          checked={settings.enableWhatsApp}

          onChange={(v)=>update("enableWhatsApp",v)}

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







        <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-black/40 p-5">

          <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Upload WeChat QR Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadWechatQr(file);
              }
            }}
            className="w-full rounded-xl border border-yellow-500/30 bg-[#0b0b0b] px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-yellow-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
          />

          {isUploadingQr && (
            <p className="mt-3 text-sm text-yellow-400">Uploading QR image...</p>
          )}

          {qrUploadError && (
            <p className="mt-3 text-sm text-red-400">{qrUploadError}</p>
          )}

          {settings.wechatQr ? (
            <div className="mt-4 flex justify-center rounded-2xl border border-yellow-500/20 bg-black/60 p-4">
              <img
                src={settings.wechatQr}
                alt="WeChat QR preview"
                className="max-h-64 max-w-full rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="mt-4 flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-yellow-500/20 bg-black/50 p-4 text-center text-sm text-gray-400">
              No QR uploaded
            </div>
          )}

          <button
            type="button"
            onClick={() => void deleteWechatQr()}
            disabled={!settings.wechatQr || isDeletingQr}
            className="mt-4 w-full rounded-full border border-yellow-500/30 bg-transparent px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeletingQr ? "Deleting..." : "Delete QR"}
          </button>
        </div>


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

          onClick={() => void save(settings)}

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