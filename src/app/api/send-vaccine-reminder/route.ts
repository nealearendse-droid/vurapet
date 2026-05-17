import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { petName, vaccineName, dueDate, ownerEmail } = await req.json();

  try {
    await resend.emails.send({
      from: 'VuraPet <onboarding@resend.dev>',
      to: ownerEmail,
      subject: `🐾 ${petName}'s ${vaccineName} vaccine is due soon!`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #c47a3a;">VuraPet Reminder 🐾</h2>
          <p>Hi there!</p>
          <p>Just a friendly reminder that <strong>${petName}</strong> is due for their <strong>${vaccineName}</strong> vaccine on <strong>${dueDate}</strong>.</p>
          <p>Please book a vet appointment soon!</p>
          <br/>
          <a href="https://vurapet.vercel.app" style="background: #c47a3a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Open VuraPet App
          </a>
          <br/><br/>
          <p style="color: #888; font-size: 12px;">You're receiving this because you use VuraPet to track your pet's health.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}