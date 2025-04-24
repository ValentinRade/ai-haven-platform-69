
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const clientId = Deno.env.get('OFFICE365_CLIENT_ID')
const clientSecret = Deno.env.get('OFFICE365_CLIENT_SECRET')

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

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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

    // Get user data from Microsoft Graph API
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    const userData = await userResponse.json()
    
    if (!userResponse.ok) {
      console.error('User data fetch error:', userData)
      throw new Error(userData.error?.message || 'Failed to fetch user data')
    }

    // Log successful authentication
    console.log('Successfully authenticated user:', userData.userPrincipalName)

    // Return the access token, refresh token and email
    return new Response(JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      email: userData.userPrincipalName || userData.mail
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in office365-token function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
