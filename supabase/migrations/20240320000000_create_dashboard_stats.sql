create or replace function get_dashboard_stats()
returns table (
  total_sessions bigint,
  total_sales bigint,
  total_revenue numeric,
  session_change numeric,
  sales_change numeric,
  revenue_change numeric
)
language plpgsql
security definer
as $$
declare
  today_start timestamp;
  yesterday_start timestamp;
  today_stats record;
  yesterday_stats record;
begin
  today_start := date_trunc('day', now());
  yesterday_start := today_start - interval '1 day';

  -- Get today's stats
  select 
    count(*) as sessions,
    sum(case when end_time is not null then 1 else 0 end) as sales,
    sum(case when end_time is not null then original_price else 0 end) as revenue
  into today_stats
  from sessions
  where start_time >= today_start;

  -- Get yesterday's stats
  select 
    count(*) as sessions,
    sum(case when end_time is not null then 1 else 0 end) as sales,
    sum(case when end_time is not null then original_price else 0 end) as revenue
  into yesterday_stats
  from sessions
  where start_time >= yesterday_start and start_time < today_start;

  -- Calculate changes
  return query
  select 
    today_stats.sessions::bigint as total_sessions,
    today_stats.sales::bigint as total_sales,
    coalesce(today_stats.revenue, 0) as total_revenue,
    case 
      when yesterday_stats.sessions = 0 then 100
      else ((today_stats.sessions - yesterday_stats.sessions)::numeric / yesterday_stats.sessions) * 100
    end as session_change,
    case 
      when yesterday_stats.sales = 0 then 100
      else ((today_stats.sales - yesterday_stats.sales)::numeric / yesterday_stats.sales) * 100
    end as sales_change,
    case 
      when yesterday_stats.revenue = 0 then 100
      else ((today_stats.revenue - yesterday_stats.revenue)::numeric / yesterday_stats.revenue) * 100
    end as revenue_change;
end;
$$; 