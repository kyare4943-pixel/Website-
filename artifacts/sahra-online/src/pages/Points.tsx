import { Trophy, Star, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTopCustomers } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function Points() {
  const { data: topCustomers, isLoading } = useGetTopCustomers();

  const rankColors = ["from-yellow-400 to-amber-500", "from-gray-300 to-gray-400", "from-orange-400 to-orange-500"];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-2">
          <Trophy className="w-8 h-8 text-secondary" />
        </div>
        <h1 className="text-3xl font-bold">Dhibcaha</h1>
        <p className="text-muted-foreground">Macaamiisha dhibcaha ugu badan</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : topCustomers?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Macaamiil lama helin</div>
      ) : (
        <div className="space-y-3">
          {topCustomers?.map((customer, index) => (
            <Link key={customer.id} href={`/customers/${customer.id}`}>
              <div
                data-testid={`card-leaderboard-${customer.id}`}
                className={`flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  index < 3
                    ? `bg-gradient-to-r ${rankColors[index]} text-white shadow-md`
                    : "bg-card border border-card-border"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                  index < 3 ? "bg-white/30" : "bg-muted text-foreground"
                }`}>
                  {index < 3 ? medals[index] : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${index < 3 ? "text-white" : ""}`}>{customer.name}</p>
                  <p className={`text-sm ${index < 3 ? "text-white/80" : "text-muted-foreground"}`}>{customer.phone}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold text-lg ${index < 3 ? "text-white" : "text-secondary"}`}>
                  <Star className={`w-4 h-4 ${index < 3 ? "fill-white" : "fill-secondary text-secondary"}`} />
                  <span data-testid={`text-points-${customer.id}`}>{customer.points}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground text-center">
        Waxaad helaysaa <strong>1 dhibco</strong> dalabkii $1 ah markaad heshid gudbinta. Dhibcohaagu waxay kaa dhigayaan heerka sare!
      </div>
    </div>
  );
}
