const STORAGE_KEY = 'brave-blog-posts-v1';
const fallbackCover = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

const defaults = [
  { id: 'seed-1', title: 'Membangun ritme tulisan yang lebih manusiawi dengan AI', author: 'Kang Brave', category: 'Produktivitas', tags: ['ai', 'writing', 'produk'], excerpt: 'AI mempercepat proses berpikir tanpa menggantikan suara manusia.', content: 'AI dapat membantu membuat kerangka, memperjelas pesan, dan mengecek tone. Namun, suara manusia tetap menjadi inti cerita.\n\nGunakan teknologi untuk memberi ruang bagi ide yang lebih dalam.', createdAt: '2026-09-12T08:00:00.000Z', cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', media: [{ id: 'media-1', name: 'writing-process.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80' }] },
  { id: 'seed-2', title: 'Desain blog modern yang terasa hidup di setiap layar', author: 'Brave Studio', category: 'Design', tags: ['ui', 'blog', 'design'], excerpt: 'Responsif adalah cara menjaga pengalaman membaca tetap nyaman.', content: 'Sistem tipografi, ruang, kontras, dan ritme visual membuat artikel terasa lebih nyaman dibaca di perangkat apa pun.', createdAt: '2026-09-18T10:30:00.000Z', cover: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', media: [{ id: 'media-2', name: 'design-layout.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80' }] },
  { id: 'seed-3', title: 'Kenapa media publik perlu tampil rapi dan mudah diakses', author: 'Admin', category: 'Publikasi', tags: ['media', 'publik', 'sharing'], excerpt: 'Media yang jelas memperkuat cerita dan kredibilitas artikel.', content: 'Gambar, video, dan audio ikut membentuk pemahaman. Penyajian media publik yang rapi membuat setiap artikel terasa lebih utuh.', createdAt: '2026-09-20T15:45:00.000Z', cover: fallbackCover, media: [{ id: 'media-3', name: 'public-media.jpg', type: 'image/jpeg', url: fallbackCover }] }
];

const $ = (id) => document.getElementById(id);
const els = { posts: $('postList'), media: $('mediaList'), featured: $('featuredRow'), adminList: $('adminPostList'), form: $('postForm'), search: $('searchInput'), upload: $('mediaInput'), preview: $('mediaPreview'), admin: $('admin'), modal: $('articleModal'), modalBody: $('modalBody'), toast: $('toast'), title: $('titleInput'), author: $('authorInput'), category: $('categoryInput'), tags: $('tagsInput'), excerpt: $('excerptInput'), content: $('contentInput') };
const state = { posts: load(), draftMedia: [], editing: null };

function load() { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(value) && value.length ? value : [...defaults]; } catch { return [...defaults]; } }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts)); }
function escape(value) { return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function date(value) { return new Date(value).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); }
function tags(post) { return Array.isArray(post.tags) && post.tags.length ? post.tags.slice(0, 4) : ['blog']; }
function media(post) { return Array.isArray(post.media) ? post.media : []; }
function cover(post) { return post.cover || media(post)[0]?.url || fallbackCover; }
function toast(message) { els.toast.textContent = message; els.toast.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => els.toast.classList.remove('show'), 2300); }

function renderFeatured() {
  els.featured.innerHTML = state.posts.slice(0, 3).map((post) => `<article class="feature-card"><div class="kicker">${escape(post.category || 'Blog')}</div><h3>${escape(post.title)}</h3><p>${escape(post.excerpt || post.content.slice(0, 130))}</p></article>`).join('');
}

function renderPosts() {
  const query = (els.search.value || '').trim().toLowerCase();
  const posts = state.posts.filter((post) => `${post.title} ${post.author} ${post.category} ${(post.tags || []).join(' ')} ${post.content}`.toLowerCase().includes(query));
  els.posts.innerHTML = posts.length ? posts.map((post) => {
    const first = media(post)[0];
    const visual = first?.type?.startsWith('video/') ? `<video src="${escape(first.url)}" controls playsinline></video>` : `<img src="${escape(cover(post))}" alt="${escape(post.title)}" loading="lazy">`;
    return `<article class="post-card"><div class="post-cover">${visual}</div><div class="post-body"><div class="post-meta"><span>${escape(post.category || 'Umum')}</span><span>${date(post.createdAt)}</span></div><div class="tag-list">${tags(post).map((tag) => `<span class="tag-pill">#${escape(tag)}</span>`).join('')}</div><h3>${escape(post.title)}</h3><p>${escape(post.excerpt || post.content.slice(0, 150))}</p><div class="post-footer"><span class="author-pill">${escape(post.author || 'Admin')}</span><button class="row-action" data-action="open" data-id="${escape(post.id)}" type="button">Baca</button></div></div></article>`;
  }).join('') : '<div class="empty-state">Belum ada artikel yang cocok dengan pencarian Anda.</div>';
  $('postCountStat').textContent = state.posts.length;
}

function renderMedia() {
  const all = state.posts.flatMap((post) => media(post).map((item) => ({ ...item, title: post.title, author: post.author })));
  els.media.innerHTML = all.slice(0, 8).map((item) => { const visual = item.type?.startsWith('video/') ? `<video src="${escape(item.url)}" controls playsinline></video>` : `<img src="${escape(item.url)}" alt="${escape(item.title)}" loading="lazy">`; return `<div class="media-item"><div class="media-item-thumb">${visual}</div><div><strong>${escape(item.title)}</strong><span>${escape(item.author || 'Admin')}</span></div></div>`; }).join('') || '<div class="empty-state">Belum ada media.</div>';
  $('mediaCountStat').textContent = all.length;
}

function renderAdmin() {
  els.adminList.innerHTML = state.posts.map((post) => `<div class="admin-row"><div><strong>${escape(post.title)}</strong><small>${date(post.createdAt)}</small></div><div class="row-actions"><button class="row-action" data-action="edit" data-id="${escape(post.id)}" type="button">Edit</button><button class="row-action delete" data-action="delete" data-id="${escape(post.id)}" type="button">Delete</button></div></div>`).join('');
}
function renderAll() { renderFeatured(); renderPosts(); renderMedia(); renderAdmin(); }

function preview() {
  els.preview.innerHTML = state.draftMedia.map((item) => { const visual = item.type.startsWith('video/') ? `<video src="${item.url}" controls playsinline></video>` : item.type.startsWith('audio/') ? `<audio src="${item.url}" controls></audio>` : `<img src="${item.url}" alt="${escape(item.name)}">`; return `<div class="preview-item"><span class="preview-chip">${escape(item.type.split('/')[0].toUpperCase())}</span>${visual}</div>`; }).join('');
}
function read(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
async function selectMedia(event) { for (const file of Array.from(event.target.files || [])) { if (!/^(image|video|audio)\//.test(file.type)) { toast('Gunakan file gambar, video, atau audio.'); continue; } if (file.size > 25 * 1024 * 1024) { toast(`${file.name} terlalu besar. Maksimal 25 MB.`); continue; } state.draftMedia.push({ id: crypto.randomUUID(), name: file.name, type: file.type, url: await read(file) }); } event.target.value = ''; preview(); }
function reset() { state.editing = null; state.draftMedia = []; els.form.reset(); els.author.value = 'Admin'; preview(); }
function openAdmin(open = true) { els.admin.classList.toggle('hidden', !open); if (open) els.admin.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function edit(id) { const post = state.posts.find((item) => item.id === id); if (!post) return; state.editing = id; els.title.value = post.title; els.author.value = post.author || 'Admin'; els.category.value = post.category || ''; els.tags.value = (post.tags || []).join(', '); els.excerpt.value = post.excerpt || ''; els.content.value = post.content || ''; state.draftMedia = media(post).map((item) => ({ ...item })); preview(); openAdmin(); }
function openArticle(id) { const post = state.posts.find((item) => item.id === id); if (!post) return; const first = media(post).find((item) => /^(image|video)\//.test(item.type)); const hero = first?.type.startsWith('video/') ? `<video src="${first.url}" controls playsinline></video>` : first ? `<img src="${first.url}" alt="${escape(post.title)}">` : ''; els.modalBody.innerHTML = `<div class="modal-header"><p class="eyebrow">Story / Publication</p><h2 id="modalTitle">${escape(post.title)}</h2><div class="modal-meta">${escape(post.author || 'Admin')} · ${date(post.createdAt)} · ${escape(post.category || 'Umum')}</div></div><div class="modal-body">${hero}<div class="tag-list">${tags(post).map((tag) => `<span class="tag-pill">#${escape(tag)}</span>`).join('')}</div><div class="modal-copy">${escape(post.content).replace(/\n/g, '<br>')}</div>${media(post).length ? `<div class="modal-attachments">${media(post).map((item) => `<a class="modal-attachment" href="${item.url}" target="_blank" rel="noopener"><span>${item.type.split('/')[0][0].toUpperCase()}</span><div><strong>${escape(item.name || 'Media')}</strong><small>${escape(item.type)}</small></div></a>`).join('')}</div>` : ''}</div>`; els.modal.classList.remove('hidden'); els.modal.setAttribute('aria-hidden', 'false'); }
function closeArticle() { els.modal.classList.add('hidden'); els.modal.setAttribute('aria-hidden', 'true'); }

els.form.addEventListener('submit', (event) => { event.preventDefault(); const title = els.title.value.trim(); const content = els.content.value.trim(); if (!title || !content) return toast('Judul dan konten wajib diisi.'); const chosen = state.draftMedia.find((item) => item.type.startsWith('image/')) || state.draftMedia[0]; const post = { id: state.editing || crypto.randomUUID(), title, content, author: els.author.value.trim() || 'Admin', category: els.category.value.trim() || 'Umum', tags: els.tags.value.split(',').map((x) => x.trim()).filter(Boolean), excerpt: els.excerpt.value.trim() || content.slice(0, 140), createdAt: state.editing ? state.posts.find((x) => x.id === state.editing)?.createdAt || new Date().toISOString() : new Date().toISOString(), cover: chosen?.url || fallbackCover, media: state.draftMedia }; state.posts = state.editing ? state.posts.map((x) => x.id === state.editing ? post : x) : [post, ...state.posts]; save(); renderAll(); reset(); openAdmin(false); toast('Artikel berhasil disimpan dan tampil publik.'); });
els.upload.addEventListener('change', selectMedia);
$('resetFormBtn').addEventListener('click', reset);
$('openAdminBtn').addEventListener('click', () => openAdmin()); $('openAdminSecondary').addEventListener('click', () => openAdmin()); $('closeAdminBtn').addEventListener('click', () => openAdmin(false));
els.search.addEventListener('input', renderPosts);
document.body.addEventListener('click', (event) => { const button = event.target.closest('[data-action]'); if (!button) return; const { action, id } = button.dataset; if (action === 'open') return openArticle(id); if (action === 'edit') return edit(id); if (action === 'delete') { const post = state.posts.find((x) => x.id === id); if (post && confirm(`Hapus "${post.title}"?`)) { state.posts = state.posts.filter((x) => x.id !== id); save(); renderAll(); toast('Artikel dihapus.'); } } });
$('closeModalBtn').addEventListener('click', closeArticle); document.querySelector('.modal-backdrop').addEventListener('click', closeArticle);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeArticle(); openAdmin(false); } });
$('themeToggle').addEventListener('click', () => { const root = document.documentElement; root.style.setProperty('--hue', String((Number(root.style.getPropertyValue('--hue') || 222) + 60) % 360)); toast('Tema AI diperbarui.'); });
let hue = 222; setInterval(() => { hue = (hue + 1.2) % 360; document.documentElement.style.setProperty('--hue', hue); }, 2800);
window.addEventListener('storage', () => { state.posts = load(); renderAll(); });
reset(); renderAll();
