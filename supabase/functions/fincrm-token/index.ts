
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const clientId = Deno.env.get('FINCRM_CLIENT_ID')
const clientSecret = Deno.env.get('FINCRM_CLIENT_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()
    
    // Get the origin for the redirect URI
    const origin = new URL(req.headers.get('origin') || 'http://localhost:5173').origin
    const redirectUri = `${origin}/profile`

    console.log('Exchange code for token with redirect URI:', redirectUri)

    // Exchange authorization code for tokens using the correct API endpoint
    const tokenResponse = await fetch('https://europace.fincrm.de/api/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData)
      throw new Error(tokenData.error_description || 'Failed to exchange token')
    }

    // Log success with access and refresh tokens (masked for security)
    console.log('Successfully obtained tokens, access token length:', tokenData.access_token?.length)
    
    // Extract email from ID token if available
    let email = null
    if (tokenData.id_token) {
      try {
        // ID token is a JWT, we can decode it to get the email
        const [, payload] = tokenData.id_token.split('.')
        const decodedPayload = JSON.parse(atob(payload))
        email = decodedPayload.email || decodedPayload.preferred_username
        console.log('Email extracted from ID token:', email)
      } catch (error) {
        console.error('Failed to decode ID token:', error)
      }
    }
    
    // If email not found in ID token, try to get it from FinCRM API
    if (!email) {
      try {
        const userResponse = await fetch('https://europace.fincrm.de/api/v1/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          email = userData.email
          console.log('Email fetched from FinCRM API:', email)
        } else {
          const errorData = await userResponse.json()
          console.error('FinCRM API error:', errorData)
          // Continue even if API fails, we still have the tokens
        }
      } catch (graphError) {
        console.error('Failed to fetch user data from FinCRM:', graphError)
        // Continue execution, we still have the tokens
      }
    }

    // Return the access token, refresh token and email
    return new Response(JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      email: email
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in fincrm-token function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
