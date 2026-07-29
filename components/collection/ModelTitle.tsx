import { useLanguage } from "@/app/providers/LanguageProvider";

interface ModelTitleProps {
  id: string;
  status?: "online" | "offline";
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
  status = "online",
}: ModelTitleProps) {
  const { messages } = useLanguage();

  const title = displayTitle(id);
  const statusLabel =
    status === "offline"
      ? messages.collection.offline
      : messages.collection.online;



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

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-[10px]
            font-medium
            uppercase
            tracking-[0.2em]
            ${status === "offline" ? "border-red-500/60 text-red-500" : "border-green-500/60 text-green-500"}
          `}
          style={{
            fontFamily: "var(--font-cinzel)",
          }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status === "offline" ? "bg-red-500" : "bg-green-500"}`} />
          {statusLabel}
        </span>
      </div>
    </div>

  );

}