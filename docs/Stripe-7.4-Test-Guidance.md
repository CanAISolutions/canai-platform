# Fixing Stripe Integration Test Failures

## Problem
The Stripe integration tests in `refund.integration.test.js` and `stripe.refund.integration.test.js` are failing with a `TypeError: Cannot read properties of undefined (reading 'stack')` due to an invalid attempt to re-mount the `/webhook` route handler from `stripeRouter._router.stack`. This broke the entire Express app setup, causing all 26 tests to fail. Previous changes to middleware (e.g., global `express.raw()` or manual route definitions) also disrupted non-webhook routes like `/refund`, which expect parsed JSON bodies.

## Cause
- The test setup incorrectly tried to override the `/webhook` route using `stripeRouter._router.stack`, an internal and unsupported operation.
- Middleware misconfiguration (e.g., global `express.raw()` instead of `express.json()`) caused `/refund` to receive raw Buffers instead of parsed objects, leading to validation failures.
- The `stripeRouter` should handle the `/webhook` route with `express.raw({ type: 'application/json' })`, but the test setup interfered with this.

## Solution
Revert to a minimal, correct test setup:
- Use `express.json()` globally to parse JSON bodies for all routes by default.
- Mount the `stripeRouter` as-is, allowing it to apply `express.raw({ type: 'application/json' })` to the `/webhook` route.
- Remove all custom route definitions or middleware overrides in the test setup.

### Steps for Cursor AI Agent
1. **Open `refund.integration.test.js` and `stripe.refund.integration.test.js`**:
   - Locate the `beforeEach` block in both files.

2. **Update the Middleware Configuration**:
   - Replace the current `beforeEach` middleware setup with the following:
     ```javascript
     beforeEach(() => {
       vi.clearAllMocks();

       app = express();
       app.use(express.json());
       app.use('/', stripeRouter);

       mockStripe = stripe;
       mockSupabase = supabase;

       mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);
       mockStripe.refunds.create.mockResolvedValue(mockRefund);
       mockStripe.refunds.retrieve.mockResolvedValue(mockRefund);

       const mockUpdate = vi.fn(() => ({
         eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
       }));
       const mockInsert = vi.fn().mockResolvedValue({ data: {}, error: null });
       mockSupabase.from.mockReturnValue({
         insert: mockInsert,
         update: mockUpdate,
       });

       mockStripe.webhooks.constructEvent.mockImplementation((body, sig, secret) => {
         return JSON.parse(body.toString());
       });
     });
     ```
   - **Remove or comment out** any lines like `app.post('/webhook', ...)` or custom middleware logic that tries to extract or re-mount route handlers.

3. **Verify `../../routes/stripe.js`**:
   - Ensure the `/webhook` route in `stripeRouter` uses `express.raw({ type: 'application/json' })` as middleware. The expected configuration should look like:
     ```javascript
     router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);
     ```
   - If this is not present, add it to the `/webhook` route definition in `../../routes/stripe.js`.

4. **Run the Tests**:
   - Execute `npm test` or the equivalent command to verify all tests pass.
   - Expected outcome: All 26 failing tests should now pass with correct status codes (200 for successful requests, 400/403/404 for errors).

## Why This Works
- **Global `express.json()`**: Ensures `/refund` and other JSON-based routes receive parsed objects, fixing validation and processing.
- **Router-Defined `express.raw()`**: The `stripeRouter` applies `express.raw()` only to `/webhook`, preserving the raw Buffer needed for Stripe's `constructEvent`.
- **No Custom Overrides**: Avoiding manual route redefinition prevents the `TypeError` and ensures the app setup aligns with the router's configuration.

## Validation
- After applying the changes, run `npm test`.
- Check the output for any remaining failures.
- If the `rejects webhook with invalid signature` test fails (expecting 400 but getting 200), adjust the mock `constructEvent` to simulate a signature verification failure for that test case.

## Additional Notes
- If tests still fail, inspect the console output for specific errors and ensure `../../routes/stripe.js` correctly defines all routes with appropriate middleware.
- This setup assumes the webhook handler in `../../routes/stripe.js` or its controller expects a raw Buffer and calls `stripe.webhooks.constructEvent` correctly.

Let me know if further adjustments are needed after validation!