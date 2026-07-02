import { useParams, Link } from "wouter";
import { ArrowLeft, Package, ShoppingCart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useGetProduct(Number(id), {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(Number(id)) },
  });
  const { addItem } = useCart();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Alaabtu ma jirto</p>
        <Link href="/products"><Button className="mt-4">Ku Laabo</Button></Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem({ productId: product.id, name: product.name, price: Number(product.price), quantity: qty, imageUrl: product.imageUrl });
    toast({ title: "Ku daray baaskiilka", description: `${qty}x ${product.name}` });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/products">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Alaabta
        </Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Package className="w-20 h-20" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {product.categoryName && (
            <Badge variant="secondary">{product.categoryName}</Badge>
          )}
          <h1 className="text-2xl font-bold" data-testid="text-product-name">{product.name}</h1>
          <p className="text-3xl font-bold text-primary" data-testid="text-product-price">
            ${Number(product.price).toFixed(2)}
          </p>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Kaydka:</span>
            <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
              {product.stock > 0 ? `${product.stock} alaab` : "Dhamaaday"}
            </span>
          </div>

          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  data-testid="button-qty-minus"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold w-8 text-center" data-testid="text-qty">{qty}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  data-testid="button-qty-plus"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={handleAdd} className="w-full" size="lg" data-testid="button-add-to-cart">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ku Dar Baaskiilka — ${(Number(product.price) * qty).toFixed(2)}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
