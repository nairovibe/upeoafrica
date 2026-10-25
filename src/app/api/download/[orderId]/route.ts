import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const service = await createServiceClient();
  if (!service) return NextResponse.json({ error: "Not configured." }, { status: 503 });

  const { data: order } = await service
    .from("orders")
    .select("status, download_expires_at, product_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.status !== "paid" || !order.product_id) {
    return NextResponse.json({ error: "No paid download for this order." }, { status: 404 });
  }
  if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
    return NextResponse.json({ error: "This download link has expired." }, { status: 410 });
  }

  const { data: product } = await service
    .from("products")
    .select("file_path, title")
    .eq("id", order.product_id)
    .maybeSingle();
  if (!product?.file_path) {
    return NextResponse.json({ error: "File is not attached yet." }, { status: 404 });
  }

  const { data, error } = await service.storage
    .from("product-files")
    .createSignedUrl(product.file_path, 120);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not create download." }, { status: 500 });
  }
  return NextResponse.redirect(data.signedUrl);
}
