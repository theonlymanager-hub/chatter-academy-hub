// OnlyFans API Webhook Endpoint
// Receives notifications when new subscribers join
// Updates weekly_subs table for LTV calculation

import { supabase } from '@/integrations/supabase/client';

// Account ID to dashboard key mapping
const ACCOUNT_ID_MAP: Record<string, string> = {
  'acct_71750a6057e34776b9b6ca0903b5ee1a': 'ashley',
  'acct_6140bb9805e9416a928d4d7a788f3939': 'izzie',
  'acct_f968a6be8f2041dcb9d52f8113f2d258': 'willow',
};

export default async function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    // Log the event for debugging
    console.log('OnlyFans webhook event:', JSON.stringify(event, null, 2));

    // Verify webhook signature if OnlyFansAPI provides one
    // TODO: Add signature verification when available

    // Handle new subscriber event
    if (event.type === 'subscriber.created' || event.type === 'subscription.created') {
      const accountId = event.data?.account_id || event.account_id;
      const accountKey = ACCOUNT_ID_MAP[accountId];

      if (!accountKey) {
        console.warn('Unknown account ID in webhook:', accountId);
        return res.status(200).json({ message: 'Unknown account, ignored' });
      }

      // Call Supabase function to increment weekly sub count
      const { error } = await supabase.rpc('increment_weekly_subs', {
        p_account_id: accountKey,
        p_count: 1,
      });

      if (error) {
        console.error('Failed to increment weekly subs:', error);
        return res.status(500).json({ error: 'Database update failed' });
      }

      console.log(`✅ New sub added for ${accountKey}`);
      return res.status(200).json({ message: 'Subscriber tracked' });
    }

    // Handle other event types if needed
    console.log('Unhandled event type:', event.type);
    return res.status(200).json({ message: 'Event received but not processed' });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
