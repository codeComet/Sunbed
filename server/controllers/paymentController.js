const axios = require('axios')
var fetch = require('node-fetch');
async function generateAccessToken() {
    const response = await axios({
        url: 'https://api-m.sandbox.paypal.com' + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: "AfFzsJsz-eRNK1kzo56JGa5oGBgLB0Ci7JBD120LTKY8LsdbRhTkvpXk7gpOxQjhR3xQ2bT3D6qeBrlJ",
            password: "EDbWId22K0zXR1DbAghuZ7AEQN2yK2XgqC9QDDeUYkLhIVx_u3V9TtjQ-Whp-dlAnMoE4lQ4EnVTx2Dt"
        }
    })
    return response.data.access_token
}

exports.createOrder = async (amount, returnUrl) => {
    const accessToken = await generateAccessToken();
    
    const response = await axios({
      url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
      data: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'ALL',
              value: amount
            }
          }
        ],
        application_context: {
          return_url: `https://urchin-app-q9tcj.ondigitalocean.app/complete-order?returnUrl=${encodeURIComponent(returnUrl)}`,
          cancel_url: `https://urchin-app-q9tcj.ondigitalocean.app/cancel-order?returnUrl=${encodeURIComponent(returnUrl)}`,
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW'
        }
      })
    });
  
    const approvalUrl = response.data.links.find(link => link.rel === 'approve').href;
    return approvalUrl;
  };
  

exports.capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken()


    const response = await fetch('https://api-m.sandbox.paypal.com' + `/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    });

    return response.data
}
