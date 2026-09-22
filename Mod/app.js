const $ = (selector) => document.querySelector(selector);
const input = $('#fileInput');
const zone = $('#dropZone');
const list = $('#fileList');
const form = $('#postForm');
const maxSize = 100 * 1024 * 1024;
const files = [];
let posts = safeParse(localStorage.getItem('mod-posts') || '[]');

function safeParse(value) {
  try { return JSON.parse(value); } catch { return []; }
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function fileKindLabel(file) {
  if (file.type.startsWith('image/')) return 'Image';
  if (file.type.startsWith('video/')) return 'Video';
  if (file.type.startsWith('audio/')) return 'Audio';
  if (file.name.toLowerCase().endsWith('.apk')) return 'APK';
  if (file.name.toLowerCase().endsWith('.pdf')) return 'PDF';
  if (/\.(zip|rar|7z)$/i.test(file.name)) return 'Archive';
  return 'File';
}

function renderFiles() {
  list.innerHTML = '';
  files.forEach((file, index) => {
    const chip = document.createElement('div');
    chip.className = 'file-chip';

    const preview = file.type.startsWith('image/') || file.type.startsWith('video/')
      ? `<img src="${URL.createObjectURL(file)}" alt="${file.name}">`
      : '<span class="file-icon">◈</span>';

    chip.innerHTML = `
      ${preview}
      <span title="${file.name}">
        ${file.name}
        <small style="display:block;color:var(--muted)">${formatSize(file.size)} · ${fileKindLabel(file)}</small>
      </span>
      <button class="remove-file" type="button" data-index="${index}" aria-label="Hapus ${file.name}">×</button>
    `;
    list.appendChild(chip);
  });

  const hint = $('#aiHint');
  hint.textContent = files.length
    ? `${files.length} file siap dideskripsikan secara otomatis.`
    : 'Tambahkan file untuk mendapatkan saran deskripsi otomatis.';
}

function addFiles(selectedFiles) {
  const items = Array.from(selectedFiles || []);
  for (const file of items) {
    if (file.size > maxSize) {
      toast(`${file.name} melebihi batas 100 MB.`);
      continue;
    }
    if (files.length < 8) {
      files.push(file);
    }
  }
  renderFiles();
}

input.addEventListener('change', (event) => {
  addFiles(event.target.files);
  event.target.value = '';
});

zone.addEventListener('click', (event) => {
  if (event.target !== input) input.click();
});

['dragenter', 'dragover'].forEach((eventName) => {
  zone.addEventListener(eventName, (event) => {
    event.preventDefault();
    zone.classList.add('dragging');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  zone.addEventListener(eventName, (event) => {
    event.preventDefault();
    zone.classList.remove('dragging');
  });
});

zone.addEventListener('drop', (event) => {
  addFiles(event.dataTransfer.files);
});

list.addEventListener('click', (event) => {
  const target = event.target;
  if (target.dataset.index !== undefined) {
    files.splice(Number(target.dataset.index), 1);
    renderFiles();
  }
});

function smartDescription() {
  if (!files.length) {
    return 'Tulis catatan singkat atau tambahkan file agar AI dapat membantu.';
  }

  const counts = {
    image: files.filter((file) => file.type.startsWith('image/')).length,
    video: files.filter((file) => file.type.startsWith('video/')).length,
    apk: files.filter((file) => file.name.toLowerCase().endsWith('.apk')).length,
    other: files.filter((file) => !file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.name.toLowerCase().endsWith('.apk')).length
  };

  const labels = [];
  if (counts.image) labels.push(`${counts.image} gambar visual`);
  if (counts.video) labels.push(`${counts.video} video`);
  if (counts.apk) labels.push(`${counts.apk} aplikasi Android`);
  if (counts.other) labels.push(`${counts.other} berkas pendukung`);

  return `Kumpulan ${labels.join(', ')} yang dibagikan untuk menjelajah, mencoba, dan menemukan sesuatu yang baru. Simpan file ini untuk referensi atau gunakan sesuai kebutuhan.`;
}

$('#generateButton').addEventListener('click', () => {
  const text = smartDescription();
  const content = $('#content');
  content.value = content.value ? `${content.value}\n\n${text}` : text;
  $('#saveStatus').textContent = 'Deskripsi dibuat ✦';
  toast('Deskripsi AI berhasil dibuat');
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function getPreviewSource(file) {
  if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
    return URL.createObjectURL(file);
  }
  return '';
}

function createAttachmentList(fileList) {
  if (!fileList || !fileList.length) return '';

  const rendered = fileList.map((file) => {
    const isImage = file.type && file.type.startsWith('image/');
    const isVideo = file.type && file.type.startsWith('video/');
    const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    const preview = isImage || isVideo ? `<div class="file-pill">${extension.slice(0, 3)}</div>` : `<div class="file-pill">${extension.slice(0, 3)}</div>`;
    return `
      <div class="modal-file">
        ${preview}
        <div>
          <strong>${escapeHtml(file.name)}</strong><br>
          <small>${formatSize(file.size || 0)}</small>
        </div>
      </div>
    `;
  }).join('');

  return `<div class="modal-attachments">${rendered}</div>`;
}

function openPostDetail(index) {
  const post = posts[index];
  if (!post) return;

  const modal = $('#detailModal');
  const body = $('#modalBody');
  const media = post.preview
    ? (post.kind === 'video'
      ? `<video src="${post.preview}" controls playsinline></video>`
      : `<img src="${post.preview}" alt="${escapeHtml(post.title)}">`)
    : '';

  const attachments = Array.isArray(post.attachments) && post.attachments.length
    ? createAttachmentList(post.attachments)
    : '';

  body.innerHTML = `
    <div class="modal-header">
      <span class="eyebrow">Full story</span>
      <h2 id="modalTitle">${escapeHtml(post.title)}</h2>
      <div class="modal-meta">${escapeHtml(post.author || 'Anonymous')} · ${new Date(post.date || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
    </div>
    <div class="modal-body">
      ${media}
      <div class="modal-text">${escapeHtml(post.content || 'Tidak ada deskripsi.').replace(/\n/g, '<br>')}</div>
      ${attachments ? `<div><h3>File terlampir</h3>${attachments}</div>` : ''}
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:12px;">
        <button type="button" class="primary-button modal-action" data-copy="${index}">Salin deskripsi</button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = $('#detailModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function renderPosts() {
  const query = $('#searchInput').value.toLowerCase();
  const grid = $('#postGrid');
  grid.innerHTML = '';

  const shown = posts.filter((post) => {
    const haystack = `${post.title} ${post.content} ${post.author}`.toLowerCase();
    return haystack.includes(query);
  });

  $('#emptyState').style.display = shown.length ? 'none' : 'block';

  shown.forEach((post, index) => {
    const card = document.createElement('article');
    card.className = 'post-card';

    const media = post.preview
      ? (post.kind === 'video'
        ? `<video src="${post.preview}" controls playsinline></video>`
        : `<img src="${post.preview}" alt="${post.title}">`)
      : '<span class="file-icon">✦</span>';

    card.innerHTML = `
      <div class="post-media">${media}</div>
      <div class="post-body">
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.content || 'Posting tanpa deskripsi.')}</p>
        <div class="post-footer">
          <span>${escapeHtml(post.author || 'Anonymous')} · ${post.files || 0} file</span>
          <button type="button" data-detail="${index}">Selengkapnya</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

$('#searchInput').addEventListener('input', renderPosts);
$('#postGrid').addEventListener('click', (event) => {
  const button = event.target.closest('[data-detail]');
  if (button) {
    openPostDetail(Number(button.dataset.detail));
    return;
  }

  const copy = event.target.closest('[data-copy]');
  if (copy) {
    const target = posts[Number(copy.dataset.copy)];
    navigator.clipboard?.writeText(target.content || '').catch(() => {});
    toast('Deskripsi disalin');
  }
});

$('#closeModal').addEventListener('click', closeModal);
$('#detailModal').addEventListener('click', (event) => {
  if (event.target.dataset.close === 'true') closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

function savePost(post) {
  posts.unshift(post);
  localStorage.setItem('mod-posts', JSON.stringify(posts));
  renderPosts();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!$('#title').value.trim()) return;

  const firstFile = files[0];
  const attachments = files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type || '',
    kind: fileKindLabel(file)
  }));

  const post = {
    title: $('#title').value.trim(),
    author: $('#author').value.trim() || 'Anonymous',
    content: $('#content').value.trim() || smartDescription(),
    files: files.length,
    kind: firstFile && firstFile.type.startsWith('video/') ? 'video' : 'image',
    preview: firstFile ? getPreviewSource(firstFile) : '',
    attachments,
    date: Date.now()
  };

  savePost(post);
  form.reset();
  files.length = 0;
  renderFiles();
  toast('Posting berhasil diterbitkan ✦');
  location.hash = 'explore';
});

form.addEventListener('reset', () => {
  setTimeout(() => {
    files.length = 0;
    renderFiles();
  }, 0);
});

$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('mod-dark', document.body.classList.contains('dark'));
});

if (localStorage.getItem('mod-dark') === 'true') {
  document.body.classList.add('dark');
}

renderPosts();
renderFiles();
