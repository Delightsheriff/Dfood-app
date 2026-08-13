# Screen redesign prompts

Self-contained handoff prompts for the Dfood redesign. Each is written for a
fresh agent with no memory of this project.

Every prompt starts by pointing at [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md),
which holds the shared contract — tokens, established patterns, performance
rules, data-layer quirks, verification requirements, commit rules. The prompts
deliberately don't restate it.

## Order

`01` must land first — it restructures routing, and everything else assumes
tabs exist. `02` and `03` are sequential because each redesigns a shared card
component the next one uses. After that the branches are independent.

```
01 tabs shell
├── 02 home feed ──── 03 restaurants ──┬── 04 categories
│                                      └── 05 search & filters
├── 06 cart & checkout        (independent)
├── 07 profile & orders       (needs 01 only)
└── 08 onboarding             (independent)
```

| # | Prompt | Scope | Depends on |
| --- | --- | --- | --- |
| 01 | [Tabs & navigation shell](./01-tabs-shell.md) | Native tab bar, route restructure | — |
| 02 | [Home feed](./02-home-feed.md) | Home screen, `RestaurantCard` | 01 |
| 03 | [Restaurants](./03-restaurants.md) | List + detail, `FoodCard` | 02 |
| 04 | [Categories](./04-categories.md) | Index grid + category detail | 03 |
| 05 | [Search & filters](./05-search-filters.md) | Search tab, native filter sheet | 02, 03 |
| 06 | [Cart & checkout](./06-cart-checkout.md) | Cart, checkout, confirmation | — |
| 07 | [Profile & orders](./07-profile-orders.md) | 9 screens, local profile store | 01 |
| 08 | [Onboarding](./08-onboarding.md) | 3 slides | — |

Already done: `app/(app)/food/[id].tsx` — the reference implementation. When a
prompt is ambiguous about composition, open that file.

## Scope decisions folded into these prompts

Worth knowing before handing off, because each changes behavior rather than
just appearance:

- **Prompt 01** promotes `profile/orders` to a tab root, breaking existing links.
- **Prompt 06** removes the Paystack payment flow and wires checkout to
  `useCreateOrder()`, which it currently never calls — so no order has ever
  actually been created by the UI.
- **Prompt 07** cuts personal-info from a full account editor down to a local
  name + avatar, and makes `getProfile()` read real local state instead of
  returning a hardcoded "Guest".
- **Prompt 04** adds a restaurants section to category detail, which today only
  lists dishes.

## Still owed

OpenStreetMap and TheMealDB both require visible attribution. Prompt 07 places
it in Profile → About. If 07 is deprioritized, it needs a home elsewhere.
