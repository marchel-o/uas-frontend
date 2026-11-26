import { Suspense } from "react";
import OpnameTable from "../components/OpnameTable";

export default function StokOpnamePage() {
  return (
    <Suspense fallback={null}>
      <OpnameTable />
    </Suspense>
  );
}
