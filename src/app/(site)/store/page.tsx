import type { Metadata } from "next";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/cards";

export const metadata: Metadata = { title: "Store · ASA Berea" };

export default function StorePage() {
  return (
    <>
      <div className="phead">
        <div className="glow" />
        <div className="wrap">
          <div className="lbl">Store</div>
          <h1 className="ny">Wear the <span className="em">family</span>.</h1>
          <p>ASA merch, every purchase helps fund our events and fundraising. Grab a tee, tell the story.</p>
        </div>
      </div>
      <section style={{ padding: "64px 0 40px" }}>
        <div className="wrap">
          <div className="pgrid-store">
            {products.map((p, i) => (
              <ProductCard p={p} key={i} />
            ))}
          </div>
          <div className="note reveal">
            Checkout is handled securely off-site (Stripe / campus payment). Sizes and stock are
            managed by the EC, this catalog updates from the admin dashboard.
          </div>
        </div>
      </section>
    </>
  );
}
