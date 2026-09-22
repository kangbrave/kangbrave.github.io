const $ = (selector) => document.querySelector(selector);
const files = [];
const MAX_SIZE = 100 * 1024 * 1024;
const input = $('#fileInput');
const list = $('#fileList');
const form = $('#postForm');
const configValid = !!(
  window.MOD_SUPABASE_URL &&
  !window.MOD_SUPABASE_URL.includes('YOUR-') &&
  window.MOD_SUPABASE_ANON_KEY &&
  !window.MOD_SUPABASE_ANON_KEY.includes('YOUR_')
);
const supabase = configValid ? window.supabase.createClient(window.MOD_SUPABASE_URL, window.MOD_SUPABASE_ANON_KEY) : null;
let posts = [];

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
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

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fileKindLabel(file) {
  const name = (file.name || '').toLowerCase();
  if (file.type && file.type.startsWith('image/')) return 'Image';
  if (file.type && file.type.startsWith('video/')) return 'Video';
  if (file.type && file.type.startsWith('audio/')) return 'Audio';
  if (name.endsWith('.apk')) return 'APK';
  if (name.endsWith('.pdf')) return 'PDF';
  if (/\.(zip|rar|7z)$/i.test(name)) return 'Archive';
  return 'File';
}

function renderFiles() {
  list.innerHTML = files.map((file, index) => {
    const kind = fileKindLabel(file);
    const short = kind.slice(0, 3).toUpperCase();
    return `
      <div class="file-chip">
        <span class="file-icon">${short}</span>
        <span title="${escapeHtml(file.name)}">
          ${escapeHtml(file.name)}
          <small>${formatSize(file.size)} · ${kind}</small>
        </span>
        <button class="remove-file" type="button" data-index="${index}" aria-label="Hapus ${escapeHtml(file.name)}">×</button>
      </div>
    `;
  }).join('');

  $('#aiHint').textContent = files.length
    ? `${files.length} file siap diunggah.`
    : 'Tambahkan file untuk mendapatkan saran deskripsi otomatis.';
}

function addFiles(selectedFiles) {
  for (const file of Array.from(selectedFiles || [])) {
    if (file.size > MAX_SIZE) {
      toast(`${file.name} melebihi batas 100 MB.`);
      continue;
    }
    if (files.length < 8) {
      files.push(file);
    }
  }
  renderFiles();
}

function smartDescription() {
  if (!files.length) {
    return 'Tulis catatan singkat atau tambahkan file agar AI dapat membantu.';
  }

  const summary = {};
  for (const file of files) {
    const key = fileKindLabel(file);
    summary[key] = (summary[key] || 0) + 1;
  }

  const parts = Object.entries(summary)
    .map(([key, count]) => `${count} ${key}`)
    .join(', ');

  return `Posting ini berisi ${parts}. File ini dibagikan untuk kebutuhan publik, referensi, dan kolaborasi cepat.`;
}

async function generateAiDescription(title, content, fileTypes) {
  const response = await fetch(
    'https://cpseqxlarjjfsvnqxxzk.supabase.co/functions/v1/generate-description',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content, fileTypes })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'AI generation failed');
  }

  return data.description;
}

$('#generateButton').addEventListener('click', async () => {
  const title = $('#title').value.trim();
  const content = $('#content').value.trim();
  const fileTypes = files.map((file) => fileKindLabel(file));

  try {
    const description = await generateAiDescription(title, content, fileTypes);
    $('#content').value = $('#content').value
      ? `${$('#content').value}\n\n${description}`
      : description;

    $('#saveStatus').textContent = 'Deskripsi AI dibuat ✦';
    toast('Deskripsi AI berhasil dibuat');
  } catch (error) {
    toast(error.message || 'Gagal membuat deskripsi AI');
  }
});

input.addEventListener('change', (event) => {
  addFiles(event.target.files);
  input.value = '';
});

