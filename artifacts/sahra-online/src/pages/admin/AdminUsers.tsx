import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { ShieldCheck, ShieldOff, Users, Clock, Copy, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ClerkUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  imageUrl: string | null;
  createdAt: number;
  isAdmin: boolean;
}

async function fetchUsers(): Promise<ClerkUser[]> {
  const res = await fetch(`${BASE}/api/admin/users`, { credentials: "include" });
  if (!res.ok) throw new Error("Khalad baa dhacay");
  return res.json();
}

function Avatar({ user }: { user: ClerkUser }) {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  return user.imageUrl ? (
    <img src={user.imageUrl} alt={initials} className="w-10 h-10 rounded-full object-cover" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
      {initials}
    </div>
  );
}

export default function AdminUsers() {
  const { user: me } = useUser();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    refetchInterval: 30_000,
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (clerkUserId: string) => {
      const res = await fetch(`${BASE}/api/admin/roles`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkUserId }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({ title: "✅ Admin la dhigay!" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (clerkUserId: string) => {
      const res = await fetch(`${BASE}/api/admin/roles/${encodeURIComponent(clerkUserId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({ title: "✅ Admin la saaray" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "ID la koobiyeeyay!" });
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.isAdmin).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Isticmaalayaasha
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Dadka soo galiyay app-ka — admin ka dhig ama ka saar
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Isticmaalayaasha", value: users.length, color: "text-primary bg-primary/10" },
          { label: "Adminyada", value: adminCount, color: "text-emerald-700 bg-emerald-50" },
          { label: "Caadiga", value: users.length - adminCount, color: "text-slate-600 bg-slate-100" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-card-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color.split(" ")[0]}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Raadi magac ama email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Isticmaale lama helin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
            const isMe = u.id === me?.id;
            const fullName = `${u.firstName} ${u.lastName}`.trim() || "Magac la'aan";
            return (
              <div
                key={u.id}
                className={`bg-card border rounded-xl p-4 flex items-center gap-4 transition-all ${
                  u.isAdmin ? "border-emerald-200 bg-emerald-50/30" : "border-card-border"
                }`}
              >
                {/* Avatar */}
                <Avatar user={u} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{fullName}</span>
                    {isMe && <Badge variant="secondary" className="text-xs">Adiga</Badge>}
                    {u.isAdmin && (
                      <Badge className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-100">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {u.email ?? "Email la'aan"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <code className="text-[10px] text-muted-foreground/70 font-mono truncate max-w-[200px]">
                      {u.id}
                    </code>
                    <button
                      onClick={() => copyId(u.id)}
                      className="text-muted-foreground/50 hover:text-primary transition-colors flex-shrink-0"
                      title="Koobiyee ID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    Soo galay: {new Date(u.createdAt).toLocaleDateString("so-SO", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {u.isAdmin ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={isMe || removeAdminMutation.isPending}
                      title={isMe ? "Nafta lagaama saari karo" : "Admin ka saar"}
                      onClick={() => removeAdminMutation.mutate(u.id)}
                    >
                      <ShieldOff className="w-3 h-3 mr-1" />
                      Ka Saar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={makeAdminMutation.isPending}
                      onClick={() => makeAdminMutation.mutate(u.id)}
                    >
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Admin Dhig
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
