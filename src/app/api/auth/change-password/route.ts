import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { oldPass, newPass } = await req.json();

    if (
      typeof oldPass !== "string" ||
      typeof newPass !== "string" ||
      !oldPass.trim() ||
      !newPass.trim()
    ) {
      return NextResponse.json(
        { message: "Password harus diisi" },
        { status: 400 }
      );
    };

    const passwordValid = await bcrypt.compare(
      oldPass,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        { message: "Password salah" },
        { status: 401 }
      );
    };

    const hashedPass = await bcrypt.hash(newPass, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPass
      }
    });

    return NextResponse.json(
      { message: "Berhasil mengubah password" },
      { status: 200 },
    );
  } catch (error){
    console.error(error);
  }
}
