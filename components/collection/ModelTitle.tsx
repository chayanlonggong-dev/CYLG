interface ModelTitleProps {
  id: string;
}


function displayTitle(id: string) {

  if (id.startsWith("CROWN")) {

    const number =
      id.replace("CROWN", "");

    return {
      crown: true,
      text: `CY${number}`,
    };

  }


  return {
    crown: false,
    text: id,
  };

}



export default function ModelTitle({
  id,
}: ModelTitleProps) {


  const title =
    displayTitle(id);



  return (

    <div
      className="
        flex
        justify-center
        items-center
        py-8
        select-none
      "
    >


      <div
        className="
          flex
          items-center
          gap-2
        "
      >


        {/* Crown Icon */}

        {
          title.crown && (

            <span
              className="
                text-4xl
                drop-shadow-[0_0_12px_rgba(255,215,0,.9)]
              "
            >
              👑
            </span>

          )
        }



        {/* Model Code */}

        <div
          className="
            relative
            inline-block
          "
        >


          {/* Gold Outline */}

          <span
            className="
              absolute
              inset-0
              text-[34px]
              font-black
              uppercase
              tracking-[0.18em]
              text-transparent
              pointer-events-none
            "
            style={{
              fontFamily: "var(--font-cinzel)",
              WebkitTextStroke: "2px #B38A2B",
              paintOrder: "stroke fill",
              textShadow: "none",
            }}
          >

            {title.text}

          </span>



          {/* Black Fill */}

          <span
            className="
              relative
              text-[34px]
              font-black
              uppercase
              tracking-[0.18em]
            "
            style={{
              fontFamily: "var(--font-cinzel)",
              color: "#0a0a0a",
              WebkitTextStroke: "0.5px rgba(179, 138, 43, 0.45)",
              textShadow: "none",
            }}
          >

            {title.text}

          </span>



        </div>



      </div>



    </div>

  );

}