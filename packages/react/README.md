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

Pass `purchaseIntentId` instead of `orderId` when the Buy link uses a
`customer_selected_amount` price. The same component renders the amount picker
before continuing to Checkout:

```tsx
<Checkout purchaseIntentId={purchaseIntentId} presentation="modal" />
```
