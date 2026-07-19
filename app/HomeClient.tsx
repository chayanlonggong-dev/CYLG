"use client";

import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import LuxuryExperience from "../components/LuxuryExperience";
import CollectionCards from "../components/CollectionCards";
import FloatingContact from "../components/FloatingContact";
import HomeContactPopup from "../components/HomeContactPopup";

interface HomeClientProps {
  settings: any;
}

export default function HomeClient({
  settings,
}: HomeClientProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <Header />

      <Hero />

      <LuxuryExperience />

      <CollectionCards />

      <FloatingContact
        onOpen={() => setIsContactOpen(true)}
      />

      <HomeContactPopup
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}

        whatsapp={settings?.whatsapp}
        telegram={settings?.telegram}
        signal={settings?.signal}
        line={settings?.line}
        wechat={settings?.wechat}
        email={settings?.email}

        enableWhatsapp={settings?.enableWhatsApp}
        enableTelegram={settings?.enableTelegram}
        enableSignal={settings?.enableSignal}
        enableLine={settings?.enableLine}
        enableWechat={settings?.enableWechat}
        enableFeedbackEmail={settings?.enableFeedbackEmail}
      />
    </>
  );
}