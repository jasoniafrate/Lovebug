// Supabase scaffold (optional)
// To enable, create a small `config.js` that sets `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY` and include it before this file.

// Example config.js (DO NOT commit secrets):
// window.SUPABASE_URL = 'https://xyzcompany.supabase.co';
// window.SUPABASE_ANON_KEY = 'public-anon-key';

let supabase = null;

function initSupabase() {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.log('Supabase not configured. Create config.js to enable sync.');
    return;
  }
  // Load supabase client dynamically
  if (!window.supabase) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js';
    s.onload = () => {
      window.supabase = window.supabase || supabase;
      supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      console.log('Supabase initialized');
    };
    document.head.appendChild(s);
  } else {
    supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
}

async function fetchReviewsFromSupabase() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('reviews').select('*').order('date', {ascending: false});
  if (error) { console.error(error); return []; }
  return data;
}

async function pushReviewToSupabase(review) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('reviews').insert([review]);
  if (error) { console.error(error); return null; }
  return data;
}

// Call initSupabase() on pages where you'd like to enable sync. Currently this is optional.
