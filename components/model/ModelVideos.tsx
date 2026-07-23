"use client";

interface ModelVideosProps {
  videos: string[];
}

export default function ModelVideos({
  videos,
}: ModelVideosProps) {
  if (!videos.length) {
    return null;
  }

  return (
    <section className="bg-[#050505] px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="text-sm uppercase tracking-[0.6em] text-yellow-400">
            Exclusive Videos
          </p>

          <h2 className="mt-6 text-5xl font-black text-white">
            VIDEOS
          </h2>

          <div className="mx-auto mt-8 h-[2px] w-32 bg-yellow-500" />
        </div>

        <div
  className="
    mx-auto
    max-w-5xl
    grid
    gap-10
  "
>
          {videos.map((video) => (
            <div
              key={video}
              className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-black"
            >
              <video
                autoPlay
muted
loop
playsInline
                controls
                preload="metadata"
                className="
  aspect-[16/9]
  w-full
  object-cover
"
              >
                <source
                  src={video}
                  type="video/mp4"
                />
              </video>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}