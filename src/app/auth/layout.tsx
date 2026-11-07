import { Background } from "../components/Background";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Background />

      <section className="flex min-h-screen items-center justify-center">
        {children}
      </section>
    </>
  );
}
