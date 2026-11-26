import { Suspense } from "react";
import StockList from "../components/StockList";

export default function StokMenipisPage() {
  return (
    <Suspense fallback={null}>
      <StockList lowOnly />
    </Suspense>
  );
}
