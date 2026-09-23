const STORAGE_KEY = 'brave-blog-posts-v1';

const defaultPosts = [
  {
    id: 'seed-1',
    title: 'Membangun ritme tulisan yang lebih manusiawi dengan AI',
    author: 'Kang Brave',
    category: 'Produktivitas',
    tags: ['ai', 'writing', 'produk'],
    excerpt: 'AI bukan untuk mengganti ide, tapi untuk mempercepat proses berpikir agar tulisan terasa lebih tajam dan lebih hidup.',
    content: 'AI bisa membantu menyusun kerangka, memperjelas pesan, dan mengecek tone agar artikel lebih mudah dipahami. Kuncinya adalah tetap memegang suara manusia sebagai inti cerita.\n\nSaat proses menulis lebih cepat, kita punya ruang untuk berpikir lebih dalam, memilih sudut pandang yang tepat, dan menambahkan rasa yang membuat pembaca betah membaca.',
    createdAt: '2026-09-12T08:00:00.000Z',
    cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    media: [
      { id: 'm-seed-1', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', name: 'writing-process.jpg' }
    ]
  },
  {
    id: 'seed-2',
    title: 'Desain blog modern yang terasa lebih hidup di setiap layar',
    author: 'Brave Studio',
    category: 'Design',
    tags: ['ui', 'blog', 'design'],
    excerpt: 'Tampilan blog yang responsif bukan sekadar estetika, tetapi cara menjaga pengalaman membaca tetap nyaman di perangkat apapun.',
    content: 'Ketika perangkat makin beragam, blog perlu memiliki sistem jenis, ruang, kontras, dan ritme visual yang kuat. Hal ini membuat sebuah artikel terasa lebih nyaman dibaca, tanpa mengorbankan keindahan.\n\nElemen yang kuat seperti grid, warna, ruang kosong, dan animasi halus dapat membuat konten lebih mudah ditangkap oleh pembaca.',
    createdAt: '2026-09-18T10:30:00.000Z',
    cover: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    media: [
      { id: 'm-seed-2', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', name: 'design-layout.jpg' }
    ]
  },
  {
    id: 'seed-3',
    title: 'Kenapa media publik perlu tampil rapi dan gampang diakses',
    author: 'Admin',
    category: 'Publikasi',
    tags: ['media', 'publik', 'sharing'],
    excerpt: 'Media yang ditampilkan dengan jelas akan memperkuat cerita dan membuat artikel terasa lebih kredibel di mata pengunjung.',
    content: 'Keterbacaan bukan hanya soal teks. Gambar, video, dan kebutuhan audio juga ikut membentuk pemahaman. Kualitas penyajian media publik yang rapi membuat setiap artikel terasa lebih utuh.\n\nSemua pengunjung bisa mengikuti alur cerita dengan lebih santai, tanpa hambatan teknis.',
    createdAt: '2026-09-20T15:45:00.000Z',
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    media: [
      { id: 'm-seed-3', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', name: 'public-media.jpg' }
    ]
  }
];

const state = {
  posts: loadPosts(),
  mediaDraft: [],
  editingId: null
};

const elements = {
  postCountStat: document.getElementById('postCountStat'),
  mediaCountStat: document.getElementById('mediaCountStat'),
  postList: document.getElementById('postList'),
  mediaList: document.getElementById('mediaList'),
  featuredRow: document.getElementById('featuredRow'),
  searchInput: document.getElementById('searchInput'),
  postForm: document.getElementById('postForm'),
  mediaInput: document.getElementById('mediaInput'),
  mediaPreview: document.getElementById('mediaPreview'),
  toast: document.getElementById('toast'),
  adminPanel: document.getElementById('admin'),
  adminPostList: document.getElementById('adminPostList'),
  titleInput: document.getElementById('titleInput'),
  authorInput: document.getElementById('authorInput'),
  categoryInput: document.getElementById('categoryInput'),
  tagsInput: document.getElementById('tagsInput'),
  excerptInput: document.getElementById('excerptInput'),
  contentInput: document.getElementById('contentInput'),
  articleModal: document.getElementById('articleModal'),
  modalBody: document.getElementById('modalBody')
};

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...defaultPosts];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultPosts];
  } catch (error) {
    return [...defaultPosts];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2200);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function buildTags(tags) {
  if (!Array.isArray(tags) || !tags.length) return ['blog'];
  return tags.slice(0, 3);
}

function getMediaSummary(post) {
  return Array.isArray(post.media) ? post.media : [];
}

function getCover(post) {
  if (post.cover) return post.cover;
  const media = getMediaSummary(post);
  if (media.length) return media[0].url;
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';
}

function renderFeatured() {
  const featured = state.posts.slice(0, 3);
  elements.featuredRow.innerHTML = featured.map((post) => `
    <article class="feature-card">
      <div class="kicker">${escapeHtml(post.category || 'Blog')}</div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt || post.content.slice(0, 110))}</p>
    </article>
  `).join('');
}

function renderPosts() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const visiblePosts = state.posts.filter((post) => {
    const text = `${post.title} ${post.author} ${post.category} ${(post.tags || []).join(' ')} ${post.content}`.toLowerCase();
    return text.includes(query);
  });

  elements.postList.innerHTML = visiblePosts.length
    ? visiblePosts.map((post) => {
        const media = getMediaSummary(post);
        const firstMedia = media[0];
        const preview = firstMedia && firstMedia.type.startsWith('video/')
          ? `<video src="${firstMedia.url}" controls playsinline></video>`
          : `<img src="${getCover(post)}" alt="${escapeHtml(post.title)}" loading="lazy" />`;

        return `
          <article class="post-card">
            <div class="post-cover">${preview}</div>
            <div class="post-body">
              <div class="post-meta">
                <span>${escapeHtml(post.category || 'General')}</span>
                <span>${formatDate(post.createdAt)}</span>
              </div>

              <div class="tag-list">
                ${buildTags(post.tags).map((tag) => `<span class="tag-pill">#${escapeHtml(tag)}</span>`).join('')}
              </div>

              <h3>${escapeHtml(post.title)}</h3>
              <p>${escapeHtml(post.excerpt || post.content.slice(0, 140))}</p>

              <div class="post-footer">
                <span class="author-pill">${escapeHtml(post.author || 'Admin')}</span>
                <button class="row-action" type="button" data-action="open" data-id="${post.id}">Baca</button>
              </div>
            </div>
          </article>
        `;
      }).join('')
    : '<div class="empty-state">Belum ada artikel yang cocok dengan pencarian Anda.</div>';

  elements.postCountStat.textContent = String(state.posts.length);
}

function renderMedia() {
  const allMedia = state.posts.flatMap((post) => getMediaSummary(post).map((media) => ({ ...media, postTitle: post.title, postAuthor: post.author })));
  const visibleMedia = allMedia.slice(0, 6);

  elements.mediaList.innerHTML = visibleMedia.length
    ? visibleMedia.map((item) => {
        const isVideo = item.type && item.type.startsWith('video/');
        const preview = isVideo ? `<video src="${item.url}" controls playsinline></video>` : `<img src="${item.url}" alt="${escapeHtml(item.postTitle)}" loading="lazy" />`;
        return `
          <div class="media-item">
            <div class="media-item-thumb">${preview}</div>
            <div>
              <strong>${escapeHtml(item.postTitle || 'Media publik')}</strong>
              <span>${escapeHtml(item.postAuthor || 'Admin')}</span>
            </div>
          </div>
        `;
      }).join('')
    : '<div class="empty-state">Belum ada media yang dipublikasikan.</div>';

  elements.mediaCountStat.textContent = String(allMedia.length);
}

function renderDraftPreview() {
  if (!state.mediaDraft.length) {
    elements.mediaPreview.innerHTML = '';
    return;
  }

  elements.mediaPreview.innerHTML = state.mediaDraft.map((item) => {
    const kind = item.type.startsWith('video/') ? 'VIDEO' : item.type.startsWith('audio/') ? 'AUDIO' : 'IMAGE';
    const preview = item.type.startsWith('video/')
      ? `<video src="${item.url}" controls playsinline></video>`
      : item.type.startsWith('audio/')
        ? `<audio src="${item.url}" controls></audio>`
        : `<img src="${item.url}" alt="${escapeHtml(item.name)}" />`;

    return `
      <div class="preview-item">
        <div class="preview-chip">${kind}</div>
        ${preview}
      </div>
    `;
  }).join('');
}

function renderAdminList() {
  elements.adminPostList.innerHTML = state.posts.map((post) => `
    <div class="admin-row">
      <div>
        <strong>${escapeHtml(post.title)}</strong>
        <small>${formatDate(post.createdAt)}</small>
      </div>
      <div class="row-actions">
        <button class="row-action" type="button" data-action="edit" data-id="${post.id}">Edit</button>
        <button class="row-action delete" type="button" data-action="delete" data-id="${post.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

async function handleMediaSelected(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const nextMedia = [];

  for (const file of files) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      showToast('Format media tidak didukung. Gunakan gambar, video, atau audio.');
      continue;
    }

    const base64 = await readFileAsDataUrl(file);
    nextMedia.push({ id: crypto.randomUUID(), name: file.name, type: file.type, url: base64 });
  }

  state.mediaDraft = [...state.mediaDraft, ...nextMedia];
  renderDraftPreview();
  event.target.value = '';
}

function resetDraft() {
  state.mediaDraft = [];
  state.editingId = null;
  elements.postForm.reset();
  elements.authorInput.value = 'Admin';
  renderDraftPreview();
}

function populateForm(post) {
  state.editingId = post.id;
  elements.titleInput.value = post.title || '';
  elements.authorInput.value = post.author || 'Admin';
  elements.categoryInput.value = post.category || '';
  elements.tagsInput.value = (post.tags || []).join(', ');
  elements.excerptInput.value = post.excerpt || '';
  elements.contentInput.value = post.content || '';
  state.mediaDraft = Array.isArray(post.media) ? post.media.map((item) => ({ ...item })) : [];
  renderDraftPreview();
  toggleAdminPanel(true);
}

function openArticle(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;

  const media = getMediaSummary(post);
  const mainMedia = media.find((item) => item.type.startsWith('image/') || item.type.startsWith('video/'));
  const preview = mainMedia && mainMedia.type.startsWith('video/')
    ? `<video src="${mainMedia.url}" controls playsinline></video>`
    : mainMedia
      ? `<img src="${mainMedia.url}" alt="${escapeHtml(post.title)}" />`
      : '';

  const attachments = media.length
    ? media.map((item) => `
        <a class="modal-attachment" href="${item.url}" target="_blank" rel="noopener noreferrer">
          <span>${item.type.startsWith('video/') ? 'V' : item.type.startsWith('audio/') ? 'A' : 'I'}</span>
          <div>
            <strong>${escapeHtml(item.name || 'Media publik')}</strong>
            <small>${escapeHtml(item.type || 'file')}</small>
          </div>
        </a>
      `).join('')
    : '';

  elements.modalBody.innerHTML = `
    <div class="modal-header">
      <p class="eyebrow">Story / Publication</p>
      <h2 id="modalTitle">${escapeHtml(post.title)}</h2>
      <div class="modal-meta">${escapeHtml(post.author || 'Admin')} · ${formatDate(post.createdAt)} · ${escapeHtml(post.category || 'Umum')}</div>
    </div>
    <div class="modal-body">
      ${preview ? preview : ''}
      <div class="tag-list">
        ${buildTags(post.tags).map((tag) => `<span class="tag-pill">#${escapeHtml(tag)}</span>`).join('')}
      </div>
      <div class="modal-copy">${escapeHtml(post.content || '').replace(/\n/g, '<br>')}</div>
      ${attachments ? `<div class="modal-attachments">${attachments}</div>` : ''}
    </div>
  `;

  elements.articleModal.classList.remove('hidden');
  elements.articleModal.setAttribute('aria-hidden', 'false');
}

function closeArticle() {
  elements.articleModal.classList.add('hidden');
  elements.articleModal.setAttribute('aria-hidden', 'true');
}

function handleActionClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;

  if (action === 'open') {
    openArticle(id);
    return;
  }

  if (action === 'edit') {
    const post = state.posts.find((item) => item.id === id);
    if (post) populateForm(post);
    return;
  }

  if (action === 'delete') {
    const post = state.posts.find((item) => item.id === id);
    if (!post) return;
    const confirmed = window.confirm(`Hapus "${post.title}"?`);
    if (!confirmed) return;

    state.posts = state.posts.filter((item) => item.id !== id);
    savePosts();
    renderAll();
    showToast('Artikel berhasil dihapus.');
  }
}

function renderAll() {
  renderFeatured();
  renderPosts();
  renderMedia();
  renderAdminList();
}

function publishPost(event) {
  event.preventDefault();

  const title = elements.titleInput.value.trim();
  const author = elements.authorInput.value.trim() || 'Admin';
  const category = elements.categoryInput.value.trim() || 'Umum';
  const tags = (elements.tagsInput.value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const excerpt = elements.excerptInput.value.trim();
  const content = elements.contentInput.value.trim();

  if (!title || !content) {
    showToast('Judul dan konten artikel wajib diisi.');
    return;
  }

  const coverMedia = state.mediaDraft.find((item) => item.type.startsWith('image/')) || state.mediaDraft[0];

  const payload = {
    id: state.editingId || crypto.randomUUID(),
    title,
    author,
    category,
    tags: tags.length ? tags : ['blog'],
    excerpt: excerpt || content.slice(0, 140),
    content,
    createdAt: state.editingId ? (state.posts.find((p) => p.id === state.editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    cover: coverMedia ? coverMedia.url : getCover(defaultPosts[0]),
    media: state.mediaDraft.length ? state.mediaDraft : []
  };

  if (state.editingId) {
    state.posts = state.posts.map((post) => (post.id === state.editingId ? payload : post));
    showToast('Artikel berhasil diperbarui.');
  } else {
    state.posts = [payload, ...state.posts];
    showToast('Artikel berhasil dipublikasikan.');
  }

  savePosts();
  renderAll();
  resetDraft();
  elements.adminPanel.classList.add('hidden');
}

function toggleAdminPanel(forceOpen) {
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : elements.adminPanel.classList.contains('hidden');
  elements.adminPanel.classList.toggle('hidden', !shouldOpen);
}

function animateTheme() {
  let hue = 222;
  const root = document.documentElement;

  setInterval(() => {
    hue = (hue + 1.2) % 360;
    root.style.setProperty('--hue', String(hue));
  }, 2800);
}

function init() {
  renderAll();
  resetDraft();

  elements.searchInput.addEventListener('input', renderPosts);
  elements.mediaInput.addEventListener('change', handleMediaSelected);
  elements.postForm.addEventListener('submit', publishPost);
  document.getElementById('openAdminBtn').addEventListener('click', () => toggleAdminPanel());
  document.getElementById('openAdminSecondary').addEventListener('click', () => toggleAdminPanel());
  document.getElementById('closeAdminBtn').addEventListener('click', () => toggleAdminPanel(false));
  document.getElementById('resetFormBtn').addEventListener('click', resetDraft);
  document.getElementById('closeModalBtn').addEventListener('click', closeArticle);
  document.querySelector('.modal-backdrop').addEventListener('click', (event) => {
    if (event.target.dataset.close === 'true') closeArticle();
  });
  document.body.addEventListener('click', handleActionClick);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const current = Number(root.style.getPropertyValue('--hue') || 222);
    root.style.setProperty('--hue', String((current + 60) % 360));
    showToast('Tema AI diperbarui.');
  });

  animateTheme();
  showToast('Blog siap digunakan.');
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !elements.articleModal.classList.contains('hidden')) {
    closeArticle();
  }
  if (event.key === 'Escape' && !elements.adminPanel.classList.contains('hidden')) {
    toggleAdminPanel(false);
  }
});

window.addEventListener('storage', () => {
  state.posts = loadPosts();
  renderAll();
});

init();

