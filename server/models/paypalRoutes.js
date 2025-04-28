const paypal = require('@paypal/checkout-server-sdk');
const express = require('express');
const router = express.Router();

const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);

router.post('/pay', async (req, res) => {
  try {
    const { amount, currency, sunbedDate, sunbedId, restaurantId } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount
        }
      }]
    });

    const response = await client.execute(request);
    const orderID = response.result.id;

    res.status(200).json({ success: true, message: 'Payment successful', orderId: orderID });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: 'Payment failed' });
  }
});

module.exports = router;
