import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function unauthorizedResponse() {
  const user = await getCurrentUser();

  if (user) return null;

  return NextResponse.json(
    { success: false, message: "Silakan login terlebih dahulu" },
    { status: 401 }
  );
}
