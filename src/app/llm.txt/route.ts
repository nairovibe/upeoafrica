import { llmsDocument, llmsResponse } from "@/lib/llms-document";

export const revalidate = 43200;

export async function GET() {
  return llmsResponse(await llmsDocument());
}
