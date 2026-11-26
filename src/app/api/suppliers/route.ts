import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data supplier" },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const address = String(body.address ?? "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Nama dan telepon supplier wajib diisi" },
        { status: 400 }
      );
    }

    if (!/^[0-9+\-\s()]{8,20}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Format nomor telepon tidak valid" },
        { status: 400 }
      );
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone,
        contactName: contactName || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Supplier berhasil ditambahkan",
        data: supplier,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan supplier" },
      { status: 500 }
    );
  }
}