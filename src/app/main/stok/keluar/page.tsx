import { Suspense } from "react";
import KeluarForm from "../components/KeluarForm";

export default function StokKeluarPage() {
  return (
    <Suspense fallback={null}>
      <KeluarForm />
    </Suspense>
  );
}