$('#dropZone').addEventListener('click', (event) => {
  if (event.target !== input) input.click();
});

['dragenter', 'dragover'].forEach((eventName) => {
  $('#dropZone').addEventListener(eventName, (event) => {
    event.preventDefault();
    $('#dropZone').classList.add('dragging');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  $('#dropZone').addEventListener(eventName, (event) => {
    event.preventDefault();
    $('#dropZone').classList.remove('dragging');
  });
});

$('#dropZone').addEventListener('drop', (event) => {
  addFiles(event.dataTransfer.files);
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-index]');
  if (!button) return;
  const index = Number(button.dataset.index);
  files.splice(index, 1);
  renderFiles();
});

function getAttachmentMarkup(filesList) {
  if (!Array.isArray(filesList) || !filesList.length) return '';

  return filesList.map((file) => `
    <a class="download-file" href="${file.public_url || '#'}" target="_blank" rel="noopener" download>
      <span class="download-icon">↧</span>
      <div>
        <strong>${escapeHtml(file.file_name || 'file')}</strong>
        <small>${formatSize(file.file_size || 0)} · ${fileKindLabel({ name: file.file_name || '', type: file.mime_type || '' })}</small>
      </div>
    </a>
  `).join('');
}

function renderPosts() {
  const query = $('#searchInput').value.trim().toLowerCase();
  const grid = $('#postGrid');
  const filtered = posts.filter((post) => {
    const haystack = `${post.title || ''} ${post.description || ''} ${post.author || ''}`.toLowerCase();
    return haystack.includes(query);
  });

  $('#emptyState').style.display = filtered.length ? 'none' : 'block';

  grid.innerHTML = filtered.map((post) => {
    const mediaFiles = Array.isArray(post.post_files) ? post.post_files : [];
    const mainMedia = mediaFiles.find((file) => file.mime_type && (file.mime_type.startsWith('image/') || file.mime_type.startsWith('video/')));
    const preview = mainMedia ? (
      mainMedia.mime_type.startsWith('video/')
        ? `<video src="${mainMedia.public_url}" controls playsinline></video>`
        : `<img src="${mainMedia.public_url}" alt="${escapeHtml(post.title || 'Posting')}" loading="lazy">`
    ) : '<span class="file-icon">✦</span>';

    return `
      <article class="post-card">
        <div class="post-media">${preview}</div>
        <div class="post-body">
          <h3>${escapeHtml(post.title || 'Tanpa judul')}</h3>
          <p>${escapeHtml(post.description || 'Posting tanpa deskripsi.')}</p>
          <div class="post-footer">
            <span>${escapeHtml(post.author || 'Anonymous')} · ${mediaFiles.length} file</span>
            <button type="button" data-id="${post.id}">Selengkapnya</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function openDetail(id) {
  const post = posts.find((item) => String(item.id) === String(id));
  if (!post) return;

  const mediaFiles = Array.isArray(post.post_files) ? post.post_files : [];
  const mainMedia = mediaFiles.find((file) => file.mime_type && (file.mime_type.startsWith('image/') || file.mime_type.startsWith('video/')));
  const preview = mainMedia ? (
    mainMedia.mime_type.startsWith('video/')
      ? `<video src="${mainMedia.public_url}" controls playsinline></video>`
      : `<img src="${mainMedia.public_url}" alt="${escapeHtml(post.title || 'Posting')}" loading="lazy">`
  ) : '';

  const attachments = getAttachmentMarkup(mediaFiles);
  const date = new Date(post.created_at || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  $('#modalBody').innerHTML = `
    <div class="modal-header">
      <span class="eyebrow">Full story</span>
      <h2 id="modalTitle">${escapeHtml(post.title || 'Tanpa judul')}</h2>
      <div class="modal-meta">${escapeHtml(post.author || 'Anonymous')} · ${date}</div>
    </div>
    <div class="modal-body">
      ${preview}
      <div class="modal-text">${escapeHtml(post.description || 'Tidak ada deskripsi.').replace(/\n/g, '<br>')}</div>
      ${attachments ? `<div><h3>File terlampir</h3><div class="download-list">${attachments}</div></div>` : ''}
    </div>
  `;

  $('#detailModal').classList.remove('hidden');
  $('#detailModal').setAttribute('aria-hidden', 'false');
}

function closeDetail() {
  $('#detailModal').classList.add('hidden');
  $('#detailModal').setAttribute('aria-hidden', 'true');
}

$('#postGrid').addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-id]');
  if (trigger) {
    openDetail(trigger.dataset.id);
  }
});

$('#closeModal').addEventListener('click', closeDetail);
$('#detailModal').addEventListener('click', (event) => {
  if (event.target.dataset.close === 'true') closeDetail();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeDetail();
});

$('#searchInput').addEventListener('input', renderPosts);

async function refreshPosts() {
  if (!supabase) {
    posts = JSON.parse(localStorage.getItem('mod-posts') || '[]');
    renderPosts();
    return;
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*, post_files(*)')
    .order('created_at', { ascending: false });

  if (error) {
    toast('Gagal memuat posting dari Supabase.');
    console.error(error);
    return;
  }

  posts = data || [];
  renderPosts();
}

async function publishPost(event) {
  event.preventDefault();

  if (!$('#title').value.trim()) {
    toast('Judul posting wajib diisi.');
    return;
  }

  const title = $('#title').value.trim();
  const author = $('#author').value.trim() || 'Anonymous';
  const description = $('#content').value.trim() || smartDescription();

  if (!supabase) {
    const payload = {
      id: crypto.randomUUID(),
      title,
      author,
      description,
      created_at: new Date().toISOString(),
      post_files: files.map((file) => ({
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        public_url: ''
      }))
    };

    const listPosts = JSON.parse(localStorage.getItem('mod-posts') || '[]');
    listPosts.unshift(payload);
    localStorage.setItem('mod-posts', JSON.stringify(listPosts));
    posts = listPosts;
    form.reset();
    files.length = 0;
    renderFiles();
    toast('Posting disimpan ke mode demo lokal');
    renderPosts();
    return;
  }

  try {
    $('#publishButton').disabled = true;
    const { data: insertedPost, error: insertError } = await supabase
      .from('posts')
      .insert({ title, author, description })
      .select()
      .single();

    if (insertError) throw insertError;

    const uploadedFiles = [];

    for (const file of files) {
      const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
      const storagePath = `${insertedPost.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('mod-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream'
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('mod-files').getPublicUrl(storagePath);
      uploadedFiles.push({
        post_id: insertedPost.id,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        storage_path: storagePath,
        public_url: publicData.publicUrl
      });
    }

    if (uploadedFiles.length) {
      const { error: filesErr } = await supabase.from('post_files').insert(uploadedFiles);
      if (filesErr) throw filesErr;
    }

    form.reset();
    files.length = 0;
    renderFiles();
    $('#saveStatus').textContent = 'Posting dipublikasikan';
    toast('Posting berhasil dipublikasikan ✦');
    await refreshPosts();
    location.hash = '#explore';
  } catch (error) {
    console.error(error);
    toast(error.message || 'Upload gagal, cek konfigurasi Supabase.');
  } finally {
    $('#publishButton').disabled = false;
  }
}

$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('mod-dark', document.body.classList.contains('dark'));
});

form.addEventListener('submit', publishPost);
form.addEventListener('reset', () => {
  setTimeout(() => {
    files.length = 0;
    renderFiles();
  }, 0);
});

if (localStorage.getItem('mod-dark') === 'true') {
  document.body.classList.add('dark');
}

if (!configValid) {
  $('#saveStatus').textContent = 'Demo mode · konfigurasi Supabase belum aktif';
  toast('Mode demo aktif: hasil disimpan lokal di browser.');
}

renderFiles();
refreshPosts();
