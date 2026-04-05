const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const webhook = JSON.parse(event.body);
  
  try {
    // Store raw event
    await supabase.from('of_events').insert({
      event_type: webhook.event_type,
      account_id: webhook.account_id,
      data: webhook.data,
      received_at: new Date().toISOString()
    });

    // Process events
    switch(webhook.event_type) {
      case 'subscriptions.new':
        await supabase.from('subscriptions').insert({
          subscriber_id: webhook.data.subscriber_id,
          username: webhook.data.username,
          account_id: webhook.account_id,
          price: webhook.data.price,
          subscribed_at: new Date().toISOString()
        });
        break;
        
      case 'messages.ppv.unlocked':
        await supabase.from('ppv_sales').insert({
          user_id: webhook.data.user_id,
          account_id: webhook.account_id,
          amount: webhook.data.amount,
          message_id: webhook.data.message_id,
          unlocked_at: new Date().toISOString()
        });
        break;
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: err.message };
  }
};
