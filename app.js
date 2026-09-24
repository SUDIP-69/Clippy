const defaultClips = [
  { id: 1, type: 'text', content: 'Design is not just what it looks like and feels like. Design is how it works.', time: '2 min ago', device: 'MacBook Pro', pinned: true, tag: 'Quote' },
  { id: 2, type: 'image', content: 'inspiration-board.jpg', time: '18 min ago', device: 'iPhone 15 Pro', pinned: false, tag: 'Inspiration', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=700&q=80' },
  { id: 3, type: 'text', content: 'npm install lucide-react && npm run dev', time: '42 min ago', device: 'MacBook Pro', pinned: true, tag: 'Dev' },
  { id: 4, type: 'file', content: 'project-brief-v3.pdf', time: '1 hr ago', device: 'MacBook Pro', pinned: false, tag: 'PDF', size: '2.4 MB' },
  { id: 5, type: 'text', content: 'The best ideas start as tiny, almost invisible sparks.', time: '2 hrs ago', device: 'iPhone 15 Pro', pinned: false, tag: 'Note' },
  { id: 6, type: 'text', content: 'https://linear.app/acme/team/active', time: '3 hrs ago', device: 'Pixel 8', pinned: false, tag: 'Link' },
  { id: 7, type: 'image', content: 'moodboard.png', time: 'Yesterday', device: 'MacBook Pro', pinned: true, tag: 'Inspiration', image: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=700&q=80' },
  { id: 8, type: 'file', content: 'team-offsite.png', time: 'Yesterday', device: 'iPhone 15 Pro', pinned: false, tag: 'Image', size: '840 KB' },
  { id: 9, type: 'text', content: 'Remember to send the final handoff before Friday.', time: 'Yesterday', device: 'MacBook Pro', pinned: false, tag: 'Note' },
  { id: 10, type: 'text', content: 'Color is a power which directly influences the soul.', time: '2 days ago', device: 'Pixel 8', pinned: false, tag: 'Quote' },
  { id: 11, type: 'text', content: 'Meeting notes: keep the experience fast, quiet, and kind.', time: '2 days ago', device: 'MacBook Pro', pinned: false, tag: 'Note' },
  { id: 12, type: 'text', content: 'A small detail can carry the whole feeling.', time: '3 days ago', device: 'iPhone 15 Pro', pinned: false, tag: 'Quote' }
];
const STORAGE_KEY = 'clippy-clips';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
let clips = loadClips();
let activeFilter = 'all';
let activeView = 'all';
let sortNewest = true;
let selectedType = 'text';
const grid = document.getElementById('clip-grid');
const emptyState = document.getElementById('empty-state');
const dialog = document.getElementById('clip-dialog');
const searchInput = document.getElementById('search-input');

function loadClips() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(saved) ? saved.filter(clip => clip && clip.id && clip.type && typeof clip.content === 'string') : defaultClips;
  } catch {
    return defaultClips;
  }
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
    return true;
  } catch {
    showToast('Storage is full. Export a backup and remove large files.');
    return false;
  }
}
function typeLabel(type) { return type === 'text' ? 'Text' : type === 'image' ? 'Image' : 'File'; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400); }
function cardMarkup(clip) {
  const safeContent = escapeHtml(clip.content);
  const body = clip.type === 'image' && clip.image ? `<div class="image-preview"><img src="${escapeHtml(clip.image)}" alt="${safeContent}" /></div>` : clip.type === 'file' ? `<div class="file-preview"><span class="file-icon">↗</span><div><b>${safeContent}</b><small>${escapeHtml(clip.size || 'File')}</small></div></div>` : `<p class="${clip.content.includes('http') || clip.content.includes('npm') ? 'mono' : ''}">${safeContent}</p>`;
  const downloadButton = clip.type === 'image' || clip.type === 'file' ? '<button class="mini-button download-button" title="Download">↓</button>' : '';
  return `<article class="clip-card ${clip.pinned ? 'pinned' : ''}" data-id="${escapeHtml(clip.id)}"><div class="clip-top"><span class="clip-kind ${escapeHtml(clip.type)}">${typeLabel(clip.type)}</span><div class="clip-actions"><button class="mini-button copy-button" title="Copy">⧉</button>${downloadButton}<button class="mini-button pin-button ${clip.pinned ? 'star-filled' : ''}" title="${clip.pinned ? 'Unpin' : 'Pin'}">✦</button><button class="mini-button delete-button" title="Delete">×</button></div></div><div class="clip-body">${body}</div><div class="clip-footer"><span class="device-mini">⌘ ${escapeHtml(clip.device || 'This browser')}</span><span class="tag">${escapeHtml(clip.tag || 'Clip')}</span><time>${escapeHtml(clip.time || 'Saved')}</time></div></article>`;
}
function render() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = clips.filter(clip => (activeFilter === 'all' || clip.type === activeFilter) && (activeView !== 'pinned' || clip.pinned) && (!query || `${clip.content} ${clip.tag || ''} ${clip.device || ''}`.toLowerCase().includes(query)));
  visible = [...visible].sort((a, b) => sortNewest ? b.id - a.id : a.id - b.id);
  grid.innerHTML = visible.map(cardMarkup).join('');
  emptyState.hidden = visible.length > 0;
  document.getElementById('clip-total').textContent = clips.length;
  document.getElementById('all-count').textContent = clips.length;
  document.getElementById('pinned-count').textContent = clips.filter(clip => clip.pinned).length;
  document.querySelectorAll('.filter-button').forEach(button => button.classList.toggle('active', button.dataset.filter === activeFilter));
  grid.querySelectorAll('.copy-button').forEach(button => button.addEventListener('click', copyClip));
  grid.querySelectorAll('.pin-button').forEach(button => button.addEventListener('click', togglePin));
  grid.querySelectorAll('.delete-button').forEach(button => button.addEventListener('click', deleteClip));
  grid.querySelectorAll('.download-button').forEach(button => button.addEventListener('click', downloadClip));
}
async function copyClip(event) { const clip = clips.find(item => String(item.id) === event.target.closest('.clip-card').dataset.id); if (!clip) return; try { await navigator.clipboard.writeText(clip.content); } catch { const area = document.createElement('textarea'); area.value = clip.content; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); const copied = document.execCommand('copy'); area.remove(); if (!copied) { showToast('Clipboard access was blocked'); return; } } showToast(`${typeLabel(clip.type)} copied to clipboard`); }
function togglePin(event) { const card = event.target.closest('.clip-card'); const clip = clips.find(item => String(item.id) === card.dataset.id); if (!clip) return; clip.pinned = !clip.pinned; save(); render(); showToast(clip.pinned ? 'Pinned to your library' : 'Removed from pinned'); }
function deleteClip(event) { const card = event.target.closest('.clip-card'); const removed = clips.find(item => String(item.id) === card.dataset.id); clips = clips.filter(item => String(item.id) !== card.dataset.id); save(); render(); showToast(`${typeLabel(removed.type)} removed`); }
async function downloadClip(event) { const card = event.target.closest('.clip-card'); const clip = clips.find(item => String(item.id) === card.dataset.id); if (!clip) return; const source = clip.data || clip.image; if (!source) { showToast('This attachment has no downloadable data'); return; } try { const response = await fetch(source); const blob = await response.blob(); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = clip.content; link.click(); URL.revokeObjectURL(link.href); } catch { const link = document.createElement('a'); link.href = source; link.download = clip.content; link.target = '_blank'; link.click(); } showToast(`${typeLabel(clip.type)} download started`); }
function resetDialog() { document.getElementById('clip-content').value = ''; document.getElementById('clip-file').value = ''; selectedType = 'text'; document.querySelectorAll('.type-tab').forEach(item => item.classList.toggle('active', item.dataset.type === 'text')); document.getElementById('text-entry').hidden = false; document.getElementById('file-entry').hidden = true; }
function openDialog() { resetDialog(); dialog.showModal(); }
function updateViewLabel(label) { document.getElementById('current-view').textContent = label; document.querySelector('.page-heading h1').firstChild.textContent = `${label} `; }
function readFile(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); }); }
function downloadBackup() { const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), clips }, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `clippy-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); showToast('Backup exported'); }
async function importBackup(event) { const file = event.target.files[0]; event.target.value = ''; if (!file) return; try { const imported = JSON.parse(await file.text()); const incoming = Array.isArray(imported) ? imported : imported.clips; if (!Array.isArray(incoming) || incoming.some(clip => !clip || !clip.id || !['text', 'image', 'file'].includes(clip.type) || typeof clip.content !== 'string')) throw new Error('Invalid backup'); clips = incoming; save(); render(); showToast(`${clips.length} clips restored`); } catch { showToast('That backup file is not valid'); } }

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => { activeView = button.dataset.view; activeFilter = activeView === 'all' || activeView === 'pinned' ? 'all' : activeView; document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === button)); updateViewLabel(activeView === 'all' ? 'All clips' : activeView === 'pinned' ? 'Pinned' : `${typeLabel(activeView)}s`); render(); }));
document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => { activeFilter = button.dataset.filter; activeView = 'all'; document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === activeFilter || (activeFilter === 'all' && item.dataset.view === 'all'))); updateViewLabel(activeFilter === 'all' ? 'All clips' : `${typeLabel(activeFilter)}s`); render(); }));
searchInput.addEventListener('input', render);
document.getElementById('focus-search').addEventListener('click', () => searchInput.focus());
document.getElementById('sort-button').addEventListener('click', () => { sortNewest = !sortNewest; document.getElementById('sort-button').innerHTML = `${sortNewest ? 'Newest first' : 'Oldest first'} <span>⌄</span>`; render(); });
document.getElementById('new-clip').addEventListener('click', openDialog);
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
document.getElementById('dismiss-banner').addEventListener('click', event => event.currentTarget.parentElement.remove());
document.getElementById('export-clips').addEventListener('click', downloadBackup);
document.getElementById('import-clips').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', importBackup);
document.getElementById('paste-clipboard').addEventListener('click', async () => { try { document.getElementById('clip-content').value = await navigator.clipboard.readText(); } catch { showToast('Clipboard access was blocked'); } });
document.querySelectorAll('.type-tab').forEach(tab => tab.addEventListener('click', () => { selectedType = tab.dataset.type; document.querySelectorAll('.type-tab').forEach(item => item.classList.toggle('active', item === tab)); document.getElementById('text-entry').hidden = selectedType !== 'text'; document.getElementById('file-entry').hidden = selectedType === 'text'; }));
document.getElementById('clip-form').addEventListener('submit', async event => { event.preventDefault(); const file = document.getElementById('clip-file').files[0]; const text = document.getElementById('clip-content').value.trim(); if (selectedType === 'text' && !text || selectedType !== 'text' && !file) { showToast('Add some content first'); return; } if (file && file.size > MAX_FILE_SIZE) { showToast('Files must be smaller than 2 MB'); return; } const clip = { id: Date.now(), type: selectedType, content: selectedType === 'text' ? text : file.name, time: 'Just now', device: 'This browser', pinned: false, tag: selectedType === 'text' ? 'Note' : typeLabel(selectedType), size: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : undefined }; if (file) { try { clip.data = await readFile(file); if (selectedType === 'image') clip.image = clip.data; } catch { showToast('The file could not be read'); return; } } clips.unshift(clip); if (!save()) { clips.shift(); return; } dialog.close(); resetDialog(); render(); showToast('Clip saved in this browser'); });
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInput.focus(); } });
render();
