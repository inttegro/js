# `@inttegro/react`

React adapter for Inttegro hosted workflows. The component automatically uses
`@inttegro/js` to load the executable runtime from Inttegro's fixed origin; it
does not bundle the payment-collection runtime.

```tsx
import { Checkout } from '@inttegro/react'

export function Payment({ orderId }: { orderId: string }) {
  return (
    <Checkout
      orderId={orderId}
      onCompleted={() => location.assign('/complete')}
    />
  )
}
```

Pass `purchaseIntentId` instead of `orderId` for a Buy link. Fixed pricing
continues directly to payment; customer-selected pricing renders the amount
picker first:

```tsx
<Checkout purchaseIntentId={purchaseIntentId} presentation="modal" />
```
