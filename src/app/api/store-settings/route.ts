import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { id: 1 } });

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil informasi toko" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const address = String(body.address ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const receiptNote = String(body.receiptNote ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama toko wajib diisi" },
        { status: 400 }
      );
    }

    if (phone && !/^[0-9+\-\s()]{8,20}$/.test(phone)) {
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

    const data = {
      name,
      address: address || null,
      phone: phone || null,
      email: email || null,
      receiptNote: receiptNote || null,
    };

    const setting = await prisma.storeSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    return NextResponse.json({
      success: true,
      message: "Informasi toko berhasil disimpan",
      data: setting,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan informasi toko" },
      { status: 500 }
    );
  }
}