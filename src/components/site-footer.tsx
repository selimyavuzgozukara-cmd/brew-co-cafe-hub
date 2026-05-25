import { Link } from "@tanstack/react-router";
import { Coffee } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/50 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-primary text-primary-foreground">
              <Coffee size={18} />
            </span>
            <span className="font-serif text-xl font-semibold">Brew &amp; Co.</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Small-batch roasts, slow mornings, and the kind of cup you remember.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-foreground">Menu</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/orders" className="hover:text-foreground">My Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">Create account</Link></li>
            <li><Link to="/account" className="hover:text-foreground">My profile</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Visit</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>221 Roastery Lane</li>
            <li>Open daily · 7am – 7pm</li>
            <li>hello@brewco.cafe</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} Brew &amp; Co.</span>
          <span>Brewed with care.</span>
        </div>
      </div>
    </footer>
  );
}
