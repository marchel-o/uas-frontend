import { StokTabs } from "./components/StokTabs";

export default function StokLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StokTabs />
      {children}
    </>
  );
}
