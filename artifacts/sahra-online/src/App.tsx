import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import { useIsAdmin } from "@/hooks/useIsAdmin";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Points from "@/pages/Points";

import MyDashboard from "@/pages/MyDashboard";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminManageAdmins from "@/pages/admin/AdminManageAdmins";
import AdminUsers from "@/pages/admin/AdminUsers";
import BecomeFirstAdmin from "@/pages/admin/BecomeFirstAdmin";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#0ea5e9",
    colorForeground: "#0f172a",
    colorMutedForeground: "#64748b",
    colorDanger: "#ef4444",
    colorBackground: "#ffffff",
    colorInput: "#f8fafc",
    colorInputForeground: "#0f172a",
    colorNeutral: "#e2e8f0",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-slate-200",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-bold",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButtonText: "text-slate-700 font-medium",
    formFieldLabel: "text-slate-700 font-medium",
    footerActionLink: "text-sky-500 hover:text-sky-600 font-medium",
    footerActionText: "text-slate-500",
    dividerText: "text-slate-400",
    identityPreviewEditButton: "text-sky-500",
    formFieldSuccessText: "text-green-600",
    alertText: "text-slate-700",
    logoBox: "mb-2",
    logoImage: "rounded-xl",
    socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50",
    formButtonPrimary: "bg-sky-500 hover:bg-sky-600 text-white font-semibold",
    formFieldInput: "border border-slate-200 bg-slate-50 text-slate-900 focus:ring-sky-500",
    footerAction: "bg-slate-50",
    dividerLine: "bg-slate-200",
    alert: "bg-red-50 border-red-200",
    otpCodeFieldInput: "border-slate-300",
    formFieldRow: "",
    main: "",
  },
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

// Guard: requires sign-in
function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

// Guard: requires admin role
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, noAdminsYet, isLoading } = useIsAdmin();

  return (
    <Show when="signed-in"
      fallback={<Redirect to="/sign-in" />}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : noAdminsYet ? (
        <BecomeFirstAdmin />
      ) : isAdmin ? (
        <>{children}</>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="text-5xl">🔒</div>
            <h2 className="text-xl font-bold">Oggolaansho Kuma Lihid</h2>
            <p className="text-muted-foreground">Admin kaliya ayaa maamulka geli kara.</p>
          </div>
        </div>
      )}
    </Show>
  );
}

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/points" component={Points} />
        <Route path="/checkout">
          {() => <AuthGuard><Checkout /></AuthGuard>}
        </Route>
        <Route path="/dashboard">
          {() => <AuthGuard><MyDashboard /></AuthGuard>}
        </Route>
        <Route path="/customers">
          {() => <AuthGuard><Customers /></AuthGuard>}
        </Route>
        <Route path="/customers/:id">
          {() => <AuthGuard><CustomerDetail /></AuthGuard>}
        </Route>
        <Route path="/admin/products">
          {() => <AdminGuard><AdminLayout><AdminProducts /></AdminLayout></AdminGuard>}
        </Route>
        <Route path="/admin/orders">
          {() => <AdminGuard><AdminLayout><AdminOrders /></AdminLayout></AdminGuard>}
        </Route>
        <Route path="/admin/customers">
          {() => <AdminGuard><AdminLayout><AdminCustomers /></AdminLayout></AdminGuard>}
        </Route>
        <Route path="/admin/categories">
          {() => <AdminGuard><AdminLayout><AdminCategories /></AdminLayout></AdminGuard>}
        </Route>
        <Route path="/admin/users">
          {() => <AdminGuard><AdminLayout><AdminUsers /></AdminLayout></AdminGuard>}
        </Route>
        <Route path="/admin/manage-admins">
          {() => <AdminGuard><AdminLayout><AdminManageAdmins /></AdminLayout></AdminGuard>}
        </Route>
        <Route path="/admin">
          {() => <AdminGuard><AdminLayout><AdminDashboard /></AdminLayout></AdminGuard>}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Ku Soo Dhawoow",
            subtitle: "Gal akoonkaaga si aad u gasho suuqa",
          },
        },
        signUp: {
          start: {
            title: "Abuur Akoonto",
            subtitle: "Bilow maanta — xor ayaad u tahay",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <CartProvider>
            <Router />
            <Toaster />
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
