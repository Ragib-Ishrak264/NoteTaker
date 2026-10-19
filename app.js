const DB_NAME = 'notesapp';
const STORE_NAME = 'kv';

const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const viewToggleBtn = document.getElementById('view-toggle-btn');
const viewIconList = document.getElementById('view-icon-list');
const viewIconGallery = document.getElementById('view-icon-gallery');
const deleteBtn = document.getElementById('delete-btn');
const formatBtn = document.getElementById('format-btn');
const checklistBtn = document.getElementById('checklist-btn');
const tableBtn = document.getElementById('table-btn');
const attachBtn = document.getElementById('attach-btn');
const imageFileInput = document.getElementById('image-file-input');
const diagramBtn = document.getElementById('diagram-btn');
const lockBtn = document.getElementById('lock-btn');
const findToggleBtn = document.getElementById('find-toggle-btn');
const shareBtn = document.getElementById('share-btn');
const themeBtn = document.getElementById('theme-btn');
const newNoteBtn = document.getElementById('new-note-btn');
const newFolderBtn = document.getElementById('new-folder-btn');

const foldersSidebar = document.getElementById('folders-sidebar');
const folderListEl = document.getElementById('folder-list');
const sidebarTagsEl = document.getElementById('sidebar-tags');
const searchInput = document.getElementById('search-input');
const listSortBtn = document.getElementById('list-sort-btn');
const notesContainer = document.getElementById('notes-container');

const trashAlert = document.getElementById('trash-alert');
const trashStatusText = document.getElementById('trash-status-text');
const restoreTrashBtn = document.getElementById('restore-trash-btn');
const deleteForeverBtn = document.getElementById('delete-forever-btn');

const findBar = document.getElementById('find-bar');
const findInput = document.getElementById('find-input');
const findCount = document.getElementById('find-count');
const findPrevBtn = document.getElementById('find-prev-btn');
const findNextBtn = document.getElementById('find-next-btn');
const findCloseBtn = document.getElementById('find-close-btn');

const dateHeader = document.getElementById('date-header');
const lockedPlaceholder = document.getElementById('locked-placeholder');
const lockHintText = document.getElementById('lock-hint-text');
const unlockBtn = document.getElementById('unlock-btn');
const editor = document.getElementById('editor');
const editorScroll = document.querySelector('.editor-scroll');

const imgToolbar = document.getElementById('img-toolbar');
const imgEditSketchBtn = document.getElementById('img-edit-sketch-btn');
const imgDeleteBtn = document.getElementById('img-delete-btn');

const formatPopover = document.getElementById('format-popover');
const dashedListBtn = document.getElementById('dashed-list-btn');
const popChecklistBtn = document.getElementById('pop-checklist-btn');
const popQuoteBtn = document.getElementById('pop-quote-btn');
const moveCheckedBottomOpt = document.getElementById('move-checked-bottom-opt');

const sharePopover = document.getElementById('share-popover');
const exportHtmlBtn = document.getElementById('export-html-btn');
const exportTextBtn = document.getElementById('export-text-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const backupBtn = document.getElementById('backup-btn');
const restoreBtn = document.getElementById('restore-btn');
const restoreFileInput = document.getElementById('restore-file-input');

const sortPopover = document.getElementById('sort-popover');
const groupDatesToggle = document.getElementById('group-dates-toggle');

const contextMenu = document.getElementById('context-menu');
const ctxPin = document.getElementById('ctx-pin');
const ctxMove = document.getElementById('ctx-move');
const ctxDuplicate = document.getElementById('ctx-duplicate');
const ctxLock = document.getElementById('ctx-lock');
const ctxExport = document.getElementById('ctx-export');
const ctxDelete = document.getElementById('ctx-delete');

const folderContextMenu = document.getElementById('folder-context-menu');
const ctxFolderRename = document.getElementById('ctx-folder-rename');
const ctxFolderDelete = document.getElementById('ctx-folder-delete');

const wordCountPopover = document.getElementById('word-count-popover');
const wcWords = document.getElementById('wc-words');
const wcChars = document.getElementById('wc-chars');
const wcParas = document.getElementById('wc-paras');
const wcRead = document.getElementById('wc-read');

const diagramModal = document.getElementById('diagram-modal');
const drawInsertBtn = document.getElementById('draw-insert-btn');
const drawCloseBtn = document.getElementById('draw-close-btn');
const drawColor = document.getElementById('draw-color');
const drawSize = document.getElementById('draw-size');
const drawSmooth = document.getElementById('draw-smooth');
const drawFill = document.getElementById('draw-fill');
const drawGridBtn = document.getElementById('draw-grid-btn');
const drawUndoBtn = document.getElementById('draw-undo-btn');
const drawRedoBtn = document.getElementById('draw-redo-btn');
const drawClearBtn = document.getElementById('draw-clear-btn');
const dCanvas = document.getElementById('diagram-canvas');
const dCtx = dCanvas.getContext('2d');
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const PEN_TOOLS = new Set(['pen', 'fountain', 'brush', 'pencil', 'highlighter', 'eraser']);
const PDFJS_BASE = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/';
const drawTitle = document.getElementById('draw-title');
const pdfNav = document.getElementById('pdf-nav');
const pdfPrevBtn = document.getElementById('pdf-prev-btn');
const pdfNextBtn = document.getElementById('pdf-next-btn');
const pdfPageLabel = document.getElementById('pdf-page-label');
const drawPdfBtn = document.getElementById('draw-pdf-btn');
const pdfFileInput = document.getElementById('pdf-file-input');
const canvasViewport = document.querySelector('.canvas-viewport');

let notes = [];
let folders = [];
let activeFolder = 'notes';
let activeNoteId = null;
let activeTagFilter = null;
let viewMode = 'list';
let sortBy = 'updated';
let groupByDate = true;
let moveCheckedToBottom = false;

let saveTimeout = null;
let unlockedNotes = new Set();
let selectedImage = null;
let editingImage = null;
let contextNoteId = null;
let contextFolderId = null;
let draggedNoteId = null;

let dTool = 'pen';
let dHistory = [];
let dRedoStack = [];
let isDrawing = false;
let startX = 0, startY = 0;
let dragSnapshot = null;
let strokePoints = [];
let cW = 1000, cH = 600;
let bgLayer = null;
let eraserPattern = null;
let pdfjsLib = null;
let pdfPages = [];
let pdfIndex = 0;
let pdfBusy = false;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

function getStoreItem(key) {
  return initDB().then(db => new Promise(res => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => res(req.result);
    req.onerror = () => res(null);
  }));
}

function setStoreItem(key, val) {
  return initDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(val, key);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  }));
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c] || c));
}

function initTheme() {
  const t = localStorage.getItem('notes_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
}

themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const nxt = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nxt);
  localStorage.setItem('notes_theme', nxt);
});

sidebarToggleBtn.addEventListener('click', () => {
  foldersSidebar.classList.toggle('collapsed');
  foldersSidebar.classList.toggle('mobile-open');
});

viewToggleBtn.addEventListener('click', () => {
  viewMode = viewMode === 'list' ? 'gallery' : 'list';
  viewIconList.classList.toggle('hidden', viewMode === 'gallery');
  viewIconGallery.classList.toggle('hidden', viewMode === 'list');
  notesContainer.classList.toggle('list-mode', viewMode === 'list');
  notesContainer.classList.toggle('gallery-mode', viewMode === 'gallery');
  renderNotesList();
});

function getFirstImage(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function parseNoteContent(html, rawText) {
  const txt = (rawText || '').trim();
  const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0] || 'New Note';
  const snippet = lines.slice(1).join(' ');
  return { title, snippet };
}

function extractTags(text) {
  if (!text) return [];
  const matches = text.match(/#([\p{L}\p{N}_-]+)/gu) || [];
  return Array.from(new Set(matches.map(m => m.slice(1).toLowerCase())));
}

function renderFolders() {
  const standard = [
    { id: 'all', name: 'All Notes', icon: 'M3 6h18M3 12h18M3 18h18' },
    { id: 'notes', name: 'Notes', icon: 'M4 4h16v16H4z M9 4v16' },
    { id: 'trash', name: 'Recently Deleted', icon: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }
  ];

  folderListEl.innerHTML = '';

  const activeNotes = notes.filter(n => !n.deleted);
  const deletedNotes = notes.filter(n => !!n.deleted);

  standard.forEach(f => {
    let count = 0;
    if (f.id === 'all') count = activeNotes.length;
    else if (f.id === 'trash') count = deletedNotes.length;
    else count = activeNotes.filter(n => (n.folderId || 'notes') === f.id).length;

    const el = document.createElement('div');
    el.className = `folder-item ${activeFolder === f.id ? 'active' : ''}`;
    el.dataset.id = f.id;
    el.innerHTML = `
      <div class="folder-item-left">
        <svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="${f.icon}"/></svg>
        <span>${escapeHtml(f.name)}</span>
      </div>
      <span class="folder-count">${count}</span>
    `;
    setupFolderEvents(el, f.id, false);
    folderListEl.appendChild(el);
  });

  folders.forEach(f => {
    const count = activeNotes.filter(n => n.folderId === f.id).length;
    const el = document.createElement('div');
    el.className = `folder-item ${activeFolder === f.id ? 'active' : ''}`;
    el.dataset.id = f.id;
    el.innerHTML = `
      <div class="folder-item-left">
        <svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h6l2 2h8v12H4z"/></svg>
        <span>${escapeHtml(f.name)}</span>
      </div>
      <span class="folder-count">${count}</span>
    `;
    setupFolderEvents(el, f.id, true);
    folderListEl.appendChild(el);
  });

  renderSidebarTags();
}

function setupFolderEvents(el, folderId, canManage) {
  el.addEventListener('click', () => {
    activeFolder = folderId;
    activeTagFilter = null;
    renderFolders();
    renderNotesList();
    ensureActiveNoteVisible();
  });

  if (canManage) {
    el.addEventListener('contextmenu', e => {
      e.preventDefault();
      contextFolderId = folderId;
      folderContextMenu.style.left = `${e.clientX}px`;
      folderContextMenu.style.top = `${e.clientY}px`;
      folderContextMenu.classList.remove('hidden');
    });
  }

  el.addEventListener('dragover', e => {
    e.preventDefault();
    el.classList.add('drag-over');
  });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('drag-over');
    if (draggedNoteId && folderId !== 'trash' && folderId !== 'all') {
      const n = notes.find(x => x.id === draggedNoteId);
      if (n) {
        n.folderId = folderId;
        n.updated = Date.now();
        saveNotesToDB();
        renderFolders();
        renderNotesList();
      }
    }
  });
}

function renderSidebarTags() {
  sidebarTagsEl.innerHTML = '';
  const tagCounts = {};
  notes.filter(n => !n.deleted).forEach(n => {
    (n.tags || []).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  Object.keys(tagCounts).sort().forEach(tag => {
    const pill = document.createElement('span');
    pill.className = `sidebar-tag-pill ${activeTagFilter === tag ? 'active' : ''}`;
    pill.textContent = `#${tag} (${tagCounts[tag]})`;
    pill.addEventListener('click', () => {
      activeTagFilter = activeTagFilter === tag ? null : tag;
      renderSidebarTags();
      renderNotesList();
    });
    sidebarTagsEl.appendChild(pill);
  });
}

newFolderBtn.addEventListener('click', () => {
  const name = prompt('New Folder Name:');
  if (name && name.trim()) {
    const id = 'f_' + Date.now().toString(36);
    folders.push({ id, name: name.trim() });
    setStoreItem('folders', folders);
    activeFolder = id;
    renderFolders();
    renderNotesList();
  }
});

ctxFolderRename.addEventListener('click', () => {
  folderContextMenu.classList.add('hidden');
  const f = folders.find(x => x.id === contextFolderId);
  if (!f) return;
  const name = prompt('Rename Folder:', f.name);
  if (name && name.trim()) {
    f.name = name.trim();
    setStoreItem('folders', folders);
    renderFolders();
  }
});

ctxFolderDelete.addEventListener('click', () => {
  folderContextMenu.classList.add('hidden');
  if (!confirm('Delete this folder? Notes inside will move to Notes.')) return;
  notes.forEach(n => {
    if (n.folderId === contextFolderId) n.folderId = 'notes';
  });
  folders = folders.filter(x => x.id !== contextFolderId);
  setStoreItem('folders', folders);
  saveNotesToDB();
  if (activeFolder === contextFolderId) activeFolder = 'notes';
  renderFolders();
  renderNotesList();
});

function getDateGroupLabel(ts) {
  const d = new Date(ts);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86400000;
  const start7Days = startToday - 6 * 86400000;
  const start30Days = startToday - 29 * 86400000;

  if (ts >= startToday) return 'Today';
  if (ts >= startYesterday) return 'Yesterday';
  if (ts >= start7Days) return 'Previous 7 Days';
  if (ts >= start30Days) return 'Previous 30 Days';

  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatRowDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' });
}

function getFilteredNotes() {
  const q = searchInput.value.trim().toLowerCase();
  let list = notes.filter(n => {
    if (activeFolder === 'trash') return !!n.deleted;
    if (n.deleted) return false;
    if (activeFolder !== 'all' && (n.folderId || 'notes') !== activeFolder) return false;
    if (activeTagFilter && !(n.tags || []).includes(activeTagFilter)) return false;
    if (q) {
      const hay = ((n.title || '') + ' ' + (n.text || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  list.sort((a, b) => {
    if (activeFolder !== 'trash') {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    }
    if (sortBy === 'created') return (b.created || 0) - (a.created || 0);
    if (sortBy === 'title') return (a.title || 'New Note').localeCompare(b.title || 'New Note');
    return (b.updated || 0) - (a.updated || 0);
  });

  return list;
}

function renderNotesList() {
  notesContainer.innerHTML = '';
  const list = getFilteredNotes();

  if (!list.length) {
    notesContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">No Notes</div>';
    return;
  }

  if (viewMode === 'gallery') {
    list.forEach(n => {
      const card = document.createElement('div');
      card.className = `gallery-card ${activeNoteId === n.id ? 'selected' : ''}`;
      card.draggable = true;
      card.addEventListener('dragstart', () => { draggedNoteId = n.id; });
      card.addEventListener('click', () => selectNote(n.id));
      card.addEventListener('contextmenu', e => openNoteContextMenu(e, n.id));

      const thumb = getFirstImage(n.html);
      let contentHtml = '';
      if (n.locked && !unlockedNotes.has(n.id)) {
        contentHtml = '<div style="display:flex;align-items:center;justify-content:center;height:70px;color:var(--accent);">🔒 Locked Note</div>';
      } else if (thumb) {
        contentHtml = `<img src="${thumb}" class="gallery-card-thumb" alt="Preview">`;
      } else {
        contentHtml = `<div class="gallery-card-preview">${escapeHtml(n.snippet || n.text || 'No text')}</div>`;
      }

      card.innerHTML = `
        ${contentHtml}
        <div class="gallery-card-footer">
          <div class="gallery-card-title">${escapeHtml(n.title || 'New Note')}</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${formatRowDate(n.updated || n.created)}</div>
        </div>
      `;
      notesContainer.appendChild(card);
    });
    return;
  }

  let currentGroup = '';
  list.forEach(n => {
    if (groupByDate && activeFolder !== 'trash') {
      let groupName = n.pinned ? 'Pinned' : getDateGroupLabel(n.updated || n.created);
      if (groupName !== currentGroup) {
        currentGroup = groupName;
        const h = document.createElement('div');
        h.className = 'section-header';
        h.textContent = currentGroup;
        notesContainer.appendChild(h);
      }
    }

    const row = document.createElement('div');
    row.className = `note-row ${activeNoteId === n.id ? 'selected' : ''}`;
    row.draggable = true;
    row.addEventListener('dragstart', () => { draggedNoteId = n.id; });
    row.addEventListener('click', () => selectNote(n.id));
    row.addEventListener('contextmenu', e => openNoteContextMenu(e, n.id));

    const thumb = getFirstImage(n.html);
    const dateStr = formatRowDate(n.updated || n.created);
    const isLocked = n.locked && !unlockedNotes.has(n.id);
    const preview = isLocked ? 'Locked Note' : (n.snippet || 'No additional text');

    row.innerHTML = `
      <div class="note-row-main">
        <div class="note-row-title">
          <span>${escapeHtml(n.title || 'New Note')}</span>
          ${n.locked ? '<span class="lock-badge">🔒</span>' : ''}
          ${n.pinned ? '<span class="pin-badge">📌</span>' : ''}
        </div>
        <div class="note-row-preview">
          <span class="note-row-date">${dateStr}</span>
          <span class="note-row-body-text">${escapeHtml(preview)}</span>
        </div>
      </div>
      ${thumb && !isLocked ? `<img src="${thumb}" class="note-row-thumb" alt="Thumb">` : ''}
    `;

    notesContainer.appendChild(row);
  });
}

function openNoteContextMenu(e, noteId) {
  e.preventDefault();
  contextNoteId = noteId;
  const n = notes.find(x => x.id === noteId);
  if (!n) return;

  ctxPin.textContent = n.pinned ? 'Unpin Note' : 'Pin Note';
  ctxLock.textContent = n.locked ? 'Remove Password...' : 'Lock Note...';

  contextMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 170)}px`;
  contextMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 200)}px`;
  contextMenu.classList.remove('hidden');
}

function selectNote(id) {
  activeNoteId = id;
  const n = notes.find(x => x.id === id);
  if (!n) {
    editor.innerHTML = '';
    dateHeader.textContent = '';
    trashAlert.classList.add('hidden');
    lockedPlaceholder.classList.add('hidden');
    return;
  }

  const d = new Date(n.updated || n.created);
  dateHeader.textContent = d.toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (n.deleted) {
    const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - (n.deletedAt || Date.now())) / 86400000));
    trashStatusText.textContent = `This note is in Recently Deleted. (${daysLeft} days left)`;
    trashAlert.classList.remove('hidden');
  } else {
    trashAlert.classList.add('hidden');
  }

  if (n.locked && !unlockedNotes.has(n.id)) {
    editor.classList.add('hidden');
    lockedPlaceholder.classList.remove('hidden');
    lockHintText.textContent = n.passwordHint ? `Hint: ${n.passwordHint}` : '';
    lockBtn.classList.add('active');
  } else {
    lockedPlaceholder.classList.add('hidden');
    editor.classList.remove('hidden');
    editor.innerHTML = n.html || '';
    lockBtn.classList.toggle('active', !!n.locked);
    highlightSearchMatches();
  }

  renderNotesList();
}

function ensureActiveNoteVisible() {
  const visible = getFilteredNotes();
  if (visible.length) {
    if (!visible.some(n => n.id === activeNoteId)) {
      selectNote(visible[0].id);
    }
  } else {
    activeNoteId = null;
    selectNote(null);
  }
}

function createNewNote() {
  const targetFolder = (activeFolder === 'trash' || activeFolder === 'all') ? 'notes' : activeFolder;
  const newNote = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
    folderId: targetFolder,
    html: '',
    text: '',
    title: 'New Note',
    snippet: '',
    tags: [],
    pinned: false,
    fav: false,
    color: 0,
    deleted: false,
    deletedAt: 0,
    created: Date.now(),
    updated: Date.now(),
    locked: false,
    encryptedData: null,
    passwordHint: null,
    salt: null,
    iv: null
  };

  notes.unshift(newNote);
  saveNotesToDB();
  renderFolders();
  renderNotesList();
  selectNote(newNote.id);
  editor.focus();
}

newNoteBtn.addEventListener('click', createNewNote);

deleteBtn.addEventListener('click', () => {
  if (!activeNoteId) return;
  deleteNoteById(activeNoteId);
});

function deleteNoteById(id) {
  const n = notes.find(x => x.id === id);
  if (!n) return;
  if (n.deleted) {
    if (confirm('Permanently delete this note?')) {
      notes = notes.filter(x => x.id !== id);
    }
  } else {
    n.deleted = true;
    n.deletedAt = Date.now();
  }
  saveNotesToDB();
  renderFolders();
  renderNotesList();
  ensureActiveNoteVisible();
}

restoreTrashBtn.addEventListener('click', () => {
  const n = notes.find(x => x.id === activeNoteId);
  if (n) {
    n.deleted = false;
    n.deletedAt = 0;
    n.updated = Date.now();
    saveNotesToDB();
    renderFolders();
    renderNotesList();
    selectNote(n.id);
  }
});

deleteForeverBtn.addEventListener('click', () => {
  if (!activeNoteId) return;
  deleteNoteById(activeNoteId);
});

function saveNotesToDB() {
  setStoreItem('notes', notes);
}

function triggerAutosave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const n = notes.find(x => x.id === activeNoteId);
    if (!n || n.locked && !unlockedNotes.has(n.id)) return;

    n.html = editor.innerHTML;
    n.text = editor.innerText.trim();
    const parsed = parseNoteContent(n.html, n.text);
    n.title = parsed.title;
    n.snippet = parsed.snippet;
    n.tags = extractTags(n.text);
    n.updated = Date.now();

    const d = new Date(n.updated);
    dateHeader.textContent = d.toLocaleDateString(undefined, {
      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    saveNotesToDB();
    renderNotesList();
    renderSidebarTags();
  }, 400);
}

editor.addEventListener('input', () => {
  handleAutoMarkdown();
  triggerAutosave();
});

function handleAutoMarkdown() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const node = sel.anchorNode;
  if (!node || node.nodeType !== 3) return;

  const text = node.textContent;
  const offset = sel.anchorOffset;

  if (text.startsWith('- ') && offset === 2) {
    node.textContent = text.slice(2);
    document.execCommand('insertUnorderedList');
  } else if (text.startsWith('1. ') && offset === 3) {
    node.textContent = text.slice(3);
    document.execCommand('insertOrderedList');
  } else if ((text.startsWith('[] ') || text.startsWith('[ ] ')) && offset >= 3) {
    node.textContent = text.replace(/^\[ ?\]\s*/, '');
    insertChecklist();
  } else if (text.startsWith('# ') && offset === 2) {
    node.textContent = text.slice(2);
    document.execCommand('formatBlock', false, 'h2');
  }
}

function insertChecklist() {
  const html = '<ul class="todo-list"><li class="todo-item"><input type="checkbox"><span>&nbsp;</span></li></ul><p><br></p>';
  document.execCommand('insertHTML', false, html);
  triggerAutosave();
}

checklistBtn.addEventListener('click', insertChecklist);
popChecklistBtn.addEventListener('click', () => {
  formatPopover.classList.add('hidden');
  insertChecklist();
});

editor.addEventListener('change', e => {
  if (e.target.matches('.todo-item input[type="checkbox"]')) {
    const item = e.target.closest('.todo-item');
    if (e.target.checked) {
      e.target.setAttribute('checked', 'checked');
      item.classList.add('checked');
      if (moveCheckedToBottom) {
        const ul = item.closest('.todo-list');
        if (ul) ul.appendChild(item);
      }
    } else {
      e.target.removeAttribute('checked');
      item.classList.remove('checked');
    }
    triggerAutosave();
  }
});

editor.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const node = sel.anchorNode;
    const item = node ? (node.nodeType === 1 ? node : node.parentElement).closest('.todo-item') : null;
    if (item) {
      e.preventDefault();
      const span = item.querySelector('span');
      const text = span ? span.textContent.replace(/\u00a0/g, ' ').trim() : '';
      if (!text) {
        const ul = item.closest('.todo-list');
        item.remove();
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        if (ul && ul.parentNode) ul.parentNode.insertBefore(p, ul.nextSibling);
        else editor.appendChild(p);
        const r = document.createRange();
        r.setStart(p, 0);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      } else {
        const newItem = document.createElement('li');
        newItem.className = 'todo-item';
        newItem.innerHTML = '<input type="checkbox"><span>&nbsp;</span>';
        item.parentNode.insertBefore(newItem, item.nextSibling);
        const r = document.createRange();
        r.selectNodeContents(newItem.querySelector('span'));
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      triggerAutosave();
      return;
    }
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const node = sel.anchorNode;
    const li = node ? (node.nodeType === 1 ? node : node.parentElement).closest('li') : null;
    if (li) {
      if (e.shiftKey) document.execCommand('outdent');
      else document.execCommand('indent');
    } else {
      document.execCommand('insertText', false, '    ');
    }
    triggerAutosave();
  }
});

editor.addEventListener('paste', e => {
  const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
  let hasImage = false;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          hasImage = true;
        }
      }
    }
  }
  if (hasImage) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  document.execCommand('insertText', false, text);
});

editor.addEventListener('dragover', e => e.preventDefault());
editor.addEventListener('drop', e => {
  if (e.dataTransfer?.files?.length) {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(handleIncomingFile);
  }
});

tableBtn.addEventListener('click', () => {
  let table = '<table class="apple-table"><tbody>';
  for (let r = 0; r < 3; r++) {
    table += '<tr><td><br></td><td><br></td><td><br></td></tr>';
  }
  table += '</tbody></table><p><br></p>';
  document.execCommand('insertHTML', false, table);
  triggerAutosave();
});

attachBtn.addEventListener('click', () => imageFileInput.click());
imageFileInput.addEventListener('change', () => {
  Array.from(imageFileInput.files).forEach(handleIncomingFile);
  imageFileInput.value = '';
});

function handleIncomingFile(f) {
  if (f.type === 'application/pdf') openPdf(f);
  else if (f.type.startsWith('image/')) processImageFile(f);
}

function processImageFile(file) {
  const reader = new FileReader();
  const isGifSvg = file.type === 'image/gif' || file.type === 'image/svg+xml';
  const isPng = file.type === 'image/png';

  reader.onload = e => {
    const dataUrl = e.target.result;
    if (isGifSvg) {
      insertImageToEditor(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const maxDim = 1400;
      let w = img.width, h = img.height;
      if (w <= maxDim && h <= maxDim && isPng) {
        insertImageToEditor(dataUrl);
        return;
      }
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const outUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.85);
      insertImageToEditor(outUrl);
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

function insertImageToEditor(src, meta = null) {
  editor.focus();
  const attr = meta ? ` data-draw="1" data-w="${meta.w}" data-h="${meta.h}"${meta.pdf ? ' data-pdf="1"' : ''}` : '';
  const html = `<img src="${src}"${attr} style="max-width:100%; height:auto;" alt="Image"><p><br></p>`;
  document.execCommand('insertHTML', false, html);
  triggerAutosave();
}

editor.addEventListener('click', e => {
  if (e.target.tagName === 'IMG') {
    if (selectedImage) selectedImage.classList.remove('selected-img');
    selectedImage = e.target;
    selectedImage.classList.add('selected-img');
    positionImgToolbar(selectedImage);
  } else {
    deselectImage();
  }
});

function deselectImage() {
  if (selectedImage) {
    selectedImage.classList.remove('selected-img');
    selectedImage = null;
  }
  imgToolbar.classList.add('hidden');
}

function positionImgToolbar(img) {
  const rect = img.getBoundingClientRect();
  const scrollRect = editorScroll.getBoundingClientRect();
  imgToolbar.classList.remove('hidden');
  const top = rect.top - scrollRect.top + editorScroll.scrollTop - 40;
  const left = rect.left - scrollRect.left + editorScroll.scrollLeft;
  imgToolbar.style.top = `${Math.max(8, top)}px`;
  imgToolbar.style.left = `${Math.max(8, left)}px`;
  imgEditSketchBtn.classList.toggle('hidden', img.getAttribute('data-draw') !== '1');
}

document.querySelectorAll('.img-btn-size').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (!selectedImage) return;
    selectedImage.style.width = btn.dataset.size;
    selectedImage.style.height = 'auto';
    positionImgToolbar(selectedImage);
    triggerAutosave();
  });
});

imgDeleteBtn.addEventListener('click', e => {
  e.stopPropagation();
  if (selectedImage) {
    selectedImage.remove();
    deselectImage();
    triggerAutosave();
  }
});

formatBtn.addEventListener('click', e => {
  e.stopPropagation();
  togglePopover(formatPopover, formatBtn);
});

document.querySelectorAll('.pop-style-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    formatPopover.classList.add('hidden');
    document.execCommand('formatBlock', false, btn.dataset.block);
    triggerAutosave();
  });
});

document.querySelectorAll('.pop-fmt-btn, .pop-list-btn[data-cmd], .pop-act-btn[data-cmd]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.execCommand(btn.dataset.cmd);
    triggerAutosave();
  });
});

dashedListBtn.addEventListener('click', () => {
  formatPopover.classList.add('hidden');
  document.execCommand('insertUnorderedList');
  const sel = window.getSelection();
  if (sel?.anchorNode) {
    const ul = (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement).closest('ul');
    if (ul) ul.classList.add('dashed-list');
  }
  triggerAutosave();
});

popQuoteBtn.addEventListener('click', () => {
  formatPopover.classList.add('hidden');
  document.execCommand('formatBlock', false, 'blockquote');
  triggerAutosave();
});

moveCheckedBottomOpt.addEventListener('change', () => {
  moveCheckedToBottom = moveCheckedBottomOpt.checked;
  setStoreItem('moveCheckedToBottom', moveCheckedToBottom);
});

shareBtn.addEventListener('click', e => {
  e.stopPropagation();
  togglePopover(sharePopover, shareBtn);
});

listSortBtn.addEventListener('click', e => {
  e.stopPropagation();
  togglePopover(sortPopover, listSortBtn);
});

document.querySelectorAll('#sort-popover [data-sort]').forEach(btn => {
  btn.addEventListener('click', () => {
    sortBy = btn.dataset.sort;
    sortPopover.classList.add('hidden');
    renderNotesList();
  });
});

groupDatesToggle.addEventListener('change', () => {
  groupByDate = groupDatesToggle.checked;
  renderNotesList();
});

exportHtmlBtn.addEventListener('click', () => {
  sharePopover.classList.add('hidden');
  const n = notes.find(x => x.id === activeNoteId);
  if (!n) return;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(n.title)}</title><style>body{font-family:-apple-system,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;} img{max-width:100%;}</style></head><body>${n.html}</body></html>`;
  downloadFile(`${n.title || 'note'}.html`, 'text/html', html);
});

exportTextBtn.addEventListener('click', () => {
  sharePopover.classList.add('hidden');
  const n = notes.find(x => x.id === activeNoteId);
  if (!n) return;
  downloadFile(`${n.title || 'note'}.txt`, 'text/plain', `${n.title}\n\n${n.text}`);
});

exportPdfBtn.addEventListener('click', () => {
  sharePopover.classList.add('hidden');
  window.print();
});

backupBtn.addEventListener('click', () => {
  sharePopover.classList.add('hidden');
  const json = JSON.stringify({ notes, folders }, null, 2);
  downloadFile(`apple_notes_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json', json);
});

restoreBtn.addEventListener('click', () => {
  sharePopover.classList.add('hidden');
  restoreFileInput.click();
});

restoreFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data)) {
        mergeNotes(data);
      } else if (data && Array.isArray(data.notes)) {
        mergeNotes(data.notes);
        if (Array.isArray(data.folders)) {
          data.folders.forEach(f => {
            if (!folders.some(x => x.id === f.id)) folders.push(f);
          });
          setStoreItem('folders', folders);
        }
      }
      saveNotesToDB();
      renderFolders();
      renderNotesList();
      ensureActiveNoteVisible();
    } catch (_) {}
    restoreFileInput.value = '';
  };
  reader.readAsText(file);
});

function mergeNotes(arr) {
  arr.forEach(n => {
    const idx = notes.findIndex(x => x.id === n.id);
    if (idx !== -1) notes[idx] = { ...notes[idx], ...n };
    else notes.push(n);
  });
}

function downloadFile(name, type, content) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

function togglePopover(pop, anchor) {
  const isHidden = pop.classList.contains('hidden');
  closeAllPopovers();
  if (isHidden) {
    const rect = anchor.getBoundingClientRect();
    pop.style.top = `${rect.bottom + 6}px`;
    pop.style.left = `${Math.min(rect.left, window.innerWidth - 220)}px`;
    pop.classList.remove('hidden');
  }
}

function closeAllPopovers() {
  formatPopover.classList.add('hidden');
  sharePopover.classList.add('hidden');
  sortPopover.classList.add('hidden');
  contextMenu.classList.add('hidden');
  folderContextMenu.classList.add('hidden');
  wordCountPopover.classList.add('hidden');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.popover') && !e.target.closest('.tb-btn') && !e.target.closest('.sort-menu-btn')) {
    closeAllPopovers();
  }
});

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buf) {
  const bin = String.fromCharCode(...new Uint8Array(buf));
  return btoa(bin);
}

function base64ToBuffer(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function lockNote(note) {
  const pass = prompt('Set password to lock this note:');
  if (!pass) return;
  const hint = prompt('Password hint (optional):') || '';
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(note.html || ''));

  note.locked = true;
  note.passwordHint = hint;
  note.salt = bufferToBase64(salt);
  note.iv = bufferToBase64(iv);
  note.encryptedData = bufferToBase64(encrypted);
  note.html = '';
  note.text = 'Locked Note';
  note.snippet = '';
  unlockedNotes.delete(note.id);
  saveNotesToDB();
  selectNote(note.id);
}

async function unlockNote(note) {
  const pass = prompt(`Enter password${note.passwordHint ? ` (Hint: ${note.passwordHint})` : ''}:`);
  if (!pass) return;
  try {
    const salt = new Uint8Array(base64ToBuffer(note.salt));
    const iv = new Uint8Array(base64ToBuffer(note.iv));
    const cipher = base64ToBuffer(note.encryptedData);
    const key = await deriveKey(pass, salt);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    const dec = new TextDecoder();
    note.html = dec.decode(decrypted);
    const parsed = parseNoteContent(note.html, editor.innerText);
    note.text = parsed.snippet;
    unlockedNotes.add(note.id);
    selectNote(note.id);
  } catch (_) {
    alert('Incorrect password.');
  }
}

lockBtn.addEventListener('click', () => {
  const n = notes.find(x => x.id === activeNoteId);
  if (!n) return;
  if (!n.locked) {
    lockNote(n);
  } else {
    if (unlockedNotes.has(n.id)) {
      unlockedNotes.delete(n.id);
      selectNote(n.id);
    } else {
      unlockNote(n);
    }
  }
});

unlockBtn.addEventListener('click', () => {
  const n = notes.find(x => x.id === activeNoteId);
  if (n && n.locked) unlockNote(n);
});

ctxPin.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
  const n = notes.find(x => x.id === contextNoteId);
  if (n) {
    n.pinned = !n.pinned;
    saveNotesToDB();
    renderNotesList();
  }
});

ctxMove.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
  const n = notes.find(x => x.id === contextNoteId);
  if (!n) return;
  const folderNames = folders.map(f => f.name).join(', ');
  const target = prompt(`Enter folder name (Notes, ${folderNames}):`);
  if (!target) return;
  if (target.toLowerCase() === 'notes') {
    n.folderId = 'notes';
  } else {
    const found = folders.find(f => f.name.toLowerCase() === target.toLowerCase());
    if (found) n.folderId = found.id;
    else alert('Folder not found.');
  }
  saveNotesToDB();
  renderFolders();
  renderNotesList();
});

ctxDuplicate.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
  const n = notes.find(x => x.id === contextNoteId);
  if (!n) return;
  const dup = {
    ...n,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
    title: n.title + ' Copy',
    created: Date.now(),
    updated: Date.now()
  };
  notes.unshift(dup);
  saveNotesToDB();
  renderNotesList();
  selectNote(dup.id);
});

ctxLock.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
  const n = notes.find(x => x.id === contextNoteId);
  if (!n) return;
  if (!n.locked) lockNote(n);
  else {
    if (confirm('Remove password from this note?')) {
      if (unlockedNotes.has(n.id)) {
        n.locked = false;
        n.encryptedData = null;
        n.passwordHint = null;
        saveNotesToDB();
        selectNote(n.id);
      } else {
        unlockNote(n).then(() => {
          if (unlockedNotes.has(n.id)) {
            n.locked = false;
            n.encryptedData = null;
            n.passwordHint = null;
            saveNotesToDB();
            selectNote(n.id);
          }
        });
      }
    }
  }
});

ctxExport.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
  const n = notes.find(x => x.id === contextNoteId);
  if (n) downloadFile(`${n.title || 'note'}.html`, 'text/html', n.html);
});

ctxDelete.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
  deleteNoteById(contextNoteId);
});

findToggleBtn.addEventListener('click', () => {
  findBar.classList.toggle('hidden');
  if (!findBar.classList.contains('hidden')) {
    findInput.focus();
    findInput.select();
  }
});

findCloseBtn.addEventListener('click', () => {
  findBar.classList.add('hidden');
  clearSearchHighlight();
});

findInput.addEventListener('input', () => {
  doFind(findInput.value);
});

findNextBtn.addEventListener('click', () => {
  if (findInput.value) window.find(findInput.value, false, false, true);
});

findPrevBtn.addEventListener('click', () => {
  if (findInput.value) window.find(findInput.value, false, true, true);
});

function doFind(q) {
  if (!q) {
    findCount.textContent = '0 of 0';
    return;
  }
  const text = editor.innerText;
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = text.match(regex);
  const count = matches ? matches.length : 0;
  findCount.textContent = count ? `1 of ${count}` : '0 of 0';
  window.find(q, false, false, true);
}

searchInput.addEventListener('input', () => {
  renderNotesList();
  highlightSearchMatches();
});

function highlightSearchMatches() {
  const q = searchInput.value.trim();
  if (!q || !editor || editor.classList.contains('hidden')) return;
  // Non-destructive search visualization if supported
}

function clearSearchHighlight() {
  const marks = editor.querySelectorAll('.search-match-highlight');
  marks.forEach(m => {
    const parent = m.parentNode;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    m.remove();
  });
}

dateHeader.addEventListener('contextmenu', e => {
  e.preventDefault();
  const text = editor.innerText.trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const paras = text ? text.split(/\n+/).filter(Boolean).length : 0;
  const mins = Math.ceil(words / 200);

  wcWords.textContent = words;
  wcChars.textContent = chars;
  wcParas.textContent = paras;
  wcRead.textContent = `~${mins} min`;

  wordCountPopover.style.top = `${e.clientY + 10}px`;
  wordCountPopover.style.left = `${Math.min(e.clientX, window.innerWidth - 180)}px`;
  wordCountPopover.classList.remove('hidden');
});

function paintBase() {
  dCtx.setTransform(1, 0, 0, 1, 0, 0);
  dCtx.globalAlpha = 1;
  dCtx.globalCompositeOperation = 'source-over';
  dCtx.fillStyle = '#FFFFFF';
  dCtx.fillRect(0, 0, dCanvas.width, dCanvas.height);
  if (bgLayer) dCtx.drawImage(bgLayer, 0, 0, dCanvas.width, dCanvas.height);
  dCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function setupCanvas(w, h, bg) {
  cW = w;
  cH = h;
  bgLayer = bg || null;
  dCanvas.width = Math.round(w * DPR);
  dCanvas.height = Math.round(h * DPR);
  dCanvas.style.width = `${w}px`;
  dCanvas.style.height = `${h}px`;
  paintBase();
  dCtx.imageSmoothingQuality = 'high';
  eraserPattern = null;
  if (bgLayer) {
    eraserPattern = dCtx.createPattern(bgLayer, 'no-repeat');
    const bw = bgLayer.naturalWidth || bgLayer.width;
    const bh = bgLayer.naturalHeight || bgLayer.height;
    eraserPattern.setTransform(new DOMMatrix().scale(w / bw, h / bh));
  }
  dHistory = [];
  dRedoStack = [];
  saveDiagramState();
}

function initCanvas() {
  pdfPages = [];
  updatePdfNav();
  drawTitle.textContent = 'Sketch';
  setupCanvas(1000, 600, null);
}

function saveDiagramState() {
  const max = Math.max(8, Math.min(40, Math.floor(3e8 / (dCanvas.width * dCanvas.height * 4))));
  while (dHistory.length >= max) dHistory.shift();
  dHistory.push(dCtx.getImageData(0, 0, dCanvas.width, dCanvas.height));
  dRedoStack = [];
}

function getCanvasCoords(e) {
  const rect = dCanvas.getBoundingClientRect();
  let press = 0.5;
  if (e.pressure !== undefined && e.pressure > 0) {
    press = e.pressure;
  }
  return {
    x: (e.clientX - rect.left) * (cW / rect.width),
    y: (e.clientY - rect.top) * (cH / rect.height),
    pressure: press,
    pointerType: e.pointerType || 'mouse'
  };
}

function applyPenStyle(tool, baseSize, color, pressure) {
  dCtx.lineCap = 'round';
  dCtx.lineJoin = 'round';
  dCtx.globalCompositeOperation = 'source-over';

  if (tool === 'eraser') {
    dCtx.strokeStyle = eraserPattern || '#FFFFFF';
    dCtx.fillStyle = eraserPattern || '#FFFFFF';
    dCtx.lineWidth = baseSize * 4;
    dCtx.globalAlpha = 1.0;
  } else if (tool === 'highlighter') {
    dCtx.strokeStyle = color;
    dCtx.fillStyle = color;
    dCtx.lineWidth = baseSize * 3.5;
    dCtx.globalAlpha = 0.4;
    dCtx.globalCompositeOperation = 'multiply';
    dCtx.lineCap = 'square';
    dCtx.lineJoin = 'miter';
  } else if (tool === 'pencil') {
    dCtx.strokeStyle = color;
    dCtx.fillStyle = color;
    dCtx.lineWidth = Math.max(1, baseSize * (0.6 + 0.6 * pressure));
    dCtx.globalAlpha = Math.min(0.7, 0.25 + 0.45 * pressure);
  } else if (tool === 'fountain') {
    dCtx.strokeStyle = color;
    dCtx.fillStyle = color;
    dCtx.lineWidth = Math.max(1, baseSize * (0.2 + 2.0 * Math.pow(pressure, 1.3)));
    dCtx.globalAlpha = 1.0;
  } else if (tool === 'brush') {
    dCtx.strokeStyle = color;
    dCtx.fillStyle = color;
    dCtx.lineWidth = Math.max(1, baseSize * (0.25 + 2.2 * pressure));
    dCtx.globalAlpha = 0.88;
  } else {
    dCtx.strokeStyle = color;
    dCtx.fillStyle = color;
    dCtx.lineWidth = Math.max(1, baseSize * (0.55 + 0.9 * pressure));
    dCtx.globalAlpha = 1.0;
  }
}

document.querySelectorAll('.d-tool').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.d-tool').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    dTool = btn.dataset.tool;
  });
});

dCanvas.addEventListener('pointerdown', e => {
  dCanvas.setPointerCapture(e.pointerId);
  isDrawing = true;
  const p = getCanvasCoords(e);
  startX = p.x;
  startY = p.y;
  strokePoints = [{ x: p.x, y: p.y, p: p.pressure }];

  const color = drawColor.value;
  const size = parseInt(drawSize.value, 10) || 3;

  if (dTool === 'text') {
    const t = prompt('Enter text:');
    if (t) {
      dCtx.fillStyle = color;
      dCtx.font = `${Math.max(16, size * 4)}px -apple-system, sans-serif`;
      dCtx.fillText(t, startX, startY);
      saveDiagramState();
    }
    isDrawing = false;
    return;
  }

  dragSnapshot = dCtx.getImageData(0, 0, dCanvas.width, dCanvas.height);

  if (PEN_TOOLS.has(dTool)) {
    applyPenStyle(dTool, size, color, p.pressure);
    dCtx.beginPath();
    dCtx.arc(p.x, p.y, Math.max(0.5, dCtx.lineWidth / 2), 0, Math.PI * 2);
    dCtx.fill();
  }
});

