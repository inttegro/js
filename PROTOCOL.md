# Checkout frame protocol

The runtime loaded from `https://js.inttegro.com/inttegro.js@0.4.0` and the
Inttegro Pages checkout frame communicate through a versioned
`window.postMessage` protocol. `@inttegro/js` only loads that runtime and
publishes its TypeScript contract. Every message contains:

```ts
{
  channel: 'inttegro.checkout'
  version: 2
  instanceId: string
  type: string
  payload?: unknown
}
```

The parent accepts a message only when its origin matches the fixed Inttegro
Pages origin, its source is the mounted iframe window, its protocol version is
supported, and its `instanceId` matches the current checkout.

## Frame to parent

- `frame.ready`: the frame can receive initialization.
- `frame.resize`: requests a clamped iframe height.
- `frame.dismiss`: requests dismissal after an unhandled Escape key inside a
  managed modal; embedded Checkout ignores it.
- `checkout.event`: carries one validated public lifecycle event.

## Parent to frame

- `checkout.initialize`: supplies the Order reference, locale, appearance, and
  SDK identity.
- `checkout.update`: updates locale or appearance without remounting.
- `checkout.focus`: moves focus to the first actionable control.

## Public lifecycle events

- `presented`
- `ready`
- `change`
- `orderPrepared`
- `paymentAttemptStarted`
- `paymentActionRequired`
- `paymentProcessing`
- `paymentAttemptFailed`
- `completed`
- `canceled`
- `failed`

Events never include account numbers, confirmation tokens, billing details,
customer identifiers, Payment IDs, or raw provider responses. Once Checkout has
an Order, lifecycle events carry the same client-safe Order snapshot used by the
web and mobile SDKs.
