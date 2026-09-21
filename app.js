const DB_NAME = 'nebula-drop-db';
const STORE = 'files';
let records = [];
const $ = (id) => document.getElementById(id);

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function transaction(mode, action) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode), store = tx.objectStore(STORE);
    const request = action(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}
const getAll = () => transaction('readonly', store => store.getAll());
const addFile = file => transaction('readwrite', store => store.add({ name:file.name, size:file.size, type:file.type || 'file', blob:file, addedAt:Date.now() }));
const deleteFile = id => transaction('readwrite', store => store.delete(id));

function formatSize(bytes) { if (!bytes) return '0 B'; const units=['B','KB','MB','GB']; const i=Math.floor(Math.log(bytes)/Math.log(1024)); return `${(bytes/Math.pow(1024,i)).toFixed(i ? 1 : 0)} ${units[i]}`; }
function extension(name) { const ext = name.split('.').pop().toLowerCase(); return ext.length > 5 ? 'FILE' : ext; }
function escapeHTML(value) { return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function icon(name) { return name === 'download' ? '<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M5 5h14v14H5zM9 5v14m6-14v14M5 9h14m-14 6h14"/></svg>'; }

function render() {
  const query = $('searchInput').value.toLowerCase().trim();
  const visible = records.filter(file => file.name.toLowerCase().includes(query));
  $('fileCount').textContent = records.length;
  $('storageText').textContent = `${formatSize(records.reduce((sum, file) => sum + file.size, 0))} digunakan`;
  $('emptyState').style.display = visible.length ? 'none' : 'block';
  $('fileList').innerHTML = visible.map(file => `<article class="file-row"><div class="file-icon">${escapeHTML(extension(file.name))}</div><div class="file-meta"><div class="file-name" title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</div><div class="file-size">${formatSize(file.size)} · ${new Date(file.addedAt).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</div></div><div class="file-actions"><button class="icon-btn" data-download="${file.id}" aria-label="Download ${escapeHTML(file.name)}">${icon('download')}</button><button class="icon-btn delete" data-delete="${file.id}" aria-label="Hapus ${escapeHTML(file.name)}">${icon('delete')}</button></div></article>`).join('');
}
function toast(message) { const el=$('toast'); el.textContent=message; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); }
async function saveFiles(fileList) { const files = [...fileList]; if (!files.length) return; for (const file of files) { if (file.size > 500 * 1024 * 1024) { toast(`${file.name} terlalu besar (maks. 500 MB)`); continue; } await addFile(file); } records = await getAll(); render(); toast(`${files.length} file berhasil ditambahkan`); }

$('browseButton').addEventListener('click', e => { e.stopPropagation(); $('fileInput').click(); });
$('dropZone').addEventListener('click', e => { if (e.target !== $('browseButton')) $('fileInput').click(); });
$('dropZone').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') $('fileInput').click(); });
$('fileInput').addEventListener('change', e => saveFiles(e.target.files));
['dragenter','dragover'].forEach(event => $('dropZone').addEventListener(event, e => { e.preventDefault(); $('dropZone').classList.add('dragging'); }));
['dragleave','drop'].forEach(event => $('dropZone').addEventListener(event, e => { e.preventDefault(); $('dropZone').classList.remove('dragging'); }));
$('dropZone').addEventListener('drop', e => saveFiles(e.dataTransfer.files));
$('searchInput').addEventListener('input', render);
$('fileList').addEventListener('click', async e => { const download = e.target.closest('[data-download]'); const remove = e.target.closest('[data-delete]'); if (download) { const file = records.find(item => item.id === Number(download.dataset.download)); if (!file) return; const url=URL.createObjectURL(file.blob), link=document.createElement('a'); link.href=url; link.download=file.name; link.click(); URL.revokeObjectURL(url); toast('Download dimulai'); } if (remove) { await deleteFile(Number(remove.dataset.delete)); records=await getAll(); render(); toast('File dihapus dari browser'); } });
getAll().then(data => { records=data; render(); }).catch(() => toast('Browser tidak mendukung penyimpanan lokal'));
