import type { SeedClient } from "./client";

type SeedProduct = {
  name: string;
  sku: string;
  category: string;
  buyPrice: number | null;
  price: number;
  stock: number;
  isActive?: boolean;
};

export const products: SeedProduct[] = [
  { name: "Aqua Air Mineral 600ml", sku: "8991079193170", category: "Minuman", buyPrice: 2800, price: 3500, stock: 96 },
  { name: "Ultra Milk Full Cream 250ml", sku: "8991158386349", category: "Minuman", buyPrice: 4900, price: 5800, stock: 48 },
  { name: "Teh Pucuk Harum 350ml", sku: "8991237579518", category: "Minuman", buyPrice: 3000, price: 3700, stock: 72 },
  { name: "Coca-Cola 390ml", sku: "8991316772687", category: "Minuman", buyPrice: 4600, price: 5500, stock: 3 },
  { name: "Good Day Cappuccino 250ml", sku: "8991395965857", category: "Minuman", buyPrice: 5200, price: 6200, stock: 0 },
  { name: "Fanta Strawberry 390ml", sku: "8991475159022", category: "Minuman", buyPrice: 4600, price: 5500, stock: 0, isActive: false },
  { name: "Indomie Goreng Spesial 85g", sku: "8991554352191", category: "Makanan Instan", buyPrice: 2750, price: 3100, stock: 120 },
  { name: "Mie Sedaap Soto 75g", sku: "8991633545360", category: "Makanan Instan", buyPrice: 2650, price: 3000, stock: 84 },
  { name: "Pop Mie Ayam Bawang 75g", sku: "8991712738539", category: "Makanan Instan", buyPrice: 4800, price: 5600, stock: 40 },
  { name: "ABC Sarden Saus Tomat 155g", sku: "8991791931708", category: "Makanan Instan", buyPrice: 8900, price: 10500, stock: 25 },
  { name: "Chitato Sapi Panggang 68g", sku: "8991871124877", category: "Makanan Ringan", buyPrice: 9700, price: 11500, stock: 36 },
  { name: "Qtela Singkong Original 60g", sku: "8991950318043", category: "Makanan Ringan", buyPrice: 7600, price: 8900, stock: 4 },
  { name: "Oreo Vanilla 133g", sku: "8992029511211", category: "Makanan Ringan", buyPrice: null, price: 9800, stock: 52 },
  { name: "SilverQueen Chunky Bar 58g", sku: "8992108704381", category: "Makanan Ringan", buyPrice: 10900, price: 12900, stock: 0 },
  { name: "Bimoli Minyak Goreng Pouch 2L", sku: "8992187897554", category: "Kebutuhan Dapur", buyPrice: 36500, price: 41000, stock: 30 },
  { name: "Gulaku Gula Pasir 1kg", sku: "8992267090721", category: "Kebutuhan Dapur", buyPrice: 16200, price: 18000, stock: 60 },
  { name: "Sania Beras Premium 5kg", sku: "8992346283891", category: "Kebutuhan Dapur", buyPrice: 68000, price: 76000, stock: 18 },
  { name: "Pepsodent Pencegah Gigi Berlubang 190g", sku: "8992425477067", category: "Perawatan Diri", buyPrice: 12300, price: 14500, stock: 38 },
  { name: "Lifebuoy Sabun Cair Total 10 400ml", sku: "8992504670235", category: "Perawatan Diri", buyPrice: 17800, price: 21000, stock: 27 },
  { name: "Sunsilk Shampoo Hitam Berkilau 170ml", sku: "8992583863405", category: "Perawatan Diri", buyPrice: null, price: 24900, stock: 22 },
  { name: "Rinso Anti Noda 770g", sku: "8992663056574", category: "Kebersihan Rumah", buyPrice: 21500, price: 24500, stock: 33 },
  { name: "Sunlight Jeruk Nipis 755ml", sku: "8992742249743", category: "Kebersihan Rumah", buyPrice: 17200, price: 19500, stock: 5 },
  { name: "Tolak Angin Cair 15ml", sku: "8992821442911", category: "Obat & Kesehatan", buyPrice: 2900, price: 3500, stock: 90 },
  { name: "Panadol Biru 10 Kaplet", sku: "8992900636088", category: "Obat & Kesehatan", buyPrice: 10100, price: 12000, stock: 0, isActive: false },
];

export async function seedProducts(
  prisma: SeedClient,
  categoryMap: Map<string, number>
) {
  const productMap = new Map<string, number>();

  for (const product of products) {
    const categoryId = categoryMap.get(product.category);

    if (!categoryId) {
      throw new Error(`Kategori tidak ditemukan: ${product.category}`);
    }

    const record = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        buyPrice: product.buyPrice,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive ?? true,
        categoryId,
      },
      create: {
        name: product.name,
        sku: product.sku,
        buyPrice: product.buyPrice,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive ?? true,
        categoryId,
      },
      select: { id: true },
    });

    productMap.set(product.sku, record.id);
  }

  return productMap;
}
