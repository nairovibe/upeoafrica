"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="desk-chrome mt-8 inline-flex h-9 cursor-pointer items-center bg-brand-500 px-4 text-sm font-medium text-white"
    >
      Print or save as PDF
    </button>
  );
}
