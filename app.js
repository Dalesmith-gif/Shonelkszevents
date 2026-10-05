
const cart=[], grid=document.querySelector("#productGrid"), orderItems=document.querySelector("#orderItems"),
selected=document.querySelector("#selectedItems"), total=document.querySelector("#total"),
form=document.querySelector("#orderForm"), success=document.querySelector("#success");
const db=window.supabase.createClient(SEZ_CONFIG.supabaseUrl,SEZ_CONFIG.supabaseAnonKey);
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);
const SQUARE_APP_ID="sq0idp-rpXZE-P7jIavWmGbxDWsZA";
const SQUARE_LOCATION_ID="L7NRPYP94ZS16";
const SQUARE_PAYMENT_URL="https://izfnihecnckzsxbukpvb.supabase.co/functions/v1/square-create-payment-production";

let squareCard=null;
let currentOrderId=null;
function renderProducts(){
 grid.innerHTML=window.PRODUCTS.map(p=>`<article class="card"><img src="${p.image}" alt="${p.name}">
 <div class="card-body"><span class="eyebrow">${p.eyebrow||""}</span><h3>${p.name}</h3>
 <p>${p.description}</p><b>${p.priceLabel||money(p.price)}</b>
 <button class="pill navy add" data-id="${p.id}">Add to Order</button></div></article>`).join("");
 document.querySelectorAll(".add").forEach(b=>b.onclick=()=>{
  const p=window.PRODUCTS.find(x=>x.id===b.dataset.id);
  cart.push({...p,cartId:crypto.randomUUID()}); renderCart();
  document.querySelector(".order").scrollIntoView({behavior:"smooth"});
 });
}
function renderCart(){
 if(!cart.length){orderItems.innerHTML='<p class="muted">Nothing selected yet.</p>';selected.value="";total.textContent="";return}
 orderItems.innerHTML=cart.map(p=>`<div class="row"><span>${p.name} — ${money(p.price||0)}</span>
 <button type="button" onclick="removeItem('${p.cartId}')">Remove</button></div>`).join("");
 selected.value=cart.map(p=>p.name).join(", ");
 const sum=cart.reduce((a,p)=>a+Number(p.price||0),0);
 total.textContent=`Estimated item total: ${money(sum)}`;
}
window.removeItem=id=>{const i=cart.findIndex(x=>x.cartId===id);if(i>=0)cart.splice(i,1);renderCart()}

async function loadProducts(){
 try{
  const {data,error}=await db.from('products').select('*').eq('available',true).order('sort_order');
  if(error) throw error;
  if(data?.length) window.PRODUCTS=data.map(p=>({id:p.id,name:p.name,eyebrow:p.eyebrow,description:p.description,
    price:Number(p.price),priceLabel:p.price_label,image:p.image}));
 }catch(e){console.warn("Using local product fallback",e)}
 renderProducts(); renderCart();
}
async function initializeSquare(){
  if(!window.Square) throw new Error("Square payment library did not load.");

  const payments=window.Square.payments(
    SQUARE_APP_ID,
    SQUARE_LOCATION_ID
  );

  squareCard=await payments.card();
  await squareCard.attach("#card-container");
}
form.onsubmit=async e=>{
 e.preventDefault(); success.hidden=false; success.textContent="Submitting your order…";
 if(!cart.length){success.textContent="Please add at least one item to your order.";return}
const fd=new FormData(form);

const orderRequest={
  customer_name:String(fd.get("name")||"").trim(),
  contact:String(fd.get("contact")||"").trim(),
  customization:String(fd.get("customization")||"").trim(),
  fulfillment:String(fd.get("fulfillment")||"Not sure yet").trim(),
  notes:String(fd.get("notes")||"").trim(),
  items:cart.map(p=>({
    product_id:p.id,
    quantity:1
  }))
};

let response;

try{
  response=await fetch(
    "https://izfnihecnckzsxbukpvb.supabase.co/functions/v1/create-order",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(orderRequest)
    }
  );
}catch(err){
  console.error(err);
  success.textContent="We couldn't submit the order. Please try again.";
  return;
}

const o=await response.json();

if(!response.ok || !o.success){
  console.error(o);
  success.textContent=o.error || "We couldn't submit the order. Please try again.";
  return;
}currentOrderId=o.order_id;

success.innerHTML=`Order <strong>${o.order_number}</strong> has been created. Complete your payment securely below.`;

const paymentSection=document.querySelector("#payment-section");
paymentSection.hidden=false;

try{
  if(!squareCard) await initializeSquare();
}catch(err){
  console.error(err);
  document.querySelector("#payment-status").textContent="The payment form could not be loaded. Please refresh and try again.";
}
}; document.querySelector("#card-button").onclick=async()=>{
  const status=document.querySelector("#payment-status");
  const button=document.querySelector("#card-button");

  if(!squareCard || !currentOrderId){
    status.textContent="Payment is not ready yet.";
    return;
  }

  button.disabled=true;
  status.textContent="Processing payment...";

  try{
    const tokenResult=await squareCard.tokenize();

    if(tokenResult.status!=="OK"){
      throw new Error("Card information could not be verified.");
    }

    const response=await fetch(SQUARE_PAYMENT_URL,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        order_id:currentOrderId,
        source_id:tokenResult.token
      })
    });

    const result=await response.json();

    if(!response.ok || !result.success){
      throw new Error(result.error || "Payment could not be completed.");
    }

    status.textContent="Payment successful. Thank you!";

    form.reset();
    cart.splice(0);
    renderCart();

    document.querySelector("#card-button").hidden=true;
  }catch(err){
    console.error(err);
    status.textContent=err.message || "Payment failed. Please try again.";
    button.disabled=false;
  }
};
loadProducts();
