"use client";

import {
  ChangeEvent,
  useState,
} from "react";



interface VideoUploadProps {

  value:string[];

  onChange:(urls:string[])=>void;

}





export default function VideoUpload({

  value,

  onChange,

}:VideoUploadProps){



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



      const uploadedUrls:string[]=[];





      for(
        const file of Array.from(files)
      ){



        if(
          !file.type.startsWith("video/")
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
            "/api/upload/video",
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






      if(uploadedUrls.length){

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

        : "Video upload failed."

      );



    }finally{


      setUploading(false);


    }


  }







  function removeVideo(
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

        Videos

      </label>







      <input


        type="file"


        multiple


        accept="video/*"


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
        value.length>0 && (

          <div className="
            space-y-4
          ">


            {
              value.map(
                (url,index)=>(


                  <div

                    key={`${url}-${index}`}

                    className="
                      rounded-xl
                      border
                      border-yellow-500/20
                      bg-neutral-900
                      p-4
                    "

                  >





                    <video

                      src={url}

                      controls

                      preload="metadata"

                      className="
                        mb-3
                        max-h-64
                        w-full
                        rounded-lg
                        object-cover
                      "

                    />







                    <div className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    ">


                      <span className="
                        truncate
                        text-sm
                        text-white
                      ">

                        {url}

                      </span>







                      <button

                        type="button"

                        onClick={()=>
                          removeVideo(index)
                        }

                        className="
                          rounded
                          bg-red-600
                          px-3
                          py-1
                          text-xs
                          text-white
                        "

                      >

                        Remove

                      </button>



                    </div>




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