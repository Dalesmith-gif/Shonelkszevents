
-- ShonellesEZevents initial database setup
create table if not exists public.products (
  id text primary key,
  name text not null,
  eyebrow text default '',
  description text default '',
  price numeric(10,2) not null default 0,
  price_label text default '',
  image text default '',
  available boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can read available products" on public.products;
create policy "Public can read available products"
on public.products for select
using (available = true);

drop policy if exists "Authenticated admins can insert products" on public.products;
create policy "Authenticated admins can insert products"
on public.products for insert to authenticated
with check (true);

drop policy if exists "Authenticated admins can update products" on public.products;
create policy "Authenticated admins can update products"
on public.products for update to authenticated
using (true) with check (true);

drop policy if exists "Authenticated admins can delete products" on public.products;
create policy "Authenticated admins can delete products"
on public.products for delete to authenticated
using (true);

insert into public.products (id,name,eyebrow,description,price,price_label,image,available,sort_order)
values
('pens','Beaded Pens','WRITE IN STYLE','A cheerful handmade touch for desks, planners, gifts, and everyday notes.',10,'Simple Styles $10 · Themed Designs $15','images/pens.jpg',true,1),
('pencils','Beaded Pencils','MAKE YOUR MARK','Playful pencils that bring a little sparkle to school, work, and creative moments.',8,'Simple Styles $8 · Themed Designs $12','images/pencils.jpg',true,2),
('keychains','Key Chains','TAKE IT WITH YOU','Handmade beaded accents for keys, bags, backpacks, and thoughtful gifts.',8,'Designs $8','images/keychains.jpg',true,3),
('clasps','ID Clasps','EVERYDAY ESSENTIAL','A bright, handmade way to personalize an ID badge or lanyard setup.',8,'Designs $8','images/clasps.jpg',true,4),
('other','Other Beaded Items','SOMETHING EXTRA','Breast Cancer, Halloween, Christmas theme pens — do it all.',15,'Themed Designs $15 – $20','images/other.jpg',true,5)
on conflict (id) do update set
 name=excluded.name, eyebrow=excluded.eyebrow, description=excluded.description,
 price=excluded.price, price_label=excluded.price_label, image=excluded.image,
 available=excluded.available, sort_order=excluded.sort_order, updated_at=now();
