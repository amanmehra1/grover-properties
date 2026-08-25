-- =========================================================
-- GROVER PROPERTIES - DATABASE
-- Karnal, Haryana
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- PROPERTIES
-- =========================================================

create table if not exists public.properties (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    description text not null default '',

    property_type text not null
        check (property_type in ('Residential', 'Commercial', 'Plot', 'Land')),

    listing_type text not null
        check (listing_type in ('Sale', 'Rent')),

    status text not null default 'Available'
        check (status in ('Available', 'Sold', 'Rented')),

    price numeric(14,2) not null default 0,

    location text not null,
    address text not null default '',

    area numeric(12,2),
    area_unit text not null default 'sq.ft',

    bedrooms integer,
    bathrooms integer,

    furnishing text default '',
    parking text default '',

    features text[] default '{}',
    images text[] default '{}',

    featured boolean not null default false,

    owner_name text default '',
    owner_phone text default '',

    created_by uuid references auth.users(id) on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================================
-- SELL PROPERTY ENQUIRIES
-- =========================================================

create table if not exists public.property_enquiries (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    phone text not null,
    email text default '',

    property_type text default '',
    location text default '',
    expected_price text default '',

    message text default '',

    status text not null default 'New'
        check (status in ('New', 'Contacted', 'Closed')),

    created_at timestamptz not null default now()
);

-- =========================================================
-- CONTACT ENQUIRIES
-- =========================================================

create table if not exists public.contact_enquiries (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    phone text not null,
    email text default '',
    message text default '',

    status text not null default 'New'
        check (status in ('New', 'Contacted', 'Closed')),

    created_at timestamptz not null default now()
);

-- =========================================================
-- UPDATED_AT
-- =========================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists properties_updated_at on public.properties;

create trigger properties_updated_at
before update on public.properties
for each row
execute function public.update_updated_at();

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists properties_location_idx
on public.properties(location);

create index if not exists properties_type_idx
on public.properties(property_type);

create index if not exists properties_listing_type_idx
on public.properties(listing_type);

create index if not exists properties_status_idx
on public.properties(status);

create index if not exists properties_featured_idx
on public.properties(featured);

create index if not exists property_enquiries_created_idx
on public.property_enquiries(created_at desc);

create index if not exists contact_enquiries_created_idx
on public.contact_enquiries(created_at desc);

-- =========================================================
-- RLS
-- =========================================================

alter table public.properties enable row level security;
alter table public.property_enquiries enable row level security;
alter table public.contact_enquiries enable row level security;

-- =========================================================
-- PROPERTIES POLICIES
-- =========================================================

drop policy if exists "Public can view available properties"
on public.properties;

create policy "Public can view available properties"
on public.properties
for select
to anon, authenticated
using (
    status = 'Available'
    or auth.role() = 'authenticated'
);

drop policy if exists "Authenticated users can insert properties"
on public.properties;

create policy "Authenticated users can insert properties"
on public.properties
for insert
to authenticated
with check (
    auth.uid() is not null
);

drop policy if exists "Authenticated users can update properties"
on public.properties;

create policy "Authenticated users can update properties"
on public.properties
for update
to authenticated
using (
    auth.uid() is not null
)
with check (
    auth.uid() is not null
);

drop policy if exists "Authenticated users can delete properties"
on public.properties;

create policy "Authenticated users can delete properties"
on public.properties
for delete
to authenticated
using (
    auth.uid() is not null
);

-- =========================================================
-- PROPERTY ENQUIRIES
-- =========================================================

drop policy if exists "Anyone can submit property enquiry"
on public.property_enquiries;

create policy "Anyone can submit property enquiry"
on public.property_enquiries
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated users can view property enquiries"
on public.property_enquiries;

create policy "Authenticated users can view property enquiries"
on public.property_enquiries
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update property enquiries"
on public.property_enquiries;

create policy "Authenticated users can update property enquiries"
on public.property_enquiries
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete property enquiries"
on public.property_enquiries;

create policy "Authenticated users can delete property enquiries"
on public.property_enquiries
for delete
to authenticated
using (true);

-- =========================================================
-- CONTACT ENQUIRIES
-- =========================================================

drop policy if exists "Anyone can submit contact enquiry"
on public.contact_enquiries;

create policy "Anyone can submit contact enquiry"
on public.contact_enquiries
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated users can view contact enquiries"
on public.contact_enquiries;

create policy "Authenticated users can view contact enquiries"
on public.contact_enquiries
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update contact enquiries"
on public.contact_enquiries;

create policy "Authenticated users can update contact enquiries"
on public.contact_enquiries
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete contact enquiries"
on public.contact_enquiries;

create policy "Authenticated users can delete contact enquiries"
on public.contact_enquiries
for delete
to authenticated
using (true);

-- =========================================================
-- GRANTS
-- =========================================================

grant select on public.properties to anon;
grant select, insert, update, delete on public.properties to authenticated;

grant insert on public.property_enquiries to anon;
grant select, insert, update, delete on public.property_enquiries to authenticated;

grant insert on public.contact_enquiries to anon;
grant select, insert, update, delete on public.contact_enquiries to authenticated;

-- =========================================================
-- STORAGE BUCKET
-- =========================================================

insert into storage.buckets
(id, name, public)
values
('property-images', 'property-images', true)
on conflict (id) do update
set public = true;

-- =========================================================
-- STORAGE POLICIES
-- =========================================================

drop policy if exists "Public can view property images"
on storage.objects;

create policy "Public can view property images"
on storage.objects
for select
to public
using (
    bucket_id = 'property-images'
);

drop policy if exists "Authenticated users can upload property images"
on storage.objects;

create policy "Authenticated users can upload property images"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'property-images'
);

drop policy if exists "Authenticated users can update property images"
on storage.objects;

create policy "Authenticated users can update property images"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'property-images'
)
with check (
    bucket_id = 'property-images'
);

drop policy if exists "Authenticated users can delete property images"
on storage.objects;

create policy "Authenticated users can delete property images"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'property-images'
);