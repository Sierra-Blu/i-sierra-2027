import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/models/schema';
import { sendTelegramMessage } from '@/lib/telegram';
import { applyRateLimit, publicEndpointLimiter } from '@/lib/server/rate-limit';
import { z } from 'zod';

const LeadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(25).optional().default(''),
  message: z.string().max(2000).optional().default(''),
  locale: z.enum(['en', 'ar']).optional().default('en'),
});

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, publicEndpointLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = LeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, message, locale } = parsed.data;

    // 1. Add to Firestore
    const leadRef = await adminDb.collection(COLLECTIONS.stakeholders).add({
      name,
      email,
      phone,
      message,
      status: 'new',
      phase: 'acquisition',
      priority: 'warm',
      via: 'Website',
      interest: 'General Inquiry',
      capitalAllocation: 'To be determined',
      locale,
      aiProfiling: {
        interests: ['General Inquiry'],
        topMatches: [],
        lastAnalyzedAt: Timestamp.now(),
      },
      automation: {
        followupReminderEnabled: true,
        interactionFrequency: 'medium',
      },
      createdAt: Timestamp.now()
    });

    // 2. Send Telegram Notification
    const text = `
<b>🚀 New Lead - Sierra Estates Realty</b>
<b>Name:</b> ${name}
<b>Email:</b> ${email}
<b>Phone:</b> ${phone}
<b>Interest:</b> General Inquiry
<b>Message:</b> ${message}
<b>Locale:</b> ${locale}
    `.trim();

    await sendTelegramMessage(text);

    return NextResponse.json({ success: true, id: leadRef.id });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
