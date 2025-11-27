import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Apple's JWKS endpoint
const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';

// Cache for Apple's public keys
let cachedKeys: jose.JWTVerifyGetKey | null = null;
let keysLastFetched = 0;
const KEYS_CACHE_DURATION = 3600000; // 1 hour

async function getApplePublicKeys(): Promise<jose.JWTVerifyGetKey> {
  const now = Date.now();
  
  if (cachedKeys && (now - keysLastFetched) < KEYS_CACHE_DURATION) {
    return cachedKeys;
  }
  
  console.log('Fetching Apple public keys from JWKS endpoint...');
  const jwks = jose.createRemoteJWKSet(new URL(APPLE_JWKS_URL));
  cachedKeys = jwks;
  keysLastFetched = now;
  
  return jwks;
}

interface AppleTokenPayload {
  iss: string;
  sub: string; // Apple user ID
  aud: string;
  iat: number;
  exp: number;
  nonce?: string;
  nonce_supported?: boolean;
  email?: string;
  email_verified?: string | boolean;
  is_private_email?: string | boolean;
  real_user_status?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idToken, nonce, fullName } = await req.json();

    if (!idToken) {
      console.error('Missing idToken in request');
      return new Response(
        JSON.stringify({ error: 'Missing idToken' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received Apple auth request');
    console.log('Nonce provided:', !!nonce);
    console.log('Full name provided:', !!fullName);

    // Get Apple's public keys
    const publicKeys = await getApplePublicKeys();

    // Verify the token
    let payload: AppleTokenPayload;
    try {
      const { payload: verifiedPayload } = await jose.jwtVerify(idToken, publicKeys, {
        issuer: 'https://appleid.apple.com',
        audience: 'com.cookmate.kitchen',
      });
      payload = verifiedPayload as AppleTokenPayload;
      console.log('Token verified successfully');
      console.log('Apple user ID (sub):', payload.sub);
      console.log('Email:', payload.email);
    } catch (verifyError: unknown) {
      console.error('Token verification failed:', verifyError);
      const errorMessage = verifyError instanceof Error ? verifyError.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: errorMessage }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify nonce if provided
    if (nonce && payload.nonce && payload.nonce !== nonce) {
      console.error('Nonce mismatch');
      return new Response(
        JSON.stringify({ error: 'Nonce mismatch' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    const appleUserId = payload.sub;
    const email = payload.email;

    // Try to find existing user by Apple ID in user metadata
    console.log('Looking for existing user with Apple ID:', appleUserId);
    
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }

    let user = existingUsers.users.find(u => 
      u.app_metadata?.provider === 'apple' && 
      u.app_metadata?.providers?.includes('apple') &&
      (u.user_metadata?.apple_user_id === appleUserId || u.identities?.some(i => i.provider === 'apple' && i.id === appleUserId))
    );

    // If not found by Apple ID, try by email
    if (!user && email) {
      console.log('User not found by Apple ID, searching by email:', email);
      user = existingUsers.users.find(u => u.email === email);
    }

    if (user) {
      console.log('Found existing user:', user.id);
      
      // Update user metadata to ensure Apple ID is stored
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          apple_user_id: appleUserId,
          full_name: fullName || user.user_metadata?.full_name,
        },
        app_metadata: {
          ...user.app_metadata,
          provider: 'apple',
          providers: [...new Set([...(user.app_metadata?.providers || []), 'apple'])],
        }
      });
    } else {
      // Create new user
      console.log('Creating new user for Apple ID:', appleUserId);
      
      const userEmail = email || `apple_${appleUserId}@privaterelay.appleid.com`;
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          apple_user_id: appleUserId,
          full_name: fullName,
          provider: 'apple',
        },
        app_metadata: {
          provider: 'apple',
          providers: ['apple'],
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      user = newUser.user;
      console.log('Created new user:', user.id);
    }

    // Generate a session for the user
    // We'll use a custom approach: generate tokens directly
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
      options: {
        redirectTo: 'https://gsozaqboqcjbthbighqg.supabase.co'
      }
    });

    if (sessionError) {
      console.error('Error generating magic link:', sessionError);
      throw sessionError;
    }

    // Extract the token from the magic link
    const magicLinkUrl = new URL(sessionData.properties.hashed_token ? 
      `https://gsozaqboqcjbthbighqg.supabase.co/auth/v1/verify?token=${sessionData.properties.hashed_token}&type=magiclink` : 
      sessionData.properties.action_link);
    
    console.log('Generated magic link for user');

    // Instead of magic link, let's create a proper session
    // We need to sign in as the user to get tokens
    // Since we can't do that with admin API, we'll return info for client to use
    
    // Alternative: Use the admin API to create a session directly
    // This requires creating custom tokens
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
        // Return the magic link token for the client to verify
        verification: {
          type: 'magiclink',
          email: user.email,
          hashed_token: sessionData.properties.hashed_token,
          action_link: sessionData.properties.action_link,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Apple auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Authentication failed', 
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
