document.addEventListener('DOMContentLoaded', async () => {
  const stripe = Stripe('pk_test_piSwMLrBk6TzXqSZ7aalsZJl00OAZtrjBF');
  const productList = document.getElementById('productList');
  const renderHtmlElements = [];
  let fetchAmount = 4;
  let currentTotalPrice;
  for (let i = 0; i < fetchAmount; i++) {
    const product = document.getElementById('productTemplate').content.cloneNode(true);
    const pokemon = await (await randomPokemon()).json();

    product.querySelector('.product__img').src = pokemon.sprites.front_default;
    product.querySelector('.product__title').textContent = pokemon.name;
    product.querySelector('.product__price').textContent = randomInterval(20, 3000);
    pokemon.abilities.forEach(move => {
      product.querySelector('.product__desc-list').innerHTML += `<li class="product__item-desc">${move.ability.name}</li>`
    });
    renderHtmlElements.push(product);
  }

  async function randomPokemon() {
    return await fetch('https://pokeapi.co/api/v2/pokemon/' + randomInterval(1, 600));
  }

  function randomInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  (render = () => {
    productList.innerHTML = "";
    renderHtmlElements.forEach(elm => {
      productList.append(elm);
    })
  })();

  //Shopcart
  const cart = [];
  const buy = document.querySelectorAll('.product__add');
  const cartList = document.querySelector('.cartList');
  const totalPriceElm = document.querySelector('.shopcart__price');

  buy.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const product = e.target.offsetParent.offsetParent;
      const price = product.querySelector('.product__price').textContent;
      const title = product.querySelector('.product__title').textContent;
      const img = product.querySelector('.product__img').src;
      const amount = parseInt(product.querySelector('.product__amount').value);
      let obj = { title, price, amount, img }
      let i = cart.findIndex((elm) => {
        return title === elm.title;
      });
      if (i < 0) cart.push(obj)
      else {
        obj.amount = obj.amount + cart[i].amount;
        cart[i] = obj;
      };
      updateCart();
    });
  });

  function updateCart() {
    let totalPrice = 0;
    cartList.innerHTML = "";
    totalPriceElm.textContent = "";
    cart.forEach(item => {
      const clone = document.querySelector('#shopcart-item').content.cloneNode(true);
      clone.querySelector('.cartList__title').textContent = item.title;
      clone.querySelector('.cartList__price').textContent = item.price*item.amount;
      clone.querySelector('.cartList__amount').value = item.amount;
      clone.querySelector('.cardList__img').src = item.img;
      clone.querySelector('.cardList__remove').addEventListener('click', (e) => {
        let i = cart.findIndex((elm) => {
          return item.title === elm.title;
        });

        cart.splice(i, 1);
        updateCart();
      });
      clone.querySelector('.cartList__amount').addEventListener('change', (e) => {
        let i = cart.findIndex((elm) => {
          return item.title === elm.title;
        });

        cart[i].amount = e.target.value;
        updateCart()
      });

      cartList.append(clone);
      totalPrice += item.price * item.amount;
    });
    totalPriceElm.innerHTML = totalPrice + "KR";
    currentTotalPrice = totalPrice;
  }

  //Payment with stripe
  document.querySelector('.shopcart__buy').addEventListener('click', async (e) => {
    const data = await fetch('/test', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ price: currentTotalPrice })
    }).then(res => res.json());

    stripe.redirectToCheckout({
      sessionId: data.id
    }).then(function (result) {
      console.log(result)
    });
  });
});