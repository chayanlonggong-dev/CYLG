"use client";

import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import LuxuryExperience from "../components/LuxuryExperience";
import CollectionCards from "../components/CollectionCards";
import FloatingContact from "../components/FloatingContact";
import HomeContactPopup from "../components/HomeContactPopup";

export default function Home() {
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
      />
    </>
  );
}