import { Link } from "wouter";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { items, removeItem, updateQty, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Baaskiilkaagu waa faaruq</h2>
        <p className="text-muted-foreground mb-6">Ku dar alaab si aad u sii wadato</p>
        <Link href="/products">
          <Button>Aad Suuqa</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Baaskiilkaaga</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            data-testid={`card-cart-item-${item.productId}`}
            className="flex items-center gap-4 bg-card border border-card-border rounded-xl p-4"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-full h-full p-3 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.name}</p>
              <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => updateQty(item.productId, item.quantity - 1)}
                data-testid={`button-cart-minus-${item.productId}`}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium" data-testid={`text-cart-qty-${item.productId}`}>
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => updateQty(item.productId, item.quantity + 1)}
                data-testid={`button-cart-plus-${item.productId}`}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => removeItem(item.productId)}
                data-testid={`button-cart-remove-${item.productId}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-card-border rounded-xl p-6 space-y-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Wadarta Lacagta</span>
          <span className="text-primary" data-testid="text-cart-total">${total.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Dhibco aad heli doontaa: <span className="font-semibold text-secondary">{Math.floor(total)} dhibco</span>
        </p>
        <Link href="/checkout">
          <Button className="w-full" size="lg" data-testid="button-checkout">
            Dalabso <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
