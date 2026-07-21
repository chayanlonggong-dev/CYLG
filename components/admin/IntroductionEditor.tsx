"use client";


interface IntroductionEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}



export default function IntroductionEditor({
  value = "",
  onChange,
}: IntroductionEditorProps) {



  function handleChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {

    onChange?.(
      event.target.value
    );

  }




  return (

    <div>


      <label className="
        mb-4
        block
        text-sm
        uppercase
        tracking-[0.25em]
        text-yellow-500
      ">

        Introduction

      </label>




      <textarea

        rows={18}


        value={value}


        onChange={handleChange}


        maxLength={5000}


        placeholder={`Paste the complete profile...

Example

Age : 22

Height : 168 cm

Nationality : Japanese

Languages
English
Japanese

Introduction...

Services...

Notes...

`}


        className="
          w-full
          resize-none
          rounded-3xl
          border
          border-yellow-500/20
          bg-[#181818]
          p-6
          text-white
          outline-none
          transition
          focus:border-yellow-500
          focus:ring-2
          focus:ring-yellow-500/20
        "

      />




      <div className="
        mt-4
        flex
        items-center
        justify-between
        text-sm
      ">


        <p className="
          text-gray-500
        ">

          Supports multi-line text. Formatting will be preserved.

        </p>



        <span className="
          text-yellow-500
        ">

          {value.length} / 5000 Characters

        </span>



      </div>




    </div>

  );

}