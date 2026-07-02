import { useUser } from "@clerk/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchRole() {
  const res = await fetch(`${BASE}/api/me/role`, { credentials: "include" });
  if (!res.ok) return { isAdmin: false, noAdminsYet: false };
  return res.json() as Promise<{ isAdmin: boolean; noAdminsYet: boolean }>;
}

export function useIsAdmin() {
  const { isSignedIn, isLoaded } = useUser();
  const { data, isLoading } = useQuery({
    queryKey: ["my-role"],
    queryFn: fetchRole,
    enabled: !!isSignedIn && isLoaded,
    staleTime: 60_000,
  });
  return {
    isAdmin: data?.isAdmin ?? false,
    noAdminsYet: data?.noAdminsYet ?? false,
    isLoading: !isLoaded || isLoading,
  };
}

export function useBecomeFirstAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/me/become-first-admin`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Khalad baa dhacay");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-role"] }),
  });
}
