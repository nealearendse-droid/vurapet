# Travel Planner

Pet-scoped travel readiness at `/pets/[id]/travel`.

**Subscription:** Pro and Family plans only. Free users see an upgrade prompt on the travel page and in Quick Actions.

## Database setup

Run the migration in Supabase SQL editor (or via CLI):

```
supabase/migrations/20260526120000_travel_plans.sql
```

This creates `travel_plans` with RLS so users only access their own plans.

## Features

- Origin × destination rules (export authority + import requirements)
- Prefill from pet profile, weight tracker, vaccine records
- Readiness score and gap analysis (rabies, microchip, titre)
- Timeline with optional sync to Vaccine Calendar
- Indicative airline policies with official links
- IATA crate calculator
- Save plan to account + PDF Travel Pack export

## Disclaimer

All output is planning guidance only — not legal or veterinary advice.
