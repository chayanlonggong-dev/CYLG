interface ModelInfoProps {

  age: number;

  height: number;

  city: string;

  nationality: string;

  languages: string[];

  introduction: string;

}



export default function ModelInfo({

  age,

  height,

  city,

  nationality,

  languages,

  introduction,

}: ModelInfoProps) {


  return (

    <section className="bg-black text-white py-32 px-6">


      <div className="max-w-6xl mx-auto">



        <div className="text-center mb-20">


          <p className="text-yellow-400 tracking-[0.6em] uppercase text-sm">

            Exclusive Profile

          </p>



          <h2 className="text-5xl md:text-6xl font-black mt-6">

            MODEL DETAILS

          </h2>



          <div className="w-32 h-[2px] bg-yellow-400 mx-auto mt-8"/>


        </div>





        <div className="grid md:grid-cols-2 gap-20">



          <div className="space-y-8">


            <InfoItem
              label="AGE"
              value={age}
            />



            <InfoItem
              label="HEIGHT"
              value={`${height} cm`}
            />



            <InfoItem
              label="LOCATION"
              value={city || "-"}
            />



            <InfoItem
              label="NATIONALITY"
              value={nationality || "-"}
            />



            <InfoItem
              label="LANGUAGES"
              value={
                languages.length > 0
                ?
                languages.join(", ")
                :
                "-"
              }
            />


          </div>







          <div>


            <h3 className="text-yellow-400 tracking-[0.5em] uppercase mb-8">

              INTRODUCTION

            </h3>



            <p className="text-gray-300 text-lg leading-relaxed">

              {
                introduction ||
                "Exclusive luxury companion service."
              }

            </p>



          </div>



        </div>



      </div>



    </section>

  );

}






function InfoItem({

  label,

  value,

}:{

  label:string;

  value:string | number;

}) {


  return (

    <div className="flex justify-between border-b border-white/10 pb-5">


      <span className="text-gray-400 tracking-[0.4em]">

        {label}

      </span>



      <span className="font-semibold">

        {value}

      </span>



    </div>

  );

}