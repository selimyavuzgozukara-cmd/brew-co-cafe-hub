import { Link, useRouterState } from "@tanstack/react-router";
import { Coffee, ShoppingBag, User, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Menu" },
  { to: "/services", label: "Services" },
];

export function SiteHeader() {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { user, role, signOut } = useAuth();
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-primary text-primary-foreground group-hover:bg-accent transition">
            <Coffee size={18} />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">Brew &amp; Co.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
                {active && <span className="block h-0.5 w-6 mx-auto mt-0.5 bg-accent rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open cart" className="relative">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid place-items-center h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                {count}
              </span>
            )}
          </Button>

          {role === "admin" && (
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Admin">
              <Link to="/admin"><ShieldCheck size={20} /></Link>
            </Button>
          )}

          {user ? (
            <>
              <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Account">
                <Link to="/account"><User size={20} /></Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out" className="hidden sm:inline-flex">
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex bg-primary hover:bg-primary/90">
              <Link to="/login">Sign in</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobile((v) => !v)} aria-label="Menu">
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {mobile && (
        <div className="md:hidden border-t border-border bg-background animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobile(false)}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMobile(false)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">My Orders</Link>
                <Link to="/account" onClick={() => setMobile(false)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">Account</Link>
                {role === "admin" && (
                  <Link to="/admin" onClick={() => setMobile(false)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">Admin Panel</Link>
                )}
                <button onClick={() => { setMobile(false); signOut(); }} className="text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobile(false)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
