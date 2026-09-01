/* Reviews feed + modal for romantic-memory-website */
const reviewsKey = 'rmw_reviews_v1';
let reviews = JSON.parse(localStorage.getItem(reviewsKey) || 'null');
if (!reviews) {
  reviews = [];
  localStorage.setItem(reviewsKey, JSON.stringify(reviews));
}

const sampleReviews = [
  {
    id: 'r1',
    title: 'Corner Coffee Shop',
    text: 'Great espresso, warm vibe. Highly recommended! 🎉',
    media: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1200&auto=format&fit=crop',
    mediaType: 'image',
    rating: null,
    date: '2023-08-10'
  },
  {
    id: 'r2',
    title: 'Late Night Nasi Goreng',
    text: 'Portion and flavor were perfect — great late-night dinner.',
    media: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mediaType: 'video',
    rating: null,
    date: '2023-11-02'
  }
];

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

    const media = document.createElement(r.mediaType === 'video' ? 'video' : 'img');
    media.className = 'review-media';
    if (r.mediaType === 'video') {
      media.src = r.media;
      media.controls = false;
      media.setAttribute('playsinline','');
    } else {
      media.src = r.media;
      media.alt = r.title || '';
    }
    media.onclick = () => openModal(r);

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
    const v = document.createElement('video');
    v.src = item.media;
    v.controls = true;
    v.autoplay = true;
    body.appendChild(v);
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
  const addBtn = document.getElementById('addSampleReview');
  if (addBtn) addBtn.onclick = () => {
    // push a sample review then render
    reviews = reviews.concat(sampleReviews.map(s=> ({...s, id: s.id + '-' + Date.now()})));
    saveReviews();
    renderReviews();
  };
  renderReviews();
  // close modal when clicking outside content
  const modal = document.getElementById('mediaModal');
  if (modal) modal.addEventListener('click', (e)=>{
    if (e.target.id === 'mediaModal') closeModal();
  });
});
