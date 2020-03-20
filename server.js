require('dotenv').config();
const publicKey = process.env.stripePublic;
const secretKey = process.env.stripeSecret;
const stripe = require('stripe')(secretKey);
const express = require('express');
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('./dist'));
app.post('/test', function (req, res) {
  if (req.body) {
    (async () => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          name: 'Pokemons',
          description: 'Quality pokemons for cheap',
          images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/1200px-International_Pok%C3%A9mon_logo.svg.png'],
          amount: req.body.price*100,
          currency: 'DKK',
          quantity: 1,
        }],
        success_url: 'http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/cancel',
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['DK', "SE", "NO"]
        }
      });
      res.end(JSON.stringify(session))
    })();
  }
});

app.listen(8080);