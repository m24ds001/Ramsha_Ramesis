-- Create a function to notify on analytics changes
CREATE OR REPLACE FUNCTION notify_analytics_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'analytics_update',
    json_build_object(
      'operation', TG_OP,
      'record', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the user_events table
CREATE TRIGGER analytics_events_change_trigger
AFTER INSERT OR UPDATE ON user_events
FOR EACH ROW EXECUTE FUNCTION notify_analytics_change();

-- Create a trigger on the website_visits table
CREATE TRIGGER analytics_visits_change_trigger
AFTER INSERT OR UPDATE ON website_visits
FOR EACH ROW EXECUTE FUNCTION notify_analytics_change();

-- Create a listener setup in Node.js
/*
// Example Node.js code to listen for these notifications:
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create a dedicated client for listening
const client = await pool.connect();

// Listen for notifications
await client.query('LISTEN analytics_update');

// Handle notifications
client.on('notification', (msg) => {
  try {
    const payload = JSON.parse(msg.payload);
    console.log('Database notification:', payload);
    
    // Broadcast to WebSocket clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'DB_UPDATE',
          data: payload
        }));
      }
    });
  } catch (error) {
    console.error('Error processing notification:', error);
  }
});
*/