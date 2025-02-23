
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const agentId = Deno.env.get('ELEVENLABS_AGENT_ID') || 'TGp0ve1q0XQurppvTzrO';  // Default to public agent if none set

    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    console.log('Fetching signed URL for agent:', agentId);

    // Get signed URL from ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('ElevenLabs API error:', error);
      throw new Error(error.detail || 'Failed to get signed URL');
    }

    const data = await response.json();
    console.log('Received signed URL and agent ID:', { signed_url: data.signed_url, agent_id: agentId });
    
    return new Response(
      JSON.stringify({ 
        signed_url: data.signed_url,
        agent_id: agentId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    );
  } catch (error) {
    console.error('Error in get-eleven-labs-key:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
