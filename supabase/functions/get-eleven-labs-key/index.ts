
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
      const error = new Error('ElevenLabs API key not configured');
      console.error('ElevenLabs API key not found', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the voice configuration from the database
    const { data: voiceData, error: voiceError } = await supabaseClient
      .from('voices')
      .select('agent_id')
      .single();

    if (voiceError || !voiceData) {
      console.error('Error fetching voice data:', voiceError);
      throw new Error('Failed to get voice configuration');
    }

    console.log('Fetching signed URL for agent:', voiceData.agent_id);

    // Get signed URL from ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${voiceData.agent_id}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
        error: errorData,
        url: response.url,
        method: 'GET'
      };
      
      console.error('ElevenLabs API error:', JSON.stringify(errorDetails, null, 2));
      
      return new Response(
        JSON.stringify({
          error: 'ElevenLabs API Error',
          details: errorDetails
        }),
        { 
          status: response.status,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const data = await response.json();
    
    if (!data.signed_url) {
      console.error('No signed URL in response:', data);
      throw new Error('No signed URL returned from ElevenLabs');
    }

    console.log('Successfully received signed URL');
    
    const responseData = {
      signed_url: data.signed_url,
      agent_id: voiceData.agent_id
    };

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
    console.error('Error in get-eleven-labs-key:', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    const errorResponse = {
      error: error.message,
      details: 'Failed to get ElevenLabs signed URL',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      type: error.constructor.name,
      stack: error.stack
    };

    console.error('Function error:', JSON.stringify(errorResponse, null, 2));

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Error-Id': errorResponse.requestId
        },
      },
    );
  }
});
