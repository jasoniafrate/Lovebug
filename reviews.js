/* Reviews feed + modal for romantic-memory-website */
const reviewsKey = 'rmw_reviews_v1';
let reviews = JSON.parse(localStorage.getItem(reviewsKey) || 'null');
if (!reviews) {
  reviews = [];
  localStorage.setItem(reviewsKey, JSON.stringify(reviews));
}

// Optional Supabase initialization: if you create `config.js` with
// `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`, `supabase.js` will
// initialize and `pushReviewToSupabase` will be available.
if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
  try {
    if (typeof initSupabase === 'function') initSupabase();
  } catch (e) {
    console.log('Supabase init not available yet:', e);
  }
}

// No sample reviews — use reviews stored in localStorage or added via Creator

function saveReviews() {
  localStorage.setItem(reviewsKey, JSON.stringify(reviews));
}

function renderReviews() {
  const feed = document.getElementById('reviewsFeed');
  if (!feed) return;
  // sort newest first
  const list = [...reviews].sort((a,b)=> (b.date||'') > (a.date||'') ? 1 : -1);
  feed.innerHTML = '';
  for (const r of list) {
    const card = document.createElement('div');
    card.className = 'review-card';

    // Render image or video thumbnail (YouTube-friendly)
    let media;
    if (r.mediaType === 'video') {
      media = document.createElement('img');
      media.className = 'review-media video-thumb';
      const ytId = getYouTubeId(r.media);
      if (ytId) {
        media.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      } else {
        // fallback to the provided URL
        media.src = r.media;
      }
      media.onclick = () => openModal(r);
    } else {
      media = document.createElement('img');
      media.className = 'review-media';
      media.src = r.media;
      media.alt = r.title || '';
      media.onclick = () => openModal(r);
    }

    const title = document.createElement('div');
    title.className = 'review-title';
    title.innerText = r.title || 'Untitled';

    const text = document.createElement('div');
    text.className = 'review-text';
    text.innerText = r.text || '';

    const meta = document.createElement('div');
    meta.className = 'review-meta';
    meta.appendChild(title);

    const ratingRow = document.createElement('div');
    ratingRow.className = 'rating-row';

    ['down','neutral','up'].forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'rating-btn';
      btn.innerText = k === 'up' ? '👍' : k === 'down' ? '👎' : '😐';
      if (r.rating === k) btn.classList.add('active');
      btn.onclick = () => toggleRating(r.id, k);
      ratingRow.appendChild(btn);
    });

    const date = document.createElement('div');
    date.style.marginLeft = 'auto';
    date.style.fontSize = '0.85rem';
    date.style.color = 'var(--text-gray)';
    date.innerText = r.date || '';

    meta.appendChild(ratingRow);
    meta.appendChild(date);

    card.appendChild(media);
    card.appendChild(meta);
    card.appendChild(text);

    feed.appendChild(card);
  }
}

function toggleRating(id, value) {
  const idx = reviews.findIndex(r=>r.id===id);
  if (idx === -1) return;
  reviews[idx].rating = reviews[idx].rating === value ? null : value;
  saveReviews();
  renderReviews();
}

function openModal(item) {
  const modal = document.getElementById('mediaModal');
  const body = document.getElementById('mediaBody');
  const caption = document.getElementById('mediaCaption');
  body.innerHTML = '';
  caption.innerText = '';
  if (item.mediaType === 'video') {
    const ytId = getYouTubeId(item.media);
    if (ytId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
      iframe.width = '100%';
      iframe.height = '480';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      body.appendChild(iframe);
    } else {
      const v = document.createElement('video');
      v.src = item.media;
      v.controls = true;
      v.autoplay = true;
      body.appendChild(v);
    }
  } else {
    const i = document.createElement('img');
    i.src = item.media;
    i.alt = item.title || '';
    body.appendChild(i);
  }
  caption.innerText = item.title + (item.text ? ' — ' + item.text : '');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

// YouTube helpers
function getYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  // common patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (m && m[1]) return m[1];
  try {
    const u = new URL(url);
    return u.searchParams.get('v');
  } catch (e) {
    return null;
  }
}

function closeModal() {
  const modal = document.getElementById('mediaModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  const body = document.getElementById('mediaBody');
  body.innerHTML = '';
}

// Add a sample review for quick testing
document.addEventListener('DOMContentLoaded', ()=>{
  // Creator form handling: create new post from URL or uploaded file
  const creatorForm = document.getElementById('creatorForm');
  if (creatorForm) {
    creatorForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const title = document.getElementById('postTitle').value.trim();
      const text = document.getElementById('postText').value.trim();
      const url = document.getElementById('postMediaUrl').value.trim();
      const fileInput = document.getElementById('postMediaFile');

      const pushReview = (media, mediaType)=>{
        const item = {
          id: 'p-' + Date.now(),
          title: title || 'Untitled',
          text: text || '',
          media: media || '',
          mediaType: mediaType || (media ? 'image' : null),
          rating: null,
          date: new Date().toISOString().slice(0,10)
        };
        reviews.push(item);
        saveReviews();
        renderReviews();
        // If Supabase sync function is available, push the new review there too
        try {
          if (typeof pushReviewToSupabase === 'function') {
            pushReviewToSupabase({ id: item.id, title: item.title, text: item.text, media: item.media, media_type: item.mediaType, rating: item.rating, date: item.date }).catch(err=>console.error('Supabase push error', err));
          }
        } catch(e) {
          console.log('Supabase push not available', e);
        }
        creatorForm.reset();
      };

      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const f = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(ev){
          const dataUrl = ev.target.result;
          const type = f.type.startsWith('video') ? 'video' : 'image';
          pushReview(dataUrl, type);
        };
        reader.readAsDataURL(f);
      } else if (url) {
        // try to detect media type by extension
        const lower = url.toLowerCase();
        const isVideo = lower.endsWith('.mp4') || lower.includes('youtube') || lower.endsWith('.webm');
        pushReview(url, isVideo ? 'video' : 'image');
      } else {
        // no media, create text-only post
        pushReview('', null);
      }
    });
  }
  // no sample button handler (we use stored reviews)
  renderReviews();
  // close modal when clicking outside content
  const modal = document.getElementById('mediaModal');
  if (modal) modal.addEventListener('click', (e)=>{
    if (e.target.id === 'mediaModal') closeModal();
  });
});
