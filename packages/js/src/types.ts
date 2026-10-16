/**
 * Color scheme used inside hosted Checkout.
 *
 * `system` follows the payer's current browser preference and updates when that
 * preference changes. Choose an explicit theme when Checkout sits in a surface
 * that does not follow the page-level color scheme, such as a fixed-theme modal.
 *
 * @category Configuration
 */
export type CheckoutTheme = 'light' | 'dark' | 'system'

/** Ways a framework adapter can display hosted Checkout. */
export type CheckoutPresentation = 'embedded' | 'modal'

/**
 * Visual preferences applied inside the hosted Checkout frame.
 *
 * The frame owns its controls, typography, payment-method presentation, and
 * validation UI so the payment experience remains consistent across merchants.
 * Your application controls the size and placement of the outer container.
 *
 * @category Configuration
 */
export interface CheckoutAppearance {
  /**
   * Checkout color scheme. Defaults to the hosted experience's system-aware
   * behavior when omitted.
   */
  theme?: CheckoutTheme | undefined
}

/** Optional content and actions exposed by hosted Checkout. */
export interface CheckoutFeatures {
  /** Shows the finalized Order's line items before payment. Defaults to `false`. */
  showLineItems?: boolean | undefined
  /** Offers the invoice after payment succeeds. Defaults to `true`. */
  showInvoiceDownload?: boolean | undefined
  /** Offers the receipt after payment succeeds. Defaults to `true`. */
  showReceiptDownload?: boolean | undefined
  /** Lets the payer replace an attached payment method. Defaults to `true`. */
  allowPaymentMethodChange?: boolean | undefined
}

/**
 * Immutable and initial configuration for one Checkout controller.
 *
 * Changing `features`, the Checkout reference, `timeout`, or `title` requires
 * a new controller. Use {@link CheckoutController.update} for locale and theme
 * changes after creation.
 *
 * @category Configuration
 */
export interface CheckoutOptionsBase {
  /** Initial color-scheme preferences for the hosted experience. */
  appearance?: CheckoutAppearance | undefined
  /** Optional hosted Checkout content and actions. */
  features?: CheckoutFeatures | undefined
  /**
   * BCP 47 locale preference, such as `en-GH`. Unsupported translations may
   * fall back to an Inttegro-supported locale.
   */
  locale?: string | undefined
  /**
   * Accessible title assigned to the hosted iframe. Defaults to `Checkout`.
   * Describe the frame's purpose; this value is not visible payment-page copy.
   */
  title?: string | undefined
  /**
   * Milliseconds to wait for the hosted checkout to emit `CheckoutReadyEvent`.
   * Accepts 1,000–60,000 ms and defaults to 15,000 ms. A timeout rejects
   * `CheckoutController.mount` and returns the controller to `idle`, so a
   * deliberate retry can mount it again.
   */
  timeout?: number | undefined
}

/** Configuration for either an existing Order or customer-selected amount flow. */
export type CheckoutOptions = CheckoutOptionsBase &
  (
    | {
        /**
         * Client-safe reference for the finalized Inttegro Order being paid.
         * Create and finalize it on your server; never expose an API key.
         */
        orderId: string
        purchaseIntentId?: never
      }
    | {
        orderId?: never
        /**
         * Client-safe Purchase Intent whose price uses the
         * `customer_selected_amount` variant.
         */
        purchaseIntentId: string
      }
  )

/**
 * The validated runtime currently served from Inttegro's controlled origin.
 *
 * Obtain this object from {@link loadInttegro}; do not read or fabricate the
 * browser global directly.
 *
 * @category Loading Checkout
 */
export interface InttegroRuntime {
  /** Hosted runtime release currently executing on the page. */
  readonly version: string
  /**
   * Major browser-to-frame messaging protocol implemented by this runtime.
   * The loader rejects runtimes that do not implement the supported version.
   */
  readonly protocolVersion: number
  /**
   * Creates an unmounted controller for a finalized Order or a Purchase Intent
   * whose price is selected by the customer inside Checkout.
   *
   * Creation validates configuration synchronously but performs no network or
   * DOM work. Register lifecycle handlers before calling
   * {@link CheckoutController.mount} so early events are not missed.
   *
   * @param options - Exactly one Checkout reference and the initial
   * presentation configuration.
   * @returns A controller in the `idle` state.
   * @throws {@link InttegroCheckoutError} with `invalid_checkout_reference`,
   * `invalid_order_id`, `invalid_purchase_intent_id`, `invalid_locale`, or
   * `invalid_timeout` for invalid options.
   */
  createCheckout(options: CheckoutOptions): CheckoutController
}

/**
 * Options used while downloading the hosted runtime.
 *
 * @category Configuration
 */
export interface InttegroLoadOptions {
  /**
   * Content Security Policy nonce copied to the script element created by the
   * loader. Supply the nonce generated for the current HTTP response; never
   * hard-code or reuse one across responses.
   */
  nonce?: string | undefined
}

/**
 * Configuration that can change without replacing the Checkout controller.
 *
 * @category Configuration
 */
export interface CheckoutUpdateOptions {
  /** New color-scheme preference for the mounted or next-mounted frame. */
  appearance?: CheckoutAppearance | undefined
  /** New BCP 47 locale preference, such as `en-GH`. */
  locale?: string | undefined
}

/**
 * Current lifecycle state of a {@link CheckoutController}.
 *
 * - `idle`: created but not mounted, cleanly unmounted, or returned after a
 *   failed mount; {@link CheckoutController.mount} may be called.
 * - `mounting`: the iframe exists and is negotiating readiness.
 * - `ready`: Checkout is interactive and {@link CheckoutController.mount} has
 *   resolved.
 * - `destroyed`: terminal state; create a new controller to show Checkout again.
 *
 * @category Lifecycle
 */
export type CheckoutState = 'idle' | 'mounting' | 'ready' | 'destroyed'

/** Money returned in Checkout lifecycle Order snapshots. */
export interface CheckoutMoney {
  /** Amount in the currency's minor unit. */
  value: number
  /** ISO 4217 currency code. */
  currency: string
}

/** Client-safe Order snapshot shared by every Inttegro Checkout SDK. */
export interface CheckoutOrder {
  /** Public identifier used for server-side reconciliation. */
  id: string
  /** Current Checkout payment state. */
  status:
    | 'requires_payment'
    | 'requires_action'
    | 'processing'
    | 'paid'
    | 'failed'
    | 'expired'
    | 'canceled'
  /** Merchant identity safe to show to the payer. */
  merchant: { displayName: string }
  /** Authoritative Order total. */
  amount: CheckoutMoney
  /** ISO 8601 expiry time, when the Order expires. */
  expiresAt?: string | undefined
  /** Client-safe Order lines shown by Checkout. */
  lineItems: Array<{
    id: string
    name: string
    quantity?: number | undefined
    total: CheckoutMoney
  }>
  /** Secure Order documents currently available to the payer. */
  documents: {
    invoiceUrl?: string | undefined
    receiptUrl?: string | undefined
  }
}

/** Payer action still required by Checkout. */
export interface CheckoutAction {
  /** Kind of action Checkout is presenting to the payer. */
  type: 'confirmation' | 'authorization' | 'redirect'
  /** ISO 8601 time after which the current action must be refreshed. */
  expiresAt?: string | undefined
}

/** Sanitized failure details safe for application logic and telemetry. */
export interface CheckoutFailure {
  /** Stable machine-readable failure category. */
  code: string
  /** Sanitized description safe for application diagnostics. */
  message: string
  /** Whether Checkout can offer another attempt in this presentation. */
  recoverable: boolean
}

interface CheckoutEventBase {
  /** ISO 8601 time at which Checkout emitted the event. */
  occurredAt: string
  /** Random identifier for one Checkout presentation. */
  flowId: string
  /** Monotonically increasing event number within the flow. */
  sequence: number
}

/** Emitted when a new Checkout presentation begins. */
export interface CheckoutPresentedEvent extends CheckoutEventBase {
  type: 'presented'
}

/** Emitted when hosted Checkout is interactive. */
export interface CheckoutReadyEvent extends CheckoutEventBase {
  type: 'ready'
}

/** Emitted when payer input changes the completion state of the form. */
export interface CheckoutChangeEvent extends CheckoutEventBase {
  type: 'change'
  complete: boolean
  paymentMethod?: 'mobile_money' | undefined
}

