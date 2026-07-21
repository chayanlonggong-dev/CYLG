"use client";

import Image from "next/image";

import {
  ChangeEvent,
  useState,
} from "react";



interface GalleryUploadProps {

  value:string[];

  onChange:(urls:string[])=>void;

}





export default function GalleryUpload({

  value,

  onChange,

}:GalleryUploadProps){



  const [uploading,setUploading] =
    useState(false);


  const [error,setError] =
    useState("");







  async function handleUpload(

    files:FileList|null

  ){



    if(
      !files ||
      files.length===0 ||
      uploading
    ){

      return;

    }






    try{


      setUploading(true);

      setError("");



      const uploadedUrls:string[] = [];







      for(
        const file of Array.from(files)
      ){



        if(
          !file.type.startsWith("image/")
        ){

          continue;

        }






        const formData =
          new FormData();




        formData.append(
          "file",
          file
        );







        const response =
          await fetch(
            "/api/upload/gallery",
            {

              method:"POST",

              body:formData,

            }
          );







        const data =
          await response.json();







        if(!response.ok){

          console.error(data);

          continue;

        }







        if(data.url){

          uploadedUrls.push(
            data.url
          );

        }



      }








      if(uploadedUrls.length>0){


        onChange([

          ...value,

          ...uploadedUrls,

        ]);


      }







    }catch(error){


      console.error(error);



      setError(

        error instanceof Error

        ? error.message

        : "Gallery upload failed."

      );




    }finally{


      setUploading(false);


    }


  }







  function removeImage(
    index:number
  ){


    onChange(

      value.filter(
        (_,i)=>i!==index
      )

    );


  }







  return (

    <div className="
      space-y-4
    ">



      <label className="
        block
        text-sm
        font-medium
        uppercase
        tracking-[0.2em]
        text-yellow-400
      ">

        Gallery Images

      </label>







      <input

        type="file"

        multiple

        accept="image/*"

        disabled={uploading}

        onChange={(
          event:ChangeEvent<HTMLInputElement>
        )=>

          handleUpload(
            event.target.files
          )

        }

        className="
          block
          w-full
          rounded-lg
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

          <p className="
            text-sm
            text-yellow-500
          ">

            Uploading...

          </p>

        )
      }








      {
        error && (

          <p className="
            text-sm
            text-red-400
          ">

            {error}

          </p>

        )
      }








      {
        value.length > 0 && (


          <div className="
            grid
            grid-cols-5
            gap-4
          ">


            {
              value.map(
                (url,index)=>(


                  <div

                    key={`${url}-${index}`}

                    className="
                      relative
                      aspect-square
                      overflow-hidden
                      rounded-lg
                      border
                      border-yellow-500/20
                    "

                  >





                    <Image

                      src={url}

                      alt={`Gallery ${index+1}`}

                      fill

                      sizes="(max-width:768px) 20vw, 160px"

                      className="
                        object-cover
                      "

                    />







                    <button

                      type="button"

                      onClick={()=>
                        removeImage(index)
                      }

                      className="
                        absolute
                        right-2
                        top-2
                        rounded
                        bg-red-600
                        px-2
                        py-1
                        text-xs
                        text-white
                      "

                    >

                      ✕

                    </button>




                  </div>


                )

              )

            }



          </div>


        )
      }





    </div>

  );

}