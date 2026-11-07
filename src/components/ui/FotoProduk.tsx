import Image from "next/image";

export function FotoProduk({ src, ukuran = 48 }: { src: string; ukuran?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-[color:var(--border)] bg-[var(--surface)]"
      style={{ width: ukuran, height: ukuran }}
    >
      {src && (
        <Image
          src={src}
          alt=""
          width={ukuran * 2}
          height={ukuran * 2}
          className="h-full w-full object-contain"
        />
      )}
    </span>
  );
}