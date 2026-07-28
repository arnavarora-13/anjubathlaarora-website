// ==========================================
// Admin Dashboard Logic
// ==========================================

let activeTab = 'review'; // 'review' or 'published'
const ADMIN_PASSWORD = 'a1b2c3d4e5'; // Secure default password for local lock

// Check authorization
function checkAuth() {
  const isAuth = sessionStorage.getItem('admin_authorized') === 'true';
  const overlay = document.getElementById('admin-login-overlay');
  
  if (!isAuth) {
    if (overlay) {
      overlay.style.display = 'flex';
      document.getElementById('admin-password').focus();
    }
  } else {
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
}

// Automatic scheduler for client-side publishing
function checkAndPublishScheduled() {
  const articles = JSON.parse(localStorage.getItem('arora_articles')) || [];
  let updated = false;
  const now = Date.now();
  
  const newArticles = articles.map(art => {
    if (art.status === 'scheduled') {
      const scheduleTime = new Date(art.scheduledAt).getTime();
      if (scheduleTime <= now) {
        art.status = 'published';
        art.timestamp = scheduleTime; // Use the scheduled time as the publish timestamp
        
        // Format the date string to match "July 15, 2026"
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const d = new Date(scheduleTime);
        art.date = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        updated = true;
      }
    }
    return art;
  });
  
  if (updated) {
    localStorage.setItem('arora_articles', JSON.stringify(newArticles));
  }
}

// Fetch database
function getArticles() {
  checkAndPublishScheduled();
  return JSON.parse(localStorage.getItem('arora_articles')) || [];
}

// Save database
function saveArticles(articles) {
  localStorage.setItem('arora_articles', JSON.stringify(articles));
}

// Compute Statistics
function updateStats() {
  const db = getArticles();
  const pendingCount = db.filter(art => art.status === 'pending' || art.status === 'rejected').length;
  const publishedCount = db.filter(art => art.status === 'published').length;
  const totalCount = db.length;

  document.getElementById('stat-total').textContent = totalCount;
  document.getElementById('stat-pending').textContent = pendingCount;
  document.getElementById('stat-published').textContent = publishedCount;
}

// Render Table Content
function renderAdminTable() {
  const db = getArticles();
  const tbody = document.getElementById('admin-table-body');
  const emptyState = document.getElementById('admin-empty-state');
  const thead = document.getElementById('admin-table-head');
  
  if (!tbody || !thead) return;
  
  tbody.innerHTML = '';
  
  let filtered = [];
  if (activeTab === 'review') {
    thead.innerHTML = `
      <tr>
        <th style="width: 35%;">Article Title &amp; Preview</th>
        <th style="width: 15%;">Author</th>
        <th style="width: 15%;">Category</th>
        <th style="width: 15%;">Submission Date</th>
        <th style="width: 20%; text-align: center;">Actions</th>
      </tr>
    `;
    filtered = db.filter(art => art.status === 'pending' || art.status === 'rejected');
  } else {
    thead.innerHTML = `
      <tr>
        <th style="width: 35%;">Article Title</th>
        <th style="width: 20%;">Category</th>
        <th style="width: 15%;">Status</th>
        <th style="width: 15%;">Date</th>
        <th style="width: 15%; text-align: center;">Actions</th>
      </tr>
    `;
    filtered = db.filter(art => art.status === 'published' || art.status === 'draft' || art.status === 'scheduled');
  }
  
  // Sort user submissions by newest first, seed articles last
  filtered.sort((a, b) => {
    if (a.id.startsWith('seed-') && !b.id.startsWith('seed-')) return 1;
    if (!a.id.startsWith('seed-') && b.id.startsWith('seed-')) return -1;
    return b.timestamp - a.timestamp;
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    document.getElementById('admin-table-wrapper').style.display = 'none';
    emptyState.querySelector('p').textContent = activeTab === 'review' 
      ? 'No submitted articles for review.' 
      : 'No published articles found.';
    return;
  }

  emptyState.style.display = 'none';
  document.getElementById('admin-table-wrapper').style.display = 'block';

  filtered.forEach(art => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    
    let actionButtons = '';
    if (activeTab === 'review') {
      actionButtons = `
        <button class="btn btn-sm btn-approve btn-action btn-action-approve" data-id="${art.id}" style="padding: 0.35rem 0.5rem; font-size: 0.7rem; margin-right: 0.25rem;">Approve</button>
        ${art.status !== 'rejected' ? `<button class="btn btn-sm btn-secondary btn-action btn-action-reject" data-id="${art.id}" style="padding: 0.35rem 0.5rem; font-size: 0.7rem; margin-right: 0.25rem; background: white; border: 1px solid var(--border-color);">Reject</button>` : ''}
        <button class="btn btn-sm btn-secondary btn-action btn-action-edit" data-id="${art.id}" style="padding: 0.35rem 0.5rem; font-size: 0.7rem; margin-right: 0.25rem; background: white; border: 1px solid var(--border-color);">Edit</button>
        <button class="btn btn-sm btn-delete btn-action btn-action-del" data-id="${art.id}" style="padding: 0.35rem 0.5rem; font-size: 0.7rem;">Delete</button>
      `;
      
      const cleanPreview = (art.content || '').replace(/<[^>]*>/g, '').substring(0, 80);
      const statusBadge = art.status === 'rejected'
        ? `<span class="badge-status rejected" style="background-color: #FCE8E6; color: #C5221F; font-size: 0.65rem; padding: 0.15rem 0.4rem; margin-left: 0.5rem; border-radius: 10px;">rejected</span>`
        : '';
        
      tr.innerHTML = `
        <td>
          <div style="display: flex; flex-direction: column;">
            <strong style="color: var(--accent-forest-green); font-family: var(--font-serif); font-size: 1.05rem; font-weight: normal; display: flex; align-items: center;">
              ${art.title} ${statusBadge}
            </strong>
            <small style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px;">
              ${cleanPreview}...
            </small>
          </div>
        </td>
        <td>${art.author || 'Visitor'}</td>
        <td>${art.category || 'Research'}</td>
        <td>${art.date || 'N/A'}</td>
        <td class="admin-actions" style="text-align: right; white-space: nowrap;">
          ${actionButtons}
        </td>
      `;
    } else {
      const displayStatus = art.status;
      let statusClass = 'pending';
      if (art.status === 'published') {
        statusClass = 'approved';
      } else if (art.status === 'scheduled') {
        statusClass = 'scheduled-badge';
      }
      
      const isPublished = art.status === 'published';
      const canPublish = art.status === 'draft' || art.status === 'scheduled';
      actionButtons = `
        ${canPublish 
          ? `<button class="btn btn-sm btn-approve btn-action btn-action-pub" data-id="${art.id}" style="padding: 0.35rem 0.75rem; font-size: 0.7rem; margin-right: 0.25rem;">Publish</button>`
          : `<button class="btn btn-sm btn-secondary btn-action btn-action-unpub" data-id="${art.id}" style="padding: 0.35rem 0.75rem; font-size: 0.7rem; margin-right: 0.25rem; background: white; border: 1px solid var(--border-color);">Unpublish</button>`
        }
        <button class="btn btn-sm btn-secondary btn-action btn-action-edit" data-id="${art.id}" style="padding: 0.35rem 0.75rem; font-size: 0.7rem; margin-right: 0.25rem; background: white; border: 1px solid var(--border-color);">Edit</button>
        <button class="btn btn-sm btn-delete btn-action btn-action-del" data-id="${art.id}" style="padding: 0.35rem 0.75rem; font-size: 0.7rem;">Delete</button>
      `;

      tr.innerHTML = `
        <td>
          <strong style="color: var(--accent-forest-green); font-family: var(--font-serif); font-size: 1.05rem; font-weight: normal;">
            ${art.title}
          </strong>
        </td>
        <td>${art.category || 'Research'}</td>
        <td><span class="badge-status ${statusClass}">${displayStatus}</span></td>
        <td>${art.date || 'N/A'}</td>
        <td class="admin-actions" style="text-align: right; white-space: nowrap;">
          ${actionButtons}
        </td>
      `;
    }

    // Click on row (except buttons) opens the preview modal
    tr.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-action') || e.target.closest('.admin-actions')) {
        return; // Don't trigger preview on action button click
      }
      openReviewModal(art.id);
    });

    tbody.appendChild(tr);
  });

  // Attach button event listeners
  attachActionListeners();
}

