/**
 * Payment-rail marks used in the "Payment integrations" strip.
 *
 * M-Pesa and Airtel Money are real third-party brand marks, so they are served
 * from official vector artwork in `public/logos/payments/` and never redrawn or
 * recoloured. They always sit on a white tile, which is what the artwork expects.
 * A plain img keeps the SVG out of the image optimiser, which refuses SVG.
 *
 * Bank and card are generic category icons, not brand marks, so they stay as
 * inline SVG and inherit `currentColor`.
 */

type MarkProps = { className?: string };

export function MpesaMark({ className }: MarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logos/payments/mpesa.svg" alt="M-Pesa" width={512} height={273} className={className} />
  );
}

export function AirtelMoneyMark({ className }: MarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logos/payments/airtel.svg" alt="Airtel Money" width={309} height={323} className={className} />
  );
}

export function BankMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill="currentColor"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M256 12 502 130v18H10v-18L256 12Zm0 44a36 36 0 1 0 0 72 36 36 0 0 0 0-72Z"
      />
      <path d="M84 168h62v224H84zM178 168h62v224h-62zM272 168h62v224h-62zM366 168h62v224h-62zM48 408h416v36H48zM12 460h488v44H12z" />
    </svg>
  );
}

export function CardMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill="currentColor"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M64 104h384a40 40 0 0 1 40 40v224a40 40 0 0 1-40 40H64a40 40 0 0 1-40-40V144a40 40 0 0 1 40-40Zm-8 72v64a12 12 0 0 0 12 12h76a12 12 0 0 0 12-12v-64a12 12 0 0 0-12-12H68a12 12 0 0 0-12 12Zm0 128a16 16 0 0 0 16 16h320a16 16 0 0 0 0-32H72a16 16 0 0 0-16 16Zm0 56a16 16 0 0 0 16 16h160a16 16 0 0 0 0-32H72a16 16 0 0 0-16 16Z"
      />
    </svg>
  );
}
