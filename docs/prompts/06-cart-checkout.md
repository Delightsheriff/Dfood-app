# Prompt 06 — Cart, checkout & order confirmation

Independent of Prompts 02–05, but reuses the design system.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

Three screens, the heaviest in the app:

- `app/(app)/cart.tsx` (228 lines)
- `app/(app)/checkout.tsx` (477 lines) — also the source of several
  pre-existing `activeOpacity`-on-Pressable type errors
- `app/(app)/order-confirmation.tsx` (352 lines)

Plus `components/checkout/*` (5 files: `CheckoutHeader`,
`DeliveryAddressSection`, `PaymentMethodSection`, `OrderSummary`,
`PlaceOrderButton`) and `components/ui/cart-switch-alert.tsx`.

**Important — checkout is not wired to the new data layer yet.** Phase 2 built
`store/orderStore.ts` and rewired `useCreateOrder()` to write to it, but
`checkout.tsx` still contains Paystack payment flow code from the old backend
era. There is no backend and no real payment. Part of this task is making
checkout actually call `useCreateOrder()` and land a real local order.

`react-native-paystack-webview` is still a dependency. Remove the payment
*flow* — card entry stays as cosmetic saved-card UI backed by
`store/paymentMethodStore.ts` (which fabricates a last-4 from a hash), but
nothing should attempt a real charge. Report whether the package is then unused.

## A. Cart — reference: **Instacart** and **Gopuff**

Both share a structure; take the calmer parts of each.

1. **Header** — restaurant name (the cart is single-restaurant by design) and
   the running total on the right, per Instacart's store header.
2. **Delivery ETA row** — an icon, "Delivery in 25–35 min", and the delivery
   address, tappable to change it. Gopuff's treatment.
3. **Item rows** — thumbnail, name, unit price, a quantity stepper, and the
   line total. Instacart puts the stepper in a bordered box; Gopuff uses a pill
   with `−`/`+` that swaps `−` for a trash icon at quantity 1. Take Gopuff's —
   it's the better interaction and removes the need for a separate delete
   control.
4. **Promo / notes rows** — "Add a promo code" and "Add delivery instructions"
   as chevron rows, per Gopuff. Promo can be cosmetic; delivery instructions
   should actually persist into the order's `customerNotes`.
5. **Order summary** — subtotal, delivery fee, total. Real values from
   `useCartStore.getTotalPrice()` and the restaurant's `deliveryFee`.
6. **Sticky bottom bar** — a full-width ink CTA with the total docked inside
   it, per Instacart's green bar. This is the screen's one loud moment.
7. **Empty cart** — a designed state, not a bare string.

Use FlashList for the items. Preserve the single-restaurant rule and
`cart-switch-alert`.

## B. Checkout

No strong reference image for this one — derive it from the system and keep it
short. A single scrollable page:

1. Delivery address — selected address in a card, tappable to switch. Pull from
   `useDefaultAddress()` / `useAddresses()`. Handle "no address yet" by routing
   to add-address; this is the common first-run state.
2. Delivery time — a static "25–35 min" estimate.
3. Payment method — cash or a saved card, from `usePaymentMethods()`. Cash is
   always present and default. Make it visually clear cards are demo-only.
4. Order summary — items collapsed to a count with an expand affordance, then
   subtotal / delivery fee / total.
5. Sticky "Place order" ink CTA.

On submit: call `useCreateOrder()` with the real cart contents, address id and
payment method id; on success clear the cart and replace to order confirmation.
Handle the failure path — the mutation throws when the address or payment
method can't be resolved.

## C. Order confirmation

Currently 352 lines. It should be the simplest screen in the app: a success
mark, the order number, the ETA, the delivery address, an order summary, and
two actions ("Track order" → order details, "Back to home"). Cut it down hard.

Any animation here is `transform`/`opacity` only.

## Tasks

Each its own commit: (1) cart, (2) checkout structure, (3) wire checkout to
`useCreateOrder` and strip the Paystack flow, (4) order confirmation, (5)
update or retire the `components/checkout/*` pieces, (6) verify.

Verification per the design-system doc, and this one needs a **full end-to-end
run**: add items from a real restaurant, open the cart, change quantities,
remove an item, add an address if none exists, place the order, and confirm it
appears in the Orders tab afterwards. Screenshot each step. Fix the
`activeOpacity` type errors in the files you rewrite (they're in the baseline
count — reducing it is fine, increasing it is not).

## Report back

Commits, whether `react-native-paystack-webview` is now unused, the baseline
type-error count before and after, and confirmation of the end-to-end run.
