"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";

export default function Lifestyle() {
  const { messages } = useLanguage();

  const sections = [
    {
      video: "/videos/homepage-new/如果幸福是这间餐厅的夜景_如果幸福是这间餐厅的夜景_绝美观景餐厅.mp4",
      ...messages.lifestyle.slides.luxuryLifestyle,
    },
    {
      video: "/videos/homepage-new/拍摄用繁花视角打开眉山VW酒吧_拍摄用繁花视角打开眉山VW酒吧_最近看繁花有点痴迷被胡歌的宝总帅到了.mp4",
      ...messages.lifestyle.slides.privateLounge,
    },
    {
      video: "/videos/homepage-new/入夜的客厅要怎么拍出电影感...关掉顶灯_入夜的客厅要怎么拍出电影感...关掉顶灯_STEP_1_关.mp4",
      ...messages.lifestyle.slides.luxuryPenthouse,
    },
    {
      video: "/videos/homepage-new/没有时差的国家_方便和你说晚安_没有时差的国家_方便和你说晚安_吉隆坡_双子塔_夜景_无边泳池_背影.mp4",
      ...messages.lifestyle.slides.skylinePool,
    },
    {
      video: "/videos/homepage-new/我用10s在sanya柏悦走廊拍出了电影感_我用10s在sanya柏悦走廊拍出了电影感_酒店天花板.mp4",
      ...messages.lifestyle.slides.elegantArrival,
    },
    {
      video: "/videos/homepage-new/video_73楼的风景_73楼的风景_在家..._0.mp4",
      ...messages.lifestyle.slides.privateMoments,
    },
    {
      video: "/videos/homepage-new/每晚一杯就是我为自己营造的晚安氛围_每晚一杯就是我为自己营造的晚安氛围_周末把灵魂交给酒精_在房间里.mp4",
      ...messages.lifestyle.slides.luxuryNight,
    },
  ];

  return (
    <section id="lifestyle" className="bg-[#050505]">
      {sections.map((item) => (
        <section
          key={item.video}
          className="relative h-screen overflow-hidden"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={item.video} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="max-w-4xl text-center">
              <p className="text-sm uppercase tracking-[0.6em] text-yellow-400">
  {messages.lifestyle.label}
</p>

              <h2
                className="mt-6 text-4xl font-black text-white sm:text-6xl"
                style={{
                  fontFamily: "var(--font-cinzel)",
                }}
              >
                {item.title}
              </h2>

              <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-gray-300 sm:text-xl sm:leading-9">
                {item.description}
              </p>
            </div>
          </div>
        </section>
      ))}
    </section>
  );
}