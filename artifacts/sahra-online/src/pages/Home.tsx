import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Search, ArrowRight, Zap, Clock, ShoppingBag, Star, TrendingUp, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { useListProducts, useListCategories, useGetFeaturedProducts } from "@workspace/api-client-react";

const ROTATING_WORDS = ["Dharka", "Telefoonada", "Cuntada", "Guryaha", "Caruurta"];
const SALE_MESSAGES = [
  { pct: "50%", label: "Dharka", cat: "Dharka" },
  { pct: "30%", label: "Telefoonada", cat: "Telefoonada" },
  { pct: "40%", label: "Cuntada", cat: "Cuntada" },
  { pct: "25%", label: "Guryaha", cat: "Guryaha" },
];

function FloatingDots() {
  const dots = Array.from({ length: 18 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${4 + (i % 5) * 3}px`,
            height: `${4 + (i % 5) * 3}px`,
            background: i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#a855f7" : "#3b82f6",
            left: `${(i * 17 + 5) % 95}%`,
            top: `${(i * 23 + 8) % 90}%`,
            animation: `float-dot ${4 + (i % 4)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

function Countdown({ targetHours = 12 }: { targetHours?: number }) {
  const endRef = useRef<number>(Date.now() + targetHours * 3600 * 1000);
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endRef.current - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex gap-3 justify-center mt-4">
      {[{ v: time.h, l: "SAACAD" }, { v: time.m, l: "DAQIIQO" }, { v: time.s, l: "ILBIRIQSI" }].map(({ v, l }) => (
        <div key={l} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[70px] border border-white/10">
          <div className="text-3xl font-black text-white tabular-nums leading-none">
            {String(v).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-white/50 font-semibold tracking-widest mt-1">{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [saleIdx, setSaleIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [saleVisible, setSaleVisible] = useState(true);

  const { data: featured, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: categories } = useListCategories();
  const { data: products, isLoading: loadingProducts } = useListProducts(
    selectedCat ? { categoryId: selectedCat } : undefined
  );

  const filtered = products?.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Rotate hero word
  useEffect(() => {
    const id = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % ROTATING_WORDS.length);
        setWordVisible(true);
      }, 400);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Rotate sale message
  useEffect(() => {
    const id = setInterval(() => {
      setSaleVisible(false);
      setTimeout(() => {
        setSaleIdx((i) => (i + 1) % SALE_MESSAGES.length);
        setSaleVisible(true);
      }, 500);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const sale = SALE_MESSAGES[saleIdx];

  return (
    <div className="min-h-screen bg-[#070b14]">
      <style>{`
        @keyframes float-dot {
          from { transform: translateY(0px) translateX(0px); }
          to   { transform: translateY(-18px) translateX(8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 20px #22d3ee88, 0 0 40px #a855f744; }
          50%       { text-shadow: 0 0 40px #22d3eecc, 0 0 80px #a855f788; }
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 8px #22d3ee66; }
          50%       { box-shadow: 0 0 20px #22d3eeaa; }
        }
        .hero-text { animation: glow-pulse 3s ease-in-out infinite; }
        .badge-anim { animation: badge-glow 2s ease-in-out infinite; }
        .word-enter { animation: wordIn 0.4s ease forwards; }
        .word-exit  { animation: wordOut 0.4s ease forwards; }
        @keyframes wordIn  { from { opacity:0; transform: translateY(12px);} to { opacity:1; transform:translateY(0);} }
        @keyframes wordOut { from { opacity:1; transform: translateY(0);}  to { opacity:0; transform:translateY(-12px);} }
        .sale-in  { animation: wordIn 0.5s ease forwards; }
        .sale-out { animation: wordOut 0.5s ease forwards; }
      `}</style>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, #0f1e3a 0%, #070b14 70%)" }}>
        <FloatingDots />

        {/* Badge */}
        <div className="relative z-10 mb-6">
          <span className="badge-anim inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-sm font-semibold tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            Suuqa Ugu Weyn Soomaalida
          </span>
        </div>

        {/* Main text */}
        <div className="relative z-10 space-y-2 mb-6">
          <p className="text-white/50 uppercase tracking-[0.3em] text-sm font-medium">SOO IIBSO</p>
          <h1
            className="text-7xl sm:text-8xl md:text-9xl font-black leading-none tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span
              className="block hero-text"
              style={{
                background: "linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SAHRA
            </span>
            <span className="block text-white">ONLINE</span>
          </h1>

          {/* Rotating word */}
          <div className="h-12 flex items-center justify-center mt-3">
            <span
              key={wordIdx}
              className={`text-2xl sm:text-3xl font-bold ${wordVisible ? "word-enter" : "word-exit"}`}
              style={{
                background: "linear-gradient(90deg, #f59e0b, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {ROTATING_WORDS[wordIdx]}
            </span>
          </div>
        </div>

        <p className="relative z-10 text-white/60 text-lg max-w-sm mb-8 leading-relaxed">
          Goobta ugu wanaagsan ee alaabta Soomaalida — casri, qiimo jaban, la imaanaya.
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex gap-3 mb-10 flex-wrap justify-center">
          <Link href="/products">
            <Button size="lg" className="rounded-full px-8 font-bold text-base"
              style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)", border: "none", boxShadow: "0 0 24px #22d3ee55" }}>
              Iibso Hadda <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="rounded-full px-8 font-bold text-base border-white/20 text-white hover:bg-white/10 bg-transparent">
              Cusub <Star className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative z-10 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            className="pl-11 h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-500/60 focus:bg-white/15"
            placeholder="Raadi alaab..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* ── FLASH SALE BANNER ── */}
      <section className="relative overflow-hidden py-12 px-4"
        style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #0f1e3a 50%, #1a0a2e 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 80% 50%, #22d3ee 0%, transparent 50%)"
          }} />
        </div>
        <div className="relative z-10 max-w-lg mx-auto text-center">
          {/* Flash Sale badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Clock className="w-3 h-3" /> Iibinta Degdegga Waa Dhamaanaysaa
          </div>

          {/* Rotating sale text */}
          <div className="h-24 flex flex-col items-center justify-center">
            <div key={saleIdx} className={saleVisible ? "sale-in" : "sale-out"}>
              <p className="text-5xl sm:text-6xl font-black text-white leading-none">
                Ilaa{" "}
                <span style={{
                  background: "linear-gradient(90deg, #22d3ee, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {sale.pct} OFF
                </span>
              </p>
              <p className="text-white/60 text-lg mt-1 font-medium">{sale.label} — Hadda Iibso</p>
            </div>
          </div>

          <Link href="/products">
            <Button size="lg" className="mt-5 rounded-full px-10 font-bold text-base"
              style={{ background: "linear-gradient(90deg, #22d3ee, #a855f7)", border: "none", boxShadow: "0 0 30px #a855f766" }}>
              Alaabta Fur <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Countdown targetHours={12} />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-[#0c1220] py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-2xl font-black text-white">Qaybaha Alaabta</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCat(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                selectedCat === null
                  ? "bg-cyan-500 border-cyan-500 text-white shadow-[0_0_12px_#22d3ee66]"
                  : "border-white/20 text-white/60 hover:border-cyan-500/50 hover:text-white bg-white/5"
              }`}
            >
              Dhammaan
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  selectedCat === cat.id
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-[0_0_12px_#22d3ee66]"
                    : "border-white/20 text-white/60 hover:border-cyan-500/50 hover:text-white bg-white/5"
                }`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
                {cat.productCount != null && (
                  <span className="ml-2 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{cat.productCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      {!selectedCat && !search && (
        <section className="bg-[#0c1220] px-4 pb-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-cyan-400" /> Alaabta Muuqda
              </h2>
              <Link href="/products">
                <button className="text-cyan-400 text-sm font-medium flex items-center gap-1 hover:text-cyan-300">
                  Dhammaanba <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            {loadingFeatured ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl bg-white/10" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featured?.map((p) => (
                  <div key={p.id} className="[&_.product-card]:bg-[#131929] [&_.product-card]:border-white/10">
                    <ProductCard product={{ ...p, price: Number(p.price) }} dark />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── ALL PRODUCTS ── */}
      <section className="bg-[#070b14] px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-400" />
            {selectedCat ? categories?.find((c) => c.id === selectedCat)?.name : "Dhammaan Alaabta"}
          </h2>
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl bg-white/10" />
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-16 text-white/40">Alaab lama helin</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered?.map((p) => (
                <div key={p.id} className="[&_.product-card]:bg-[#131929] [&_.product-card]:border-white/10">
                  <ProductCard product={{ ...p, price: Number(p.price) }} dark />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
