// pages/api/download.js
import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  // Check if the user is authenticated
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Define the file path in Supabase Storage
  const filePath = 'downloads/dist.zip';

  // Generate a signed URL for the file (expires in 60 minutes)
  const { signedURL, error } = await supabase
    .storage
    .from('downloads')
    .createSignedUrl(filePath, 60 * 60); // 60 minutes expiry

  if (error) {
    return res.status(500).json({ error: 'Could not generate download link' });
  }

  // Redirect the user to the signed URL for downloading
  res.redirect(signedURL);
}
