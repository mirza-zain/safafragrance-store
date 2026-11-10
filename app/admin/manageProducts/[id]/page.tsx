'use client';

import { use, useEffect, useState, Suspense } from "react";
import Form, { AdminProduct } from "../../(component)/Form";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function EditProductContent({ params }: Props) {
  const unwrappedParams = use(params);
  const routeParams = useParams();
  const id = unwrappedParams?.id || (routeParams?.id as string) || "";

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/productDetail/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("Product not found");
        const json = await res.json();
        if (isMounted) {
          setProduct(json);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-10 flex items-center justify-center">
        <div className="size-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white p-10 flex items-center justify-center">
        <div className="rounded-2xl border border-neutral-200 p-8 text-center max-w-md shadow-xs">
          <p className="text-base font-bold text-neutral-800">Fragrance not found</p>
          <Link href="/admin/manageProducts" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-10 sm:py-10">
      {/* Back Link */}
      <div>
        <Link 
          href="/admin/manageProducts" 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black transition"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif">
          Edit Fragrance: {product.name}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update scent notes, category classification, pricing, and live inventory.
        </p>
      </div>

      {/* Form Card */}
      <Form product={product} />
    </div>
  );
}

export default function EditProductPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white p-10 flex items-center justify-center">
        <div className="size-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <EditProductContent {...props} />
    </Suspense>
  );
}
