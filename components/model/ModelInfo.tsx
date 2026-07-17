interface ModelInfoProps {
  age: number;
  height: string;
  languages: string[];
  location: string;
  about: string;
}

export default function ModelInfo({
  age,
  height,
  languages,
  location,
  about,
}: ModelInfoProps) {
  return (
    <section className="bg-[#090909] py-32 px-6">

      <div className="max-w-7xl mx-auto">

        {/* Section Title */}

        <div className="text-center mb-20">

          <p className="uppercase tracking-[0.6em] text-yellow-400 text-sm">
            Exclusive Profile
          </p>

          <h2 className="text-5xl md:text-6xl font-black text-white mt-6">
            MODEL DETAILS
          </h2>

          <div className="w-32 h-[2px] bg-yellow-400 mx-auto mt-8" />

        </div>

        <div className="grid lg:grid-cols-2 gap-24">

          {/* LEFT */}

          <div className="space-y-8">

            <div className="flex justify-between border-b border-white/10 pb-5">
              <span className="text-gray-500 uppercase tracking-[0.3em]">
                Age
              </span>

              <span className="text-white text-xl font-semibold">
                {age}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-5">
              <span className="text-gray-500 uppercase tracking-[0.3em]">
                Height
              </span>

              <span className="text-white text-xl font-semibold">
                {height}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-5">
              <span className="text-gray-500 uppercase tracking-[0.3em]">
                Location
              </span>

              <span className="text-white text-xl font-semibold">
                {location}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-5">
              <span className="text-gray-500 uppercase tracking-[0.3em]">
                Languages
              </span>

              <span className="text-white text-xl font-semibold text-right">
                {languages.join(" • ")}
              </span>
            </div>

          </div>

          {/* RIGHT */}

          <div>

            <p className="uppercase tracking-[0.5em] text-yellow-400 text-sm mb-6">
              Introduction
            </p>

            <p className="text-gray-300 text-lg leading-9">
              {about}
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}