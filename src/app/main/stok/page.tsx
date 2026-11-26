import { Suspense } from "react";
import StockList from "./components/StockList";

export default function StokPage() {
  return (
    <Suspense fallback={null}>
      <StockList />
    </Suspense>
  );
}
