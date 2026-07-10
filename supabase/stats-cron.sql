-- ─── Stats aggregation cron ───────────────────────────────────────────────────
-- Schedule this via Supabase pg_cron (or a Supabase Edge Function on a cron trigger).
-- Run every 5 minutes: '*/5 * * * *'
--
-- Enable pg_cron: Dashboard → Database → Extensions → pg_cron

select cron.schedule(
  'update-sale-stats',
  '*/5 * * * *',
  $$
    update public.sale_stats
    set
      total_claimed_evm = (
        select count(*) from public.claims where chain = 'evm'
      ),
      total_claimed_solana = (
        select count(*) from public.claims where chain = 'solana'
      ),
      total_raised_eth = (
        select coalesce(
          sum(payment_amount::numeric), 0
        )::text
        from public.claims
        where chain = 'evm'
      ),
      total_raised_sol = (
        select coalesce(
          sum(payment_amount::numeric), 0
        )::text
        from public.claims
        where chain = 'solana'
      ),
      updated_at = now()
    where id = 1;
  $$
);
