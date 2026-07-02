import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Trash2, UserPlus, ShieldCheck, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Admin {
  clerkUserId: string;
  addedAt: string;
}

async function fetchAdmins(): Promise<Admin[]> {
  const res = await fetch(`${BASE}/api/admin/roles`, { credentials: "include" });
  if (!res.ok) throw new Error("Khalad");
  return res.json();
}

export default function AdminManageAdmins() {
  const { user } = useUser();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [newUserId, setNewUserId] = useState("");

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: fetchAdmins,
  });

  const addMutation = useMutation({
    mutationFn: async (clerkUserId: string) => {
      const res = await fetch(`${BASE}/api/admin/roles`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkUserId }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      setNewUserId("");
      toast({ title: "Admin cusub la daray ✓" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const removeMutation = useMutation({
    mutationFn: async (clerkUserId: string) => {
      const res = await fetch(`${BASE}/api/admin/roles/${encodeURIComponent(clerkUserId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({ title: "Admin la saaray ✓" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const copyMyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast({ title: "ID-gaaga la koobiyeeyay!" });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Maamulka Adminyada
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adminyada kala dar, kudar, ama ka saar. Adminka kaliya ayaa maamulka geli kara.
        </p>
      </div>

      {/* My ID */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">ID-gaaga (si aad ugu darto qof kale)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1.5 rounded flex-1 truncate font-mono">
              {user?.id ?? "..."}
            </code>
            <Button size="sm" variant="outline" onClick={copyMyId}>
              <Copy className="w-3 h-3 mr-1" /> Koobiyee
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add new admin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Admin Cusub Ku Dar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Qofka Clerk User ID-diisa geli (waxay ka bilaabantaa <code className="text-xs bg-muted px-1 rounded">user_</code>).
            Qofka waxa loo baahan yahay inuu kasoo galay app-ka oo uu ID-diisa kuu diray.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="user_2abc123..."
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              onClick={() => addMutation.mutate(newUserId.trim())}
              disabled={!newUserId.trim() || addMutation.isPending}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Ku Dar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current admins list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adminyada Hadda ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Waa la radinayaa...</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">Admin ma jiro.</p>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.clerkUserId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground truncate block max-w-[280px]">
                        {admin.clerkUserId}
                      </code>
                      {admin.clerkUserId === user?.id && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">Aniga</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      La daray: {new Date(admin.addedAt).toLocaleDateString("so-SO")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
                    disabled={admin.clerkUserId === user?.id || removeMutation.isPending}
                    onClick={() => removeMutation.mutate(admin.clerkUserId)}
                    title={admin.clerkUserId === user?.id ? "Nafta lagaama saari karo" : "Ka saar"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