// Open Review Modal (Read-Only Preview)
function openReviewModal(id) {
  const db = getArticles();
  const art = db.find(a => a.id === id);
  if (!art) return;

  const modal = document.getElementById('review-modal');
  const title = document.getElementById('review-modal-title');
  const meta = document.getElementById('review-modal-meta');
  const body = document.getElementById('review-modal-body');
  const footer = document.getElementById('review-modal-footer');

  title.textContent = art.title;
  
  const authorText = art.author || 'Visitor';
  const emailText = art.email ? ` | Email: ${art.email}` : '';
  meta.textContent = `Author: ${authorText}${emailText} | Date: ${art.date || 'Recent'} | Category: ${art.category || 'Research'} | Read Time: ${art.readTime || '3 min read'}`;
  
  // Render HTML directly if rich text, otherwise split legacy text by double line breaks
  if (/<[a-z][\s\S]*>/i.test(art.content)) {
    body.innerHTML = art.content;
  } else {
    const paragraphs = art.content.split('\n\n').filter(p => p.trim() !== '');
    body.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 1.25rem; font-size: 1rem; color: var(--text-charcoal); line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  // Footer Actions based on whether it is a visitor submission or admin article
  const isSubmission = art.status === 'pending' || art.status === 'rejected';
  
  if (isSubmission) {
    footer.innerHTML = `
      <button class="btn btn-secondary" id="modal-edit-trigger-btn" style="border-radius: 4px; padding: 0.6rem 1.5rem; background: white; border: 1px solid var(--border-color);">Edit Before Publishing</button>
      ${art.status !== 'rejected' 
        ? `<button class="btn btn-secondary" id="modal-reject-trigger-btn" style="border-radius: 4px; padding: 0.6rem 1.5rem; background: white; border: 1px solid var(--border-color);">Reject</button>`
        : ''
      }
      <button class="btn btn-primary" id="modal-approve-trigger-btn" style="border-radius: 4px; padding: 0.6rem 1.5rem;">Approve &amp; Publish</button>
      <button class="btn btn-delete" id="modal-delete-trigger-btn" style="border-radius: 4px; padding: 0.6rem 1.5rem;">Delete</button>
    `;

    document.getElementById('modal-edit-trigger-btn').addEventListener('click', () => {
      modal.classList.remove('open');
      openEditorModal(art.id);
    });

    if (art.status !== 'rejected') {
      document.getElementById('modal-reject-trigger-btn').addEventListener('click', () => {
        rejectArticle(art.id);
        modal.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    document.getElementById('modal-approve-trigger-btn').addEventListener('click', () => {
      publishArticle(art.id);
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });

    document.getElementById('modal-delete-trigger-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to permanently delete this submission?')) {
        deleteArticle(art.id);
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  } else {
    const isPublished = art.status === 'published';
    footer.innerHTML = `
      <button class="btn btn-secondary" id="modal-edit-trigger-btn" style="border-radius: 4px; padding: 0.6rem 1.5rem; background: white; border: 1px solid var(--border-color);">Edit Article</button>
      ${isPublished 
        ? `<button class="btn btn-secondary" id="modal-toggle-pub-btn" style="border-radius: 4px; padding: 0.6rem 1.5rem;">Unpublish</button>`
        : `<button class="btn btn-primary" id="modal-toggle-pub-btn" style="border-radius: 4px; padding: 0.6rem 1.5rem;">Publish Article</button>`
      }
      <button class="btn btn-delete" id="modal-delete-trigger-btn" style="border-radius: 4px; padding: 0.6rem 1.5rem;">Delete</button>
    `;

    document.getElementById('modal-edit-trigger-btn').addEventListener('click', () => {
      modal.classList.remove('open');
      openEditorModal(art.id);
    });

    document.getElementById('modal-toggle-pub-btn').addEventListener('click', () => {
      if (isPublished) {
        unpublishArticle(art.id);
      } else {
        publishArticle(art.id);
      }
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });

    document.getElementById('modal-delete-trigger-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to permanently delete this article?')) {
        deleteArticle(art.id);
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Action implementations
function publishArticle(id) {
  let db = getArticles();
  db = db.map(art => {
    if (art.id === id) {
      return { ...art, status: 'published', timestamp: Date.now() };
    }
    return art;
  });
  saveArticles(db);
  refreshUI();
}

function unpublishArticle(id) {
  let db = getArticles();
  db = db.map(art => {
    if (art.id === id) {
      return { ...art, status: 'draft' };
    }
    return art;
  });
  saveArticles(db);
  refreshUI();
}

function deleteArticle(id) {
  let db = getArticles();
  db = db.filter(art => art.id !== id);
  saveArticles(db);
  refreshUI();
}

// Open Editor Modal (Create / Edit)
function openEditorModal(id = null) {
  const modal = document.getElementById('editor-modal');
  const modalTitle = document.getElementById('editor-modal-title');
  const idInput = document.getElementById('editor-article-id');
  const titleInput = document.getElementById('editor-title');
  const categorySelect = document.getElementById('editor-category');
  const dateInput = document.getElementById('editor-date');
  const readTimeInput = document.getElementById('editor-readtime');
  const imageUrlInput = document.getElementById('editor-image-url');
  const imageFileInput = document.getElementById('editor-image-file');
  const imagePreview = document.getElementById('editor-image-preview');
  const previewContainer = document.getElementById('image-preview-container');
  const richEditor = document.getElementById('editor-content');

  // Reset inputs
  idInput.value = '';
  titleInput.value = '';
  categorySelect.value = 'Emotions';
  
  // Set date default to today at 7:00 AM (YYYY-MM-DDTHH:MM format)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.value = `${yyyy}-${mm}-${dd}T07:00`;
  
  readTimeInput.value = '';
  imageUrlInput.value = '';
  imageFileInput.value = '';
  imagePreview.src = '';
  previewContainer.style.display = 'none';
  richEditor.innerHTML = '';

  if (id) {
    // Edit mode
    const db = getArticles();
    const art = db.find(a => a.id === id);
    if (art) {
      modalTitle.textContent = 'Edit Article';
      idInput.value = art.id;
      titleInput.value = art.title || '';
      categorySelect.value = art.category || 'Emotions';
      
      // Parse dates (supporting ISO scheduledAt, raw date strings, or timestamps)
      let dateVal = art.scheduledAt || art.date || art.timestamp;
      if (dateVal) {
        const dObj = new Date(dateVal);
        if (!isNaN(dObj.getTime())) {
          const y = dObj.getFullYear();
          const m = String(dObj.getMonth() + 1).padStart(2, '0');
          const d = String(dObj.getDate()).padStart(2, '0');
          const hh = String(dObj.getHours()).padStart(2, '0');
          const min = String(dObj.getMinutes()).padStart(2, '0');
          dateInput.value = `${y}-${m}-${d}T${hh}:${min}`;
        }
      }
      
      readTimeInput.value = art.readTime || '';
      
      if (art.image) {
        if (art.image.startsWith('data:image')) {
          imagePreview.src = art.image;
          previewContainer.style.display = 'block';
        } else {
          imageUrlInput.value = art.image;
          imagePreview.src = art.image;
          previewContainer.style.display = 'block';
        }
      }
      
      // Rich text loading
      if (/<[a-z][\s\S]*>/i.test(art.content)) {
        richEditor.innerHTML = art.content;
      } else {
        // Convert plain text breaks to HTML paragraphs
        const paragraphs = (art.content || '').split('\n\n').filter(p => p.trim() !== '');
        richEditor.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
      }
    }
  } else {
    // Create mode
    modalTitle.textContent = 'New Article';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close Editor Modal
function closeEditorModal() {
  const modal = document.getElementById('editor-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Process and Save Editor Content
function saveEditor(status = 'published') {
  const idInput = document.getElementById('editor-article-id').value;
  const titleVal = document.getElementById('editor-title').value.trim();
  const categoryVal = document.getElementById('editor-category').value;
  const rawDate = document.getElementById('editor-date').value;
  const readTimeVal = document.getElementById('editor-readtime').value.trim();
  const imageUrlVal = document.getElementById('editor-image-url').value.trim();
  const imagePreviewSrc = document.getElementById('editor-image-preview').src;
  const contentHtml = document.getElementById('editor-content').innerHTML;

  if (!titleVal || !contentHtml.replace(/<[^>]*>/g, '').trim()) {
    alert('Please fill out the article title and content.');
    return;
  }

  // Format Date (Convert datetime-local ISO to "Month DD, YYYY") and extract schedule timestamp
  let formattedDate = 'Recent';
  let scheduledAt = null;
  if (rawDate) {
    const dObj = new Date(rawDate);
    if (!isNaN(dObj.getTime())) {
      scheduledAt = dObj.toISOString();
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      formattedDate = `${months[dObj.getMonth()]} ${dObj.getDate()}, ${dObj.getFullYear()}`;
    }
  }

  // Auto calculate Read Time if empty
  let readTimeText = readTimeVal;
  if (!readTimeText) {
    const textOnly = document.getElementById('editor-content').innerText || '';
    const wordsCount = textOnly.split(/\s+/).filter(w => w.length > 0).length;
    const readMinutes = Math.max(1, Math.ceil(wordsCount / 200));
    readTimeText = `${readMinutes} min read`;
  }

  // Determine Image
  let finalImage = 'assets/images/photo.jpeg'; // default fallback
  if (imagePreviewSrc && imagePreviewSrc.startsWith('data:image')) {
    finalImage = imagePreviewSrc;
  } else if (imageUrlVal) {
    finalImage = imageUrlVal;
  }

  let db = getArticles();
  let targetStatus = status;

  let timestampVal = Date.now();
  if (rawDate) {
    const dObj = new Date(rawDate);
    if (!isNaN(dObj.getTime())) {
      timestampVal = dObj.getTime();
    }
  }

  if (idInput) {
    // Update existing
    db = db.map(art => {
      if (art.id === idInput) {
        // If editing a visitor submission and clicked "Save Draft", keep it in review list
        if ((art.status === 'pending' || art.status === 'rejected') && status === 'draft') {
          targetStatus = art.status;
        }
        return {
          ...art,
          title: titleVal,
          category: categoryVal,
          date: formattedDate,
          readTime: readTimeText,
          content: contentHtml,
          image: finalImage,
          status: targetStatus,
          scheduledAt: targetStatus === 'scheduled' ? scheduledAt : null,
          timestamp: targetStatus === 'published' ? Date.now() : timestampVal
        };
      }
      return art;
    });
  } else {
    // Add new (by admin) - published immediately, saved as draft, or scheduled
    const newArt = {
      id: 'user-' + Date.now(),
      title: titleVal,
      author: 'Dr. Anju Arora',
      content: contentHtml,
      category: categoryVal,
      date: formattedDate,
      readTime: readTimeText,
      image: finalImage,
      status: targetStatus,
      scheduledAt: targetStatus === 'scheduled' ? scheduledAt : null,
      timestamp: targetStatus === 'published' ? Date.now() : timestampVal
    };
    db.push(newArt);
  }

  saveArticles(db);
  closeEditorModal();
  refreshUI();
}

function rejectArticle(id) {
  let db = getArticles();
  db = db.map(art => {
    if (art.id === id) {
      return { ...art, status: 'rejected' };
    }
    return art;
  });
  saveArticles(db);
  refreshUI();
}

function attachActionListeners() {
  document.querySelectorAll('.btn-action-pub').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      publishArticle(btn.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.btn-action-approve').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      publishArticle(btn.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.btn-action-reject').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      rejectArticle(btn.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.btn-action-unpub').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      unpublishArticle(btn.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.btn-action-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditorModal(btn.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.btn-action-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to permanently delete this item?')) {
        deleteArticle(btn.getAttribute('data-id'));
      }
    });
  });
}

function refreshUI() {
  updateStats();
  renderAdminTable();
}

// Set up tabs and event listeners
function setupTabs() {
  const reviewTab = document.getElementById('tab-review');
  const publishedTab = document.getElementById('tab-published');

  if (reviewTab && publishedTab) {
    reviewTab.addEventListener('click', () => {
      activeTab = 'review';
      reviewTab.classList.add('active');
      publishedTab.classList.remove('active');
      renderAdminTable();
    });

    publishedTab.addEventListener('click', () => {
      activeTab = 'published';
      publishedTab.classList.add('active');
      reviewTab.classList.remove('active');
      renderAdminTable();
    });
  }
}

// Setup basic modals (read review modal)
function setupModals() {
  const revModal = document.getElementById('review-modal');
  const revClose = document.getElementById('review-modal-close');

  if (revClose && revModal) {
    revClose.addEventListener('click', () => {
      revModal.classList.remove('open');
      document.body.style.overflow = '';
    });

    revModal.addEventListener('click', (e) => {
      if (e.target === revModal) {
        revModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
  
  // Editor Modal close triggers
  const edModal = document.getElementById('editor-modal');
  const edClose = document.getElementById('editor-modal-close');
  const edCancel = document.getElementById('editor-cancel-btn');
  
  const closeEditor = () => {
    edModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (edClose) edClose.addEventListener('click', closeEditor);
  if (edCancel) edCancel.addEventListener('click', closeEditor);
  if (edModal) {
    edModal.addEventListener('click', (e) => {
      if (e.target === edModal) {
        closeEditor();
      }
    });
  }
}

// Rich Text Editor Commands Binding
function setupRichEditor() {
  document.querySelectorAll('.editor-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.getAttribute('data-command');
      const value = btn.getAttribute('data-value') || null;
      
      if (command === 'createLink') {
        const url = prompt('Enter the link URL (e.g. https://google.com):');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else if (command === 'insertImage') {
        const url = prompt('Enter the image URL:');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else {
        document.execCommand(command, false, value);
      }
      
      // Keep focus in the editor
      document.getElementById('editor-content').focus();
    });
  });
}

// Image previewing & reading
function setupImageUploading() {
  const imageUrlInput = document.getElementById('editor-image-url');
  const imageFileInput = document.getElementById('editor-image-file');
  const imagePreview = document.getElementById('editor-image-preview');
  const previewContainer = document.getElementById('image-preview-container');

  imageUrlInput.addEventListener('input', () => {
    const val = imageUrlInput.value.trim();
    if (val) {
      imagePreview.src = val;
      previewContainer.style.display = 'block';
      imageFileInput.value = ''; // clear file input
    } else {
      previewContainer.style.display = 'none';
      imagePreview.src = '';
    }
  });

  imageFileInput.addEventListener('change', () => {
    const file = imageFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewContainer.style.display = 'block';
        imageUrlInput.value = ''; // clear url input
      };
      reader.readAsDataURL(file);
    }
  });
}

// Setup Password wall authentication handlers
function setupPasswordWall() {
  const loginForm = document.getElementById('admin-login-form');
  const errorMsg = document.getElementById('login-error-msg');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pwdVal = document.getElementById('admin-password').value;
      
      if (pwdVal === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_authorized', 'true');
        checkAuth();
        refreshUI();
      } else {
        errorMsg.style.display = 'block';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
      }
    });
  }
}

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Guarantee database structure
  if (!localStorage.getItem('arora_articles')) {
    localStorage.setItem('arora_articles', JSON.stringify([]));
  }
  
  // Set up interfaces
  checkAuth();
  setupPasswordWall();
  setupTabs();
  setupModals();
  setupRichEditor();
  setupImageUploading();

  // Create article trigger
  const newBtn = document.getElementById('btn-new-article');
  if (newBtn) {
    newBtn.addEventListener('click', () => openEditorModal());
  }

  // Handle editor form submission (Publishing)
  const editorForm = document.getElementById('article-editor-form');
  if (editorForm) {
    editorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveEditor('published');
    });
  }

  // Handle editor draft saving
  const draftBtn = document.getElementById('editor-draft-btn');
  if (draftBtn) {
    draftBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveEditor('draft');
    });
  }

  // Handle editor schedule saving
  const scheduleBtn = document.getElementById('editor-schedule-btn');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveEditor('scheduled');
    });
  }
  
  // Only render if authorized
  if (sessionStorage.getItem('admin_authorized') === 'true') {
    refreshUI();
  }
});
