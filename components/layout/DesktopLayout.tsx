import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LuxuryExperience from "@/components/LuxuryExperience";
import CollectionCards from "@/components/CollectionCards";

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

export default function DesktopLayout({
  children,
}: DesktopLayoutProps) {
  return (
    <>
      <Header />

      <main className="bg-black text-white">
        <Hero />

        <LuxuryExperience />

        <CollectionCards />

        {children}
      </main>
    </>
  );
}