-- Grant privileges to the service_role for Stripe sync tables
GRANT ALL ON TABLE public.products TO service_role;
GRANT ALL ON TABLE public.prices TO service_role;
GRANT ALL ON TABLE public.subscriptions TO service_role;
GRANT ALL ON TABLE public.customers TO service_role;
GRANT ALL ON TABLE public.users TO service_role;

-- Make sure authenticated and anon can read the products and prices
GRANT SELECT ON TABLE public.products TO authenticated, anon;
GRANT SELECT ON TABLE public.prices TO authenticated, anon;
