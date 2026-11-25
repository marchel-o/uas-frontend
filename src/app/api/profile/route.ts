import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userData = await requireAuth();
    
    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}