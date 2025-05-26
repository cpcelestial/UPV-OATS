"use client";

import { Calendar } from "./calendar";

export default function Page() {
  return (
    <main className="flex-grow px-4 py-2">
      <div className="container mx-auto">
        <Calendar />
      </div>
    </main>
  );
}
