"use client";

import { useState } from "react";

import AddModelModal from "@/components/admin/AddModelModal";
import ModelsList from "@/components/admin/ModelsList";

export default function ModelsPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-black text-white">

        {/* Header */}
        <header className="border-b border-yellow-500/20 bg-[#101010]">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

            <div>

              <p className="uppercase tracking-[0.35em] text-yellow-500 text-sm">
                CYLG ADMIN
              </p>

              <h1 className="mt-2 text-4xl font-black">
                Models Management
              </h1>

            </div>

            <button
              onClick={() => setOpen(true)}
              className="rounded-full border border-yellow-500 px-6 py-3 font-bold uppercase tracking-[0.25em] text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
            >
              + ADD MODEL
            </button>

          </div>

        </header>

        {/* Models */}

        <section className="mx-auto max-w-7xl px-8 py-12">

          <ModelsList />

        </section>

      </main>

      <AddModelModal
        open={open}
        onClose={() => setOpen(false)}
      />

    </>
  );
}