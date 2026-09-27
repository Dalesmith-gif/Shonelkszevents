
const cart=[], grid=document.querySelector("#productGrid"), orderItems=document.querySelector("#orderItems"),
selected=document.querySelector("#selectedItems"), total=document.querySelector("#total"),
form=document.querySelector("#orderForm"), success=document.querySelector("#success");
const db=window.supabase.createClient(SEZ_CONFIG.supabaseUrl,SEZ_CONFIG.supabaseAnonKey);
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);

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

form.onsubmit=async e=>{
 e.preventDefault(); success.hidden=false; success.textContent="Submitting your order…";
 if(!cart.length){success.textContent="Please add at least one item to your order.";return}
 const fd=new FormData(form), sum=cart.reduce((a,p)=>a+Number(p.price||0),0);
 const order={
  customer_name:String(fd.get("name")||"").trim(),
  contact:String(fd.get("contact")||"").trim(),
  customization:String(fd.get("customization")||"").trim(),
  fulfillment:String(fd.get("fulfillment")||"Not sure yet"),
  notes:String(fd.get("notes")||"").trim(),
  estimated_total:sum
 };
 const {data:o,error}=await db.from("orders").insert(order).select("id,order_number").single();
 if(error){success.textContent="We couldn't submit the order. Please try again.";console.error(error);return}
 const items=cart.map(p=>({order_id:o.id,product_id:p.id,product_name:p.name,unit_price:Number(p.price||0),quantity:1}));
 const {error:itemErr}=await db.from("order_items").insert(items);
 if(itemErr){success.textContent=`Order ${o.order_number} was created, but item details need attention. Please contact us.`;console.error(itemErr);return}
 success.innerHTML=`Thank you! <strong>${o.order_number}</strong> has been received. We will confirm customization, final pricing and payment next.`;
 form.reset(); cart.splice(0); renderCart();
};
loadProducts();
