import { Background } from "../components/Background";
import { Navbar } from "../components/Navbar";
import { requireAuth } from "@/lib/auth";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();

  return (
    <>
      <Background />

      <div className="flex min-h-screen">
        <Navbar />

        <section className="flex flex-col flex-1 min-w-0 gap-4 p-4 py-18 sm:p-12 sm:py-8 max-w-220">
          {children}
        </section>
      </div>
    </>
  );
}