dCanvas.addEventListener('pointermove', e => {
  if (!isDrawing) return;

  if (PEN_TOOLS.has(dTool)) {
    const events = (e.getCoalescedEvents && e.getCoalescedEvents().length)
      ? e.getCoalescedEvents()
      : [e];

    const baseSize = parseInt(drawSize.value, 10) || 3;
    const color = drawColor.value;
    const isSmooth = !drawSmooth || drawSmooth.checked;
    const smoothFactor = isSmooth ? 0.55 : 0;

    for (let i = 0; i < events.length; i++) {
      const raw = getCanvasCoords(events[i]);
      const prev = strokePoints[strokePoints.length - 1];
      const dist = Math.hypot(raw.x - prev.x, raw.y - prev.y);
      if (dist < 0.5) continue;

      const curX = prev.x + (raw.x - prev.x) * (1 - smoothFactor);
      const curY = prev.y + (raw.y - prev.y) * (1 - smoothFactor);
      const curP = prev.p * 0.7 + raw.pressure * 0.3;
      const cur = { x: curX, y: curY, p: curP };
      strokePoints.push(cur);

      if (strokePoints.length >= 3) {
        const p0 = strokePoints[strokePoints.length - 3];
        const p1 = strokePoints[strokePoints.length - 2];
        const p2 = strokePoints[strokePoints.length - 1];

        const m1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
        const m2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        applyPenStyle(dTool, baseSize, color, p1.p);
        dCtx.beginPath();
        dCtx.moveTo(m1.x, m1.y);
        dCtx.quadraticCurveTo(p1.x, p1.y, m2.x, m2.y);
        dCtx.stroke();
      }
    }
    return;
  }

  const p = getCanvasCoords(e);
  dCtx.putImageData(dragSnapshot, 0, 0);
  dCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawShape(startX, startY, p.x, p.y);
});

dCanvas.addEventListener('pointerup', e => {
  if (!isDrawing) return;
  isDrawing = false;
  const p = getCanvasCoords(e);

  if (PEN_TOOLS.has(dTool)) {
    const baseSize = parseInt(drawSize.value, 10) || 3;
    const color = drawColor.value;

    if (strokePoints.length >= 2) {
      const p1 = strokePoints[strokePoints.length - 2];
      const p2 = strokePoints[strokePoints.length - 1];
      const m = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      applyPenStyle(dTool, baseSize, color, p2.p);
      dCtx.beginPath();
      dCtx.moveTo(m.x, m.y);
      dCtx.lineTo(p2.x, p2.y);
      dCtx.stroke();
    }
    strokePoints = [];
    dCtx.globalAlpha = 1.0;
    dCtx.globalCompositeOperation = 'source-over';
  } else if (dTool !== 'text') {
    dCtx.putImageData(dragSnapshot, 0, 0);
    dCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawShape(startX, startY, p.x, p.y);
  }
  saveDiagramState();
});

dCanvas.addEventListener('pointercancel', () => {
  if (isDrawing && dragSnapshot && !PEN_TOOLS.has(dTool)) {
    dCtx.putImageData(dragSnapshot, 0, 0);
    dCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  isDrawing = false;
  strokePoints = [];
  dCtx.globalAlpha = 1.0;
  dCtx.globalCompositeOperation = 'source-over';
});

function drawShape(x1, y1, x2, y2) {
  const color = drawColor.value;
  const size = parseInt(drawSize.value, 10) || 3;
  const fill = drawFill.checked;

  dCtx.globalAlpha = 1.0;
  dCtx.globalCompositeOperation = 'source-over';
  dCtx.lineWidth = size;
  dCtx.strokeStyle = color;
  dCtx.fillStyle = color + '33';
  dCtx.lineCap = 'round';
  dCtx.lineJoin = 'round';

  if (dTool === 'line') {
    dCtx.beginPath();
    dCtx.moveTo(x1, y1);
    dCtx.lineTo(x2, y2);
    dCtx.stroke();
  } else if (dTool === 'arrow') {
    dCtx.beginPath();
    dCtx.moveTo(x1, y1);
    dCtx.lineTo(x2, y2);
    dCtx.stroke();
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = Math.max(12, size * 3);
    dCtx.beginPath();
    dCtx.moveTo(x2, y2);
    dCtx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
    dCtx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
    dCtx.closePath();
    dCtx.fillStyle = color;
    dCtx.fill();
  } else if (dTool === 'box') {
    const rx = Math.min(x1, x2), ry = Math.min(y1, y2), rw = Math.abs(x2 - x1), rh = Math.abs(y2 - y1);
    if (fill) dCtx.fillRect(rx, ry, rw, rh);
    dCtx.strokeRect(rx, ry, rw, rh);
  } else if (dTool === 'oval') {
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2;
    dCtx.beginPath();
    dCtx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
    if (fill) dCtx.fill();
    dCtx.stroke();
  } else if (dTool === 'diamond') {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    dCtx.beginPath();
    dCtx.moveTo(mx, y1);
    dCtx.lineTo(x2, my);
    dCtx.lineTo(mx, y2);
    dCtx.lineTo(x1, my);
    dCtx.closePath();
    if (fill) dCtx.fill();
    dCtx.stroke();
  }
}

drawGridBtn.addEventListener('click', () => dCanvas.classList.toggle('grid'));
drawUndoBtn.addEventListener('click', () => {
  if (dHistory.length > 1) {
    dRedoStack.push(dHistory.pop());
    dCtx.putImageData(dHistory[dHistory.length - 1], 0, 0);
  }
});
drawRedoBtn.addEventListener('click', () => {
  if (dRedoStack.length) {
    const s = dRedoStack.pop();
    dHistory.push(s);
    dCtx.putImageData(s, 0, 0);
  }
});
drawClearBtn.addEventListener('click', () => {
  paintBase();
  saveDiagramState();
});

diagramBtn.addEventListener('click', () => {
  editingImage = null;
  initCanvas();
  diagramModal.classList.remove('hidden');
});

drawCloseBtn.addEventListener('click', () => diagramModal.classList.add('hidden'));

drawInsertBtn.addEventListener('click', async () => {
  if (pdfPages.length) {
    drawTitle.textContent = 'Inserting…';
    const pages = await exportPdfPages();
    diagramModal.classList.add('hidden');
    pages.forEach(p => insertImageToEditor(p.url, { w: p.w, h: p.h, pdf: true }));
    pdfPages = [];
    updatePdfNav();
    drawTitle.textContent = 'Sketch';
    triggerAutosave();
    return;
  }
  const isJpeg = editingImage && editingImage.src.startsWith('data:image/jpeg');
  const url = isJpeg ? dCanvas.toDataURL('image/jpeg', 0.85) : dCanvas.toDataURL('image/png');
  if (editingImage) {
    editingImage.src = url;
    editingImage.dataset.w = cW;
    editingImage.dataset.h = cH;
    editingImage = null;
  } else {
    insertImageToEditor(url, { w: cW, h: cH });
  }
  diagramModal.classList.add('hidden');
  triggerAutosave();
});

imgEditSketchBtn.addEventListener('click', () => {
  if (!selectedImage) return;
  const target = selectedImage;
  const w = parseInt(target.dataset.w, 10) || 1000;
  const h = parseInt(target.dataset.h, 10) || 600;
  const isPdf = target.dataset.pdf === '1';
  const img = new Image();
  img.onload = () => {
    editingImage = target;
    pdfPages = [];
    updatePdfNav();
    drawTitle.textContent = isPdf ? 'PDF page' : 'Sketch';
    setupCanvas(w, h, isPdf ? img : null);
    if (!isPdf) {
      dCtx.drawImage(img, 0, 0, w, h);
      dHistory = [];
      saveDiagramState();
    }
    diagramModal.classList.remove('hidden');
  };
  img.src = target.src;
});

document.querySelectorAll('.d-swatch').forEach(s => {
  s.addEventListener('click', () => {
    drawColor.value = s.dataset.color;
    markSwatch();
  });
});
drawColor.addEventListener('input', markSwatch);

function markSwatch() {
  const v = drawColor.value.toLowerCase();
  document.querySelectorAll('.d-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === v));
}

drawPdfBtn.addEventListener('click', () => pdfFileInput.click());
pdfFileInput.addEventListener('change', () => {
  const f = pdfFileInput.files[0];
  if (f) openPdf(f);
  pdfFileInput.value = '';
});
pdfPrevBtn.addEventListener('click', () => goPdfPage(pdfIndex - 1));
pdfNextBtn.addEventListener('click', () => goPdfPage(pdfIndex + 1));

async function loadPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import(PDFJS_BASE + 'pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + 'pdf.worker.min.mjs';
  }
  return pdfjsLib;
}

async function openPdf(file) {
  editingImage = null;
  drawTitle.textContent = 'Loading PDF…';
  diagramModal.classList.remove('hidden');
  pdfBusy = true;
  try {
    const lib = await loadPdfJs();
    const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    pdfPages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const vp = page.getViewport({ scale: 1 });
      const scale = 1000 / vp.width;
      pdfPages.push({ page, scale, w: 1000, h: Math.round(vp.height * scale), bg: null, state: null });
    }
    await showPdfPage(0, false);
    drawTitle.textContent = file.name;
  } catch (err) {
    pdfPages = [];
    updatePdfNav();
    drawTitle.textContent = 'Sketch';
    alert('Could not open this PDF. An internet connection is needed the first time to load the PDF viewer.');
  }
  pdfBusy = false;
}

async function renderPdfBg(pg) {
  if (pg.bg) return pg.bg;
  const c = document.createElement('canvas');
  c.width = Math.round(pg.w * DPR);
  c.height = Math.round(pg.h * DPR);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, c.width, c.height);
  await pg.page.render({ canvasContext: ctx, viewport: pg.page.getViewport({ scale: pg.scale * DPR }) }).promise;
  pg.bg = c;
  return c;
}

function storePdfPage(release = true) {
  const pg = pdfPages[pdfIndex];
  if (!pg || !pg.bg) return;
  pg.state = dCtx.getImageData(0, 0, dCanvas.width, dCanvas.height);
  if (release) pg.bg = null;
}

async function showPdfPage(i, store = true) {
  if (store) storePdfPage();
  pdfIndex = i;
  const pg = pdfPages[i];
  setupCanvas(pg.w, pg.h, await renderPdfBg(pg));
  if (pg.state) {
    dCtx.putImageData(pg.state, 0, 0);
    dHistory = [];
    saveDiagramState();
  }
  canvasViewport.scrollTop = 0;
  updatePdfNav();
}

async function goPdfPage(i) {
  if (pdfBusy || i < 0 || i >= pdfPages.length) return;
  pdfBusy = true;
  await showPdfPage(i);
  pdfBusy = false;
}

function updatePdfNav() {
  pdfNav.classList.toggle('hidden', pdfPages.length < 2);
  pdfPageLabel.textContent = `${pdfIndex + 1} / ${pdfPages.length}`;
  pdfPrevBtn.disabled = pdfIndex <= 0;
  pdfNextBtn.disabled = pdfIndex >= pdfPages.length - 1;
}

async function exportPdfPages() {
  storePdfPage(false);
  const out = [];
  for (const pg of pdfPages) {
    let src;
    if (pg.state) {
      src = document.createElement('canvas');
      src.width = pg.state.width;
      src.height = pg.state.height;
      src.getContext('2d').putImageData(pg.state, 0, 0);
    } else {
      src = await renderPdfBg(pg);
    }
    out.push({ url: src.toDataURL('image/jpeg', 0.85), w: pg.w, h: pg.h });
    pg.bg = null;
  }
  return out;
}

document.addEventListener('keydown', e => {
  const isCmd = e.metaKey || e.ctrlKey;

  if (isCmd && !e.shiftKey && (e.key === 'n' || e.key === 'N')) {
    e.preventDefault();
    createNewNote();
  } else if (isCmd && e.shiftKey && (e.key === 'n' || e.key === 'N')) {
    e.preventDefault();
    newFolderBtn.click();
  } else if (isCmd && (e.key === 'f' || e.key === 'F')) {
    if (e.altKey) {
      e.preventDefault();
      searchInput.focus();
    } else {
      e.preventDefault();
      findToggleBtn.click();
    }
  } else if (isCmd && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault();
    insertChecklist();
  } else if (isCmd && e.shiftKey && (e.key === 't' || e.key === 'T')) {
    e.preventDefault();
    document.execCommand('formatBlock', false, 'h1');
  } else if (isCmd && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
    e.preventDefault();
    document.execCommand('formatBlock', false, 'h2');
  } else if (isCmd && e.shiftKey && (e.key === 'b' || e.key === 'B')) {
    e.preventDefault();
    document.execCommand('formatBlock', false, 'h3');
  } else if (isCmd && e.shiftKey && (e.key === 'm' || e.key === 'M')) {
    e.preventDefault();
    document.execCommand('formatBlock', false, 'pre');
  } else if (isCmd && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    triggerAutosave();
  } else if (e.key === 'Escape') {
    closeAllPopovers();
    diagramModal.classList.add('hidden');
    findBar.classList.add('hidden');
    deselectImage();
  } else if (e.key === 'Backspace' && activeNoteId && diagramModal.classList.contains('hidden') && document.activeElement !== editor && document.activeElement !== searchInput && document.activeElement !== findInput) {
    e.preventDefault();
    deleteNoteById(activeNoteId);
  }
});

initTheme();

Promise.all([
  getStoreItem('notes'),
  getStoreItem('folders'),
  getStoreItem('moveCheckedToBottom')
]).then(([storedNotes, storedFolders, storedChecked]) => {
  folders = storedFolders || [];
  moveCheckedToBottom = !!storedChecked;
  moveCheckedBottomOpt.checked = moveCheckedToBottom;

  const rawNotes = storedNotes || [];
  const now = Date.now();
  notes = rawNotes.filter(n => {
    if (n.deleted && (now - (n.deletedAt || now) > 30 * 86400000)) return false;
    return true;
  });

  notes.forEach(n => {
    if (!n.title && n.html) {
      const p = parseNoteContent(n.html, n.text);
      n.title = p.title;
      n.snippet = p.snippet;
    }
    if (!n.tags && n.text) n.tags = extractTags(n.text);
  });

  saveNotesToDB();
  renderFolders();
  renderNotesList();

  if (notes.length) selectNote(notes[0].id);
  else createNewNote();
});
