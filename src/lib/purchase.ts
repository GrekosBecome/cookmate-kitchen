export async function handleUpgrade(plan: "monthly" | "yearly" = "monthly") {
  const isIOSNative = (window as any)?.NativeBridge?.platform === "ios";
  const cfg = (window as any).AppConfig;
  if (!cfg) return;

  if (isIOSNative && typeof (window as any).NativeBridge?.purchase === "function") {
    const productId = plan === "yearly" ? cfg.ios.productYearly : cfg.ios.productMonthly;
    try { 
      await (window as any).NativeBridge.purchase(productId); 
    } catch (e) { 
      console.error(e); 
    }
    return;
  }

  // Web/PWA → Stripe Checkout
  const priceId = plan === "yearly" ? cfg.stripe.priceYearly : cfg.stripe.priceMonthly;
  // Replace the URL below with your existing backend endpoint that creates a Stripe Checkout Session:
  window.location.href = `/api/checkout?price_id=${encodeURIComponent(priceId)}`;
}
