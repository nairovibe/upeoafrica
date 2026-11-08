import { AirtelMoneyMark, BankMark as OfficialBankMark, MpesaMark as OfficialMpesaMark } from "@/components/brand/PaymentLogos";

export function PayPalMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="PayPal">
      <path fill="#003087" d="M7.016 19.198h-4.2a.562.562 0 0 1-.555-.65L5.093.584A.692.692 0 0 1 5.776 0h7.222c3.417 0 5.904 2.488 5.846 5.5-.006.25-.027.5-.066.747A6.794 6.794 0 0 1 12.071 12H8.743a.69.69 0 0 0-.682.583l-.325 2.056-.013.083-.692 4.39-.015.087z" />
      <path fill="#009cde" d="M19.79 6.142c-.01.087-.01.175-.023.261a7.76 7.76 0 0 1-7.695 6.598H9.007l-.283 1.795-.013.083-.692 4.39-.134.843-.014.088H6.86l-.497 3.15a.562.562 0 0 0 .555.65h3.612c.34 0 .63-.249.683-.585l.952-6.031a.692.692 0 0 1 .683-.584h2.126a6.793 6.793 0 0 0 6.707-5.752c.306-1.95-.466-3.744-1.89-4.906z" />
    </svg>
  );
}


export function VisaMark({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="Visa">
      <path fill="#1A1F71" d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z" />
    </svg>
  );
}

export function MastercardMark({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 24" className={className} role="img" aria-label="Mastercard">
      <circle cx="14" cy="12" r="10" fill="#EB001B" />
      <circle cx="24" cy="12" r="10" fill="#F79E1B" />
      <path fill="#FF5F00" d="M19 4.2a10 10 0 0 1 0 15.6 10 10 0 0 1 0-15.6z" />
    </svg>
  );
}

export function PaymentMark({ id, className = "h-6 w-auto" }: { id: string; className?: string }) {
  if (id === "paypal") return <PayPalMark className={className} />;
  if (id === "airtel") return <AirtelMoneyMark className="h-8 w-auto max-w-[4.5rem] object-contain" />;
  if (id === "mpesa") return <OfficialMpesaMark className="h-7 w-auto max-w-[6.5rem] object-contain" />;
  if (id === "card") return (
    <span className="inline-flex items-center gap-1.5">
      <VisaMark className={className} />
      <MastercardMark className={className} />
    </span>
  );
  return <OfficialBankMark className="h-6 w-6 text-ink-900" />;
}
