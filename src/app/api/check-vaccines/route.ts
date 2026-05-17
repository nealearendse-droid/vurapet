import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().slice(0, 10);
    const in7DaysStr = in7Days.toISOString().slice(0, 10);

    const { data: vaccines, error } = await supabase
      .from('vaccinations')
      .select(`
        vaccine_name,
        next_due_date,
        pets (
          name,
          user_id,
          profiles (
            email
          )
        )
      `)
      .gte('next_due_date', todayStr)
      .lte('next_due_date', in7DaysStr);

    if (error) throw error;

    const results = await Promise.all(
      (vaccines || []).map(async (vaccine: any) => {
        const petName = vaccine.pets?.name;
        const ownerEmail = vaccine.pets?.profiles?.email;
        const dueDate = vaccine.next_due_date;
        const vaccineName = vaccine.vaccine_name;

        if (!ownerEmail) return { skipped: true };

        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/send-vaccine-reminder`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ petName, vaccineName, dueDate, ownerEmail }),
          }
        );

        return { petName, vaccineName, dueDate, ownerEmail };
      })
    );

    return Response.json({ success: true, reminders: results });
  } catch (error) {
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}