import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$connect();

    const categories = await prisma.category.findMany();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}