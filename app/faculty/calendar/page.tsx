"use client";

import { Calendar } from "./calendar";

export default function Page() {
  return (
    <main className="flex-grow p-4">
      <div className="container mx-auto">
        <Calendar />
      </div>
    </main>
  );
}
