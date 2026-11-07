import { Background } from "../components/Background";
import { Navbar } from "../components/Navbar";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Background />

      <div className="flex min-h-screen">
        <Navbar />

        <section className="flex flex-col flex-1 min-w-0 gap-4 p-4 py-18 sm:p-12 sm:py-8 max-w-250">
          {children}
        </section>
      </div>
    </>
  );
}
