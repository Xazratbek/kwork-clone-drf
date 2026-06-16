"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CatalogContent } from "./catalog-content";

export default function CatalogPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="grid place-items-center py-20">
            <Loader2 size={28} className="animate-spin text-brand" />
          </div>
        }>
          <CatalogContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
