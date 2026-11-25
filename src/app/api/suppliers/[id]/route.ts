import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

async function getId(context: Context) {
  const { id } = await context.params;
  const num = Number(id);
  return Number.isInteger(num) && num > 0 ? num : null;
}

export async function GET(_request: NextRequest, context: Context) {
  try {
    const id = await getId(context);
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID supplier tidak valid" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      return NextResponse.json(
        { success: false, message: "Supplier tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data supplier" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const id = await getId(context);
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID supplier tidak valid" },
        { status: 400 }
      );
    }

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

    const exists = await prisma.supplier.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json(
        { success: false, message: "Supplier tidak ditemukan" },
        { status: 404 }
      );
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        phone,
        contactName: contactName || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier berhasil diperbarui",
      data: supplier,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui supplier" },
      { status: 500 }
    );
  }
}