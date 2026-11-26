import { Suspense } from "react";
import MasukForm from "../components/MasukForm";

export default function StokMasukPage() {
  return (
    <Suspense fallback={null}>
      <MasukForm />
    </Suspense>
  );
}