/** Emitted when a Purchase Intent has produced the Order being paid. */
export interface CheckoutOrderPreparedEvent extends CheckoutEventBase {
  type: 'orderPrepared'
  order: CheckoutOrder
}

/** Emitted when Checkout starts a payment attempt. */
export interface CheckoutPaymentAttemptStartedEvent extends CheckoutEventBase {
  type: 'paymentAttemptStarted'
  order: CheckoutOrder
}

/** Emitted while Checkout guides the payer through an additional action. */
export interface CheckoutPaymentActionRequiredEvent extends CheckoutEventBase {
  type: 'paymentActionRequired'
  order: CheckoutOrder
  action: CheckoutAction
}

/** Emitted while a submitted payment remains pending. */
export interface CheckoutPaymentProcessingEvent extends CheckoutEventBase {
  type: 'paymentProcessing'
  order: CheckoutOrder
}

/** Emitted when one payment attempt fails without ending Checkout. */
export interface CheckoutPaymentAttemptFailedEvent extends CheckoutEventBase {
  type: 'paymentAttemptFailed'
  order: CheckoutOrder
  failure: CheckoutFailure
}

/** Emitted when Checkout reaches its successful terminal experience. */
export interface CheckoutCompletedEvent extends CheckoutEventBase {
  type: 'completed'
  order: CheckoutOrder
}

/** Emitted when the payer deliberately leaves Checkout before completion. */
export interface CheckoutCanceledEvent extends CheckoutEventBase {
  type: 'canceled'
  order?: CheckoutOrder | undefined
}

/** Emitted when Checkout cannot continue the current presentation. */
export interface CheckoutFailedEvent extends CheckoutEventBase {
  type: 'failed'
  order?: CheckoutOrder | undefined
  failure: CheckoutFailure
}

/**
 * Discriminated union of every public hosted Checkout lifecycle event.
 *
 * Switch on `type` for exhaustive event handling. Event payloads are deliberately
 * minimal and never include payment credentials or contact details.
 *
 * @category Events
 */
export type CheckoutEvent =
  | CheckoutPresentedEvent
  | CheckoutReadyEvent
  | CheckoutChangeEvent
  | CheckoutOrderPreparedEvent
  | CheckoutPaymentAttemptStartedEvent
  | CheckoutPaymentActionRequiredEvent
  | CheckoutPaymentProcessingEvent
  | CheckoutPaymentAttemptFailedEvent
  | CheckoutCompletedEvent
  | CheckoutCanceledEvent
  | CheckoutFailedEvent

/**
 * Valid event names accepted by {@link CheckoutController.on}.
 *
 * @category Events
 */
export type CheckoutEventType = CheckoutEvent['type']

/**
 * Selects the payload associated with one {@link CheckoutEventType}.
 *
 * This powers type-safe event callbacks. For example,
 * `CheckoutEventOfType<'failed'>` resolves to {@link CheckoutFailedEvent}.
 *
 * @typeParam Type - Event discriminator to select.
 * @category Events
 */
export type CheckoutEventOfType<Type extends CheckoutEventType> = Extract<
  CheckoutEvent,
  { type: Type }
>

/**
 * Type-safe handler for one hosted Checkout event name.
 *
 * @typeParam Type - Event discriminator delivered to the handler.
 * @category Events
 */
export type CheckoutEventHandler<Type extends CheckoutEventType> = (
  event: CheckoutEventOfType<Type>,
) => void

/**
 * Owns the lifecycle of one hosted Checkout instance.
 *
 * Create a controller with {@link InttegroRuntime.createCheckout}, subscribe to
 * events, and then either mount it in an empty HTML element or ask Inttegro to
 * present it in a managed modal. A controller may be unmounted and mounted
 * again, but cannot be reused after `destroy()`. Framework adapters manage this
 * lifecycle automatically.
 *
 * @example Mount, observe, and clean up a controller
 * ```ts
 * const checkout = inttegro.createCheckout({ orderId })
 * const unsubscribe = checkout.on('completed', handleCompleted)
 *
 * try {
 *   await checkout.mount(container)
 * } catch (error) {
 *   showCheckoutUnavailable(error)
 * }
 *
 * // When the surrounding view is permanently removed:
 * unsubscribe()
 * checkout.destroy()
 * ```
 *
 * @category Checkout
 */
