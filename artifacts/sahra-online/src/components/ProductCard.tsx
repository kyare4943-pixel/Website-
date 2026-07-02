import { useState } from "react";
import { Link } from "wouter";
import { ShoppingCart, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  categoryName?: string | null;
  featured?: boolean;
}

export default function ProductCard({ product, dark }: { product: Product; dark?: boolean }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl });
    toast({ title: "✅ Ku daray baaskiilka", description: product.name });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div
        data-testid={`card-product-${product.id}`}
        className={`product-card group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 border ${
          dark
            ? "bg-[#131929] border-white/10 hover:border-cyan-500/40"
            : "bg-card border-card-border hover:shadow-md"
        }`}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${dark ? "text-white/30" : "text-muted-foreground"}`}>
              <Package className="w-12 h-12" />
            </div>
          )}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs">
              Muuqda
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Dhamaaday</span>
            </div>
          )}
        </div>
        <div className="p-3">
          {product.categoryName && (
            <p className={`text-xs mb-1 ${dark ? "text-white/40" : "text-muted-foreground"}`}>{product.categoryName}</p>
          )}
          <h3 className={`font-semibold text-sm line-clamp-2 mb-2 ${dark ? "text-white" : "text-foreground"}`}>{product.name}</h3>
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-bold text-base"
              style={dark ? {
                background: "linear-gradient(90deg, #22d3ee, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              } : { color: "hsl(var(--primary))" }}
            >
              ${product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={product.stock === 0}
              data-testid={`button-add-cart-${product.id}`}
              className={`text-xs h-7 px-2 transition-all duration-200 ${
                added
                  ? dark
                    ? "bg-emerald-500/80 text-white border-0"
                    : "bg-emerald-500 text-white hover:bg-emerald-500"
                  : dark
                    ? "bg-white/10 hover:bg-cyan-500/80 text-white border-0"
                    : ""
              }`}
              variant={dark && !added ? "ghost" : "default"}
            >
              {added ? (
                <><Check className="w-3 h-3 mr-1" /> Waa darday</>
              ) : (
                <><ShoppingCart className="w-3 h-3 mr-1" /> Ku Dar</>
              )}
            </Button>
          </div>
          <p className={`text-xs mt-1 ${dark ? "text-white/30" : "text-muted-foreground"}`}>
            Kaydka: {product.stock} alaab
          </p>
        </div>
      </div>
    </Link>
  );
}
