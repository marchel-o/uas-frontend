import { NextResponse } from "next/server";
import { getReportData } from "@/lib/report-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getReportData());
  } catch (error) {
    console.error("LAPORAN ERROR:", error);
    return NextResponse.json({ error: "Gagal mengambil data laporan." }, { status: 500 });
  }
}
