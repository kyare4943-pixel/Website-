import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBecomeFirstAdmin } from "@/hooks/useIsAdmin";
import { useUser } from "@clerk/react";

export default function BecomeFirstAdmin() {
  const { user } = useUser();
  const mutation = useBecomeFirstAdmin();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Admin Kuma Jiro Wali</h2>
          <p className="text-muted-foreground">
            App-kan wali admin kama jiro. Aniga oo ah{" "}
            <span className="font-medium text-foreground">
              {user?.emailAddresses?.[0]?.emailAddress}
            </span>
            , waxaan noqon karaa admin-ka ugu horreeyay.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> La diyaarinayaa...</>
          ) : (
            <><ShieldCheck className="w-4 h-4 mr-2" /> Ii Dhig Admin-ka Ugu Horreeyay</>
          )}
        </Button>
        {mutation.isError && (
          <p className="text-destructive text-sm">{(mutation.error as Error).message}</p>
        )}
      </div>
    </div>
  );
}
