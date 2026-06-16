"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LandingHero, LandingCategories, LandingHowItWorks, LandingStats, LandingCTA } from "@/components/landing";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <LandingHero />
        <LandingCategories />
        <LandingHowItWorks />
        <LandingStats />
        <LandingCTA />
      </main>
      <Footer />
    </>
  );
}
