
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
    
    if (!apiKey) {
      console.error('ElevenLabs API key not found');
      throw new Error('ElevenLabs API key not configured');
    }

    // Using a default public agent if none is specified
    const agentId = 'TGp0ve1q0XQurppvTzrO';

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
    
    if (!data.signed_url) {
      console.error('No signed URL in response:', data);
      throw new Error('No signed URL returned from ElevenLabs');
    }

    console.log('Successfully received signed URL');
    
    const responseData = {
      signed_url: data.signed_url,
      agent_id: agentId
    };

    console.log('Sending response:', responseData);
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      },
    );
  } catch (error) {
    console.error('Error in get-eleven-labs-key:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to get ElevenLabs signed URL'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
