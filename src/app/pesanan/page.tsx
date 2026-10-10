"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrderDetail from "./[id]/order-detail";

function OrderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <main className="catalog-page">
        <section className="catalog-state">
          <strong>Nomor pesanan belum tersedia.</strong>
          <p>Buka rincian pesanan melalui tautan dari proses checkout atau halaman akun.</p>
        </section>
      </main>
    );
  }

  return <OrderDetail id={id} />;
}

export default function OrderPage() {
  return (
    <Suspense fallback={<main className="catalog-page"><div className="catalog-state">Memuat rincian pesanan...</div></main>}>
      <OrderContent />
    </Suspense>
  );
}
