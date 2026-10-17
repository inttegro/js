# `@inttegro/angular`

Angular adapter for Inttegro hosted workflows. The component automatically uses
`@inttegro/js` to load the executable runtime from Inttegro's fixed origin; it
does not bundle the payment-collection runtime.

```ts
import { CheckoutComponent } from '@inttegro/angular'

@Component({
  imports: [CheckoutComponent],
  template:
    '<inttegro-checkout [orderId]="orderId" (completed)="onCompleted()" />',
})
export class PaymentPage {}
```

For a Buy link, bind `purchaseIntentId` instead of `orderId`. Fixed pricing
continues directly to payment; customer-selected pricing renders the amount
picker first. This works in both embedded and modal presentations:

```html
<inttegro-checkout [purchaseIntentId]="purchaseIntentId" presentation="modal" />
```
