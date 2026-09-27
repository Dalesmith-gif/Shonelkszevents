const cart = [];
const grid = document.querySelector("#productGrid");
const orderItems = document.querySelector("#orderItems");
const selectedItems = document.querySelector("#selectedItems");
const total = document.querySelector("#total");

function money(n){ return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n); }

function renderProducts(){
  grid.innerHTML = window.PRODUCTS.map(p => `
    <article class="product-card">
      ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<div class="product-photo">Add ${p.name} photo</div>`}
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <strong>${p.priceLabel || money(p.price)}</strong>
      <button class="btn add" data-id="${p.id}">Add to Order</button>
    </article>`).join("");

  document.querySelectorAll(".add").forEach(b => b.addEventListener("click", () => {
    const p = window.PRODUCTS.find(x => x.id === b.dataset.id);
    cart.push({...p, cartId: crypto.randomUUID()});
    renderCart();
    document.querySelector(".order").scrollIntoView({behavior:"smooth", block:"start"});
  }));
}

function renderCart(){
  if(!cart.length){
    orderItems.innerHTML = `<p class="muted">Nothing selected yet.</p>`;
    selectedItems.value = "";
    total.textContent = "";
    return;
  }
  orderItems.innerHTML = cart.map(p => `<div class="cart-row"><span>${p.name}</span><button type="button" onclick="removeItem('${p.cartId}')">Remove</button></div>`).join("");
  selectedItems.value = cart.map(p => p.name).join(", ");
  const sum = cart.reduce((s,p)=>s+(p.price||0),0);
  total.textContent = sum ? `Estimated item total: ${money(sum)}` : "";
}
window.removeItem = id => { const i=cart.findIndex(x=>x.cartId===id); if(i>-1) cart.splice(i,1); renderCart(); };

document.querySelector("#orderForm").addEventListener("submit", e => {
  e.preventDefault();
  document.querySelector("#success").hidden = false;
});

renderProducts();
renderCart();