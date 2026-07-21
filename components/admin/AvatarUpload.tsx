"use client";

import Image from "next/image";

import {
  ChangeEvent,
  useState,
} from "react";



interface AvatarUploadProps {

  value?:string;

  onChange:(url:string)=>void;

}





export default function AvatarUpload({

  value,

  onChange,

}:AvatarUploadProps){



  const [uploading,setUploading] =
    useState(false);


  const [error,setError] =
    useState("");






  async function upload(
    file:File
  ){


    if(uploading)
      return;



    try{


      setUploading(true);

      setError("");




      const formData =
        new FormData();



      formData.append(
        "file",
        file
      );




      const response =
        await fetch(
          "/api/upload/avatar",
          {

            method:"POST",

            body:formData,

          }
        );





      const data =
        await response.json();





      if(!response.ok){

        throw new Error(
          data.message ||
          "Upload failed."
        );

      }






      if(data.url){

        onChange(
          data.url
        );

      }





    }catch(error){


      console.error(error);



      setError(

        error instanceof Error

        ? error.message

        : "Upload failed."

      );



    }finally{


      setUploading(false);


    }


  }







  function handleFile(
    event:ChangeEvent<HTMLInputElement>
  ){



    const file =
      event.target.files?.[0];



    if(!file)
      return;






    if(!file.type.startsWith("image/")){


      setError(
        "Please upload an image file."
      );


      return;


    }





    upload(file);


  }








  return (

    <div className="space-y-4">





      <label className="
        block
        text-sm
        uppercase
        tracking-[0.2em]
        text-yellow-400
      ">

        Avatar

      </label>







      <input


        type="file"


        accept="image/*"


        onChange={handleFile}


        disabled={uploading}


        className="
          block
          w-full
          rounded
          border
          border-neutral-700
          bg-neutral-900
          p-3
          text-white
          disabled:opacity-50
        "


      />







      {
        uploading && (

          <div className="
            text-yellow-500
          ">

            Uploading...

          </div>

        )
      }








      {
        error && (

          <div className="
            text-red-400
          ">

            {error}

          </div>

        )
      }









      {
        value && (

          <div className="
            relative
            h-52
            w-52
            overflow-hidden
            rounded-lg
            border
            border-yellow-500/30
          ">


            <Image


              src={value}


              alt="Avatar"


              fill


              sizes="208px"


              className="
                object-cover
              "


            />


          </div>


        )
      }






    </div>

  );

}