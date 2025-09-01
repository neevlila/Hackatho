# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the EduScheduler application.

## Prerequisites

- A Google Cloud Console account
- A Supabase project
- Basic knowledge of OAuth 2.0

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add your authorized redirect URIs:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
8. Note down your Client ID and Client Secret

## Step 2: Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Providers"
3. Find "Google" in the list and click "Edit"
4. Enable Google authentication
5. Enter your Google Client ID and Client Secret
6. Add your redirect URLs to the Supabase configuration
7. Save the changes

## Step 3: Update Environment Variables

Add these environment variables to your `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Step 4: Update Google Auth Service

Replace the placeholder implementation in `src/services/googleAuth.ts` with actual Supabase OAuth:

```typescript
import { supabase } from '../lib/supabase';

export const googleAuth = {
  signIn: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) throw error;
    return data;
  }
};
```

## Step 5: Test the Integration

1. Start your development server
2. Go to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your dashboard

## Troubleshooting

### Common Issues

1. **Redirect URI mismatch**: Ensure the redirect URIs in Google Cloud Console match exactly with your Supabase configuration
2. **CORS errors**: Make sure your domain is properly configured in both Google and Supabase
3. **Invalid client ID**: Double-check that you're using the correct Client ID from Google Cloud Console

### Debug Mode

Enable debug mode in your Supabase client to see detailed authentication logs:

```typescript
const supabase = createClient(url, anonKey, {
  auth: {
    debug: true
  }
});
```

## Security Considerations

1. Never expose your Client Secret in client-side code
2. Use environment variables for sensitive configuration
3. Implement proper error handling for authentication failures
4. Consider implementing additional security measures like 2FA

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/rfc6819)

## Support

If you encounter issues during setup, please check:
1. The Supabase community forum
2. Google Cloud Console documentation
3. Your browser's developer console for error messages
