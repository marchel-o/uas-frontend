import { Suspense } from "react";
import MovementHistory from "../components/MovementHistory";

export default function StokRiwayatPage() {
  return (
    <Suspense fallback={null}>
      <MovementHistory />
    </Suspense>
  );
}