export interface CheckoutController {
  /** Read-only lifecycle state at the time it is accessed. */
  readonly state: CheckoutState
  /**
   * Creates the hosted iframe inside an empty target and waits until it is
   * interactive.
   *
   * The target may be an element or a CSS selector. The promise resolves when
   * the `ready` event is received. It rejects if the frame fails, times out, or
   * is unmounted while initialization is pending; after those failures the
   * controller returns to `idle` and may be mounted again.
   *
   * @param target - Existing HTML element or CSS selector that resolves to one.
   * @throws {@link InttegroCheckoutError} with `unsupported_environment`,
   * `destroyed`, `already_mounted`, `target_not_found`, `mount_failed`, or
   * `mount_timeout`.
   */
  mount(target: string | HTMLElement): Promise<void>
  /**
   * Presents Checkout in an Inttegro-managed modal and waits until it is ready.
   *
   * No target element or application modal is required. The runtime owns the
   * backdrop, responsive sizing, viewport scrolling, close controls, focus
   * containment and restoration, page scroll lock, and teardown. A payer who
   * dismisses the modal before completion produces a
   * {@link CheckoutCanceledEvent}.
   *
   * @throws {@link InttegroCheckoutError} with the same initialization errors
   * as {@link mount}.
   */
  present(): Promise<void>
  /**
   * Closes a managed modal and returns the controller to `idle`.
   *
   * Calling this method for an embedded or already-dismissed Checkout is safe
   * and has no effect. Dismissing before completion emits one
   * {@link CheckoutCanceledEvent}; dismissing after completion does not turn a
   * successful payment into a cancellation.
   */
  dismiss(): void
  /**
   * Removes the iframe and browser listeners while keeping the controller reusable.
   *
   * Calling this method during `mounting` rejects the outstanding
   * {@link mount} promise with `mount_failed`. Calling it while idle or after
   * destruction is safe. Event subscriptions remain registered for a later
   * mount; call {@link destroy} for permanent cleanup.
   */
  unmount(): void
  /**
   * Permanently removes Checkout and all event subscriptions.
   *
   * Destruction is idempotent. A destroyed controller cannot be mounted again;
   * create a new one if the flow must restart.
   */
  destroy(): void
  /**
   * Moves focus into the first actionable control in hosted Checkout.
   *
   * Use this after opening Checkout in a dialog or when validation elsewhere on
   * the page sends the payer back to payment collection.
   *
   * @throws {@link InttegroCheckoutError} with `not_mounted` unless the
   * controller is `ready`.
   */
  focus(): void
  /**
   * Changes locale or color scheme without replacing the iframe.
   *
   * Updates made before `ready` are stored and applied during initialization.
   * Ready controllers receive the update immediately. Invalid locales throw
   * synchronously and leave the previous locale unchanged.
   *
   * @param options - Mutable presentation settings to apply.
   * @throws {@link InttegroCheckoutError} with `invalid_locale`.
   */
  update(options: CheckoutUpdateOptions): void
  /**
   * Subscribes to every public lifecycle event.
   *
   * Register the handler before {@link mount} to observe initialization. A
   * handler exception is rethrown in a microtask so it cannot stop Checkout or
   * other subscribers; install your normal global error monitoring as well.
   *
   * @param handler - Callback invoked for each sanitized event.
   * @returns An idempotent function that removes this subscription.
   */
  onEvent(handler: (event: CheckoutEvent) => void): () => void
  /**
   * Subscribes to one lifecycle event with a correctly narrowed payload type.
   *
   * Register before {@link mount} when listening for `ready`. The returned
   * cleanup function should be called when the host view is removed unless the
   * controller will immediately be destroyed.
   *
   * @typeParam Type - Event discriminator to observe.
   * @param type - Public event name.
   * @param handler - Callback receiving that event's payload.
   * @returns An idempotent function that removes this subscription.
   */
  on<Type extends CheckoutEventType>(
    type: Type,
    handler: CheckoutEventHandler<Type>,
  ): () => void
}
