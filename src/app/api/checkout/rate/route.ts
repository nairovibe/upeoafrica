import { NextResponse } from "next/server";
import { usdToKesQuote } from "@/lib/fx";

export async function GET() {
  const quote = await usdToKesQuote();
  if (!quote) {
    return NextResponse.json({ error: "The live exchange rate is unavailable." }, { status: 503 });
  }
  return NextResponse.json(quote, { headers: { "Cache-Control": "no-store" } });
}
