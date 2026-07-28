// Enable progressive enhancement animations
document.body.classList.add('js-enabled');

// ==========================================
// Initial Seed Data (Articles)
// ==========================================
const DEFAULT_ARTICLES = [
  {
    id: 'seed-1',
    title: 'The Psychology of Market Volatility',
    author: 'Dr. Anju Arora',
    content: `Understanding how emotional intelligence impacts investment decisions during economic downturns is crucial for long-term financial success. Market volatility is not just a mathematical representation of risk; it is a direct reflection of human psychology. 

In my research on financial systems and investor behavior, I have observed that emotional reactions often override rational analysis. Speculative investing is driven by fear of missing out (FOMO) or panic, whereas successful, value-oriented investing requires emotional optimization. 

To bridge this gap, investors must develop self-regulation and structural discipline. By treating market fluctuations as natural emotional cycles rather than catastrophic events, we can make clearer decisions that align with fundamental and behavioral truths.`,
    category: 'Equity',
    date: 'July 15, 2026',
    readTime: '5 min read',
    status: 'published',
    image: 'assets/images/book2.jpeg',
    isDefault: true
  },
  {
    id: 'seed-2',
    title: 'Defining Agility in Modern Workspaces',
    author: 'Dr. Anju Arora',
    content: `Organizational structures are rapidly evolving to accommodate remote-first and hybrid collaboration models. In the book Agilent, I discuss the core mechanisms of emotional and organizational agility. 

Disruption is no longer a temporary phase; it is the environment in which modern institutions operate. Agility is the capacity of an organization to detect environmental shifts and reconfigure its resources—emotional, intellectual, and physical—to meet those shifts.

Leaders must learn to optimize emotions within their teams. High emotional intelligence in teams directly correlates with increased health, relationships, productivity, and inner peace. By eliminating complexity and self-generated organizational friction, we build systems that are truly agilent: fast, focused, and resilient.`,
    category: 'Exploration',
    date: 'June 28, 2026',
    readTime: '8 min read',
    status: 'published',
    image: 'assets/images/photo.jpeg',
    isDefault: true
  },
  {
    id: 'seed-3',
    title: 'Rekindling Purpose in Professional Life',
    author: 'Dr. Anju Arora',
    content: `A guide to finding meaningful work alignment and avoiding burnout through conscious reflection. In Rekindled Life, I reflect on returning to life after near-death experiences and finding appreciation for every moment.

In the corporate and academic race, we often lose sight of our core values. True productivity is not about constant output; it is about sustained resilience and meaningful contribution. 

Rekindling your professional life starts with gratitude and introspection. We must express gratitude to the people and systems that support us, evaluate our commitments, and realign our daily actions with a deeper sense of purpose. Only then can we move from a state of survival to one of thriving.`,
    category: 'Emotions',
    date: 'May 12, 2026',
    readTime: '6 min read',
    status: 'published',
    image: 'assets/images/book1.jpeg',
    isDefault: true
  }
];

// Initialize LocalStorage with default articles if empty, and perform migrations
function initializeDatabase() {
  const existing = localStorage.getItem('arora_articles');
  if (!existing) {
    localStorage.setItem('arora_articles', JSON.stringify(DEFAULT_ARTICLES));
  } else {
    // Perform migrations for existing data
    try {
      let db = JSON.parse(existing);
      let migrated = false;
      db = db.map(art => {
        let updated = false;
        
        // Migrate legacy statuses
        if (art.status === 'approved') {
          art.status = 'published';
          updated = true;
        }
        
        // Ensure default image and correct legacy assignments
        if (art.id === 'seed-3' && (art.image === 'assets/images/book3.jpeg' || !art.image)) {
          art.image = 'assets/images/book1.jpeg';
          updated = true;
        } else if (!art.image) {
          if (art.id === 'seed-1') art.image = 'assets/images/book2.jpeg';
          else if (art.id === 'seed-2') art.image = 'assets/images/photo.jpeg';
          else art.image = 'assets/images/photo.jpeg';
          updated = true;
        }
        
        // Migrate categories to exactly three
        if (art.id === 'seed-1' && art.category !== 'Equity') {
          art.category = 'Equity';
          updated = true;
        } else if (art.id === 'seed-2' && art.category !== 'Exploration') {
          art.category = 'Exploration';
          updated = true;
        } else if (art.id === 'seed-3' && art.category !== 'Emotions') {
          art.category = 'Emotions';
          updated = true;
        } else {
          const oldCat = art.category;
          if (oldCat === 'Finance') {
            art.category = 'Equity';
            updated = true;
          } else if (oldCat === 'Leadership') {
            art.category = 'Exploration';
            updated = true;
          } else if (oldCat === 'Philosophy' || oldCat === 'Research') {
            art.category = 'Emotions';
            updated = true;
          } else if (!art.category || !['Emotions', 'Equity', 'Exploration'].includes(art.category)) {
            art.category = 'Exploration';
            updated = true;
          }
        }
        
        if (updated) migrated = true;
        return art;
      });
      if (migrated) {
        localStorage.setItem('arora_articles', JSON.stringify(db));
      }
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }
}

let activeFilterCategory = null;

// Get published articles from localStorage
function getPublishedArticles() {
  const articles = JSON.parse(localStorage.getItem('arora_articles')) || [];
  return articles.filter(art => art.status === 'published');
}

// ==========================================
// Rendering Articles on Homepage
// ==========================================
function renderArticles() {
  const grid = document.getElementById('articles-grid');
  if (!grid) return;
  
  const published = getPublishedArticles();
  
  // Filter by category if set
  let displayed = published;
  if (activeFilterCategory) {
    displayed = published.filter(art => art.category === activeFilterCategory);
  }
  
  // Sort displayed articles - newest first
  displayed.sort((a, b) => {
    if (a.id.startsWith('seed-') && !b.id.startsWith('seed-')) return 1;
    if (!a.id.startsWith('seed-') && b.id.startsWith('seed-')) return -1;
    return b.timestamp - a.timestamp;
  });

  grid.innerHTML = '';

  if (displayed.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1;" class="text-center"><p style="color: var(--text-muted);">No articles found in this category.</p></div>`;
    return;
  }

  displayed.forEach(article => {
    const card = document.createElement('article');
    card.className = 'article-card reveal';
    
    // Strip HTML tags for clean card preview snippet
    const cleanPreview = (article.content || '').replace(/<[^>]*>/g, '').substring(0, 180);
    
    card.innerHTML = `
      <div class="article-card-image-wrapper">
        <img src="${article.image || 'assets/images/photo.jpeg'}" alt="${article.title}" class="article-card-image" loading="lazy">
      </div>
      <div class="article-meta">
        <span class="article-category">${article.category || 'Research'}</span>
        <span>${article.date || 'Recent'} • ${article.readTime || '3 min read'}</span>
      </div>
      <h3 class="article-title">${article.title}</h3>
      <p class="article-preview">${cleanPreview}...</p>
      <div class="article-footer">
        <span class="article-author">By ${article.author || 'Dr. Anju Arora'}</span>
        <button class="btn-text" data-id="${article.id}">
          Read More <span style="font-size: 1.1rem; margin-left: 2px;">→</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Re-observe scroll reveals
  setupScrollReveal();
  
  // Add Event Listeners for Read More buttons
  document.querySelectorAll('.btn-text').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openArticleModal(id);
    });
  });
}

// Open Full Article Modal
function openArticleModal(id) {
  const articles = JSON.parse(localStorage.getItem('arora_articles')) || [];
  const article = articles.find(art => art.id === id);
  if (!article) return;

  const modal = document.getElementById('article-view-modal');
  const title = document.getElementById('modal-view-title');
  const authorDate = document.getElementById('modal-view-author-date');
  const body = document.getElementById('modal-view-body');

  title.textContent = article.title;
  authorDate.textContent = `By ${article.author || 'Dr. Anju Arora'} • Published on ${article.date || 'Recent'} (${article.category || 'Research'})`;
  
  // Support both rich text HTML content and legacy double line break paragraph splitting
  if (/<[a-z][\s\S]*>/i.test(article.content)) {
    body.innerHTML = article.content;
  } else {
    const paragraphs = article.content.split('\n\n').filter(p => p.trim() !== '');
    body.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 1.5rem; font-size: 1.05rem; line-height: 1.7; color: var(--text-charcoal);">${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ==========================================
// Scroll Reveal System
// ==========================================
function setupScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target); // Stop observing once revealed
      }
    });
  }, observerOptions);

  reveals.forEach(el => observer.observe(el));
}



// ==========================================
// Modal Event Listeners
// ==========================================
function setupModalHandlers() {
  // Close modals on clicking overlay background
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Close button on view modal
  const closeViewModal = document.getElementById('view-modal-close');
  if (closeViewModal) {
    closeViewModal.addEventListener('click', () => {
      document.getElementById('article-view-modal').classList.remove('open');
      document.body.style.overflow = '';
    });
  }
}

// ==========================================
// Visitor Submission Modal Handler
// ==========================================
function setupVisitorSubmissionModal() {
  const submitReviewBtn = document.getElementById('btn-submit-review');
  const submitModal = document.getElementById('submit-review-modal');
  const submitModalClose = document.getElementById('submit-modal-close');
  const submitCancelBtn = document.getElementById('submit-cancel-btn');
  const submissionForm = document.getElementById('visitor-submission-form');
  const successCloseBtn = document.getElementById('success-close-btn');

  const formContainer = document.getElementById('submit-form-container');
  const successContainer = document.getElementById('submit-success-container');

  const imageUrlInput = document.getElementById('visitor-image-url');
  const imageFileInput = document.getElementById('visitor-image-file');
  const imagePreview = document.getElementById('visitor-image-preview');
  const previewContainer = document.getElementById('visitor-image-preview-container');

  if (!submitReviewBtn || !submitModal) return;

  // Open Modal
  submitReviewBtn.addEventListener('click', () => {
    // Reset form and UI
    submissionForm.reset();
    imagePreview.src = '';
    previewContainer.style.display = 'none';
    formContainer.style.display = 'block';
    successContainer.style.display = 'none';
    
    submitModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  // Close Modal triggers
  const closeModal = () => {
    submitModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (submitModalClose) submitModalClose.addEventListener('click', closeModal);
  if (submitCancelBtn) submitCancelBtn.addEventListener('click', closeModal);
  if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

  // Image Preview from URL
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

  // Image Preview from file upload
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

  // Form Submit
  submissionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const authorVal = document.getElementById('visitor-author').value.trim();
    const emailVal = document.getElementById('visitor-email').value.trim();
    const titleVal = document.getElementById('visitor-title').value.trim();
    const categoryVal = document.getElementById('visitor-category').value;
    const contentVal = document.getElementById('visitor-content').value.trim();
    const imagePreviewSrc = imagePreview.src;
    
    // Read Time calculation
    const wordsCount = contentVal.split(/\s+/).filter(w => w.length > 0).length;
    const readMinutes = Math.max(1, Math.ceil(wordsCount / 200));
    const readTimeText = `${readMinutes} min read`;

    // Featured Image
    let finalImage = 'assets/images/photo.jpeg'; // default fallback
    if (imagePreviewSrc && imagePreviewSrc.startsWith('data:image')) {
      finalImage = imagePreviewSrc;
    } else if (imageUrlInput.value.trim()) {
      finalImage = imageUrlInput.value.trim();
    }

    // Format current date
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    // Create article object
    const newArticle = {
      id: 'visitor-' + Date.now(),
      title: titleVal,
      author: authorVal,
      email: emailVal,
      content: contentVal,
      category: categoryVal,
      image: finalImage,
      status: 'pending',
      date: formattedDate,
      timestamp: Date.now(),
      readTime: readTimeText
    };

    // Save to Database
    const articles = JSON.parse(localStorage.getItem('arora_articles')) || [];
    articles.push(newArticle);
    localStorage.setItem('arora_articles', JSON.stringify(articles));

    // Show success screen
    formContainer.style.display = 'none';
    successContainer.style.display = 'block';
  });
}

// ==========================================
// Category Filter Tabs Handler
// ==========================================
function setupCategoryFiltering() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selectedCat = tab.getAttribute('data-category');
      
      if (tab.classList.contains('active')) {
        // Toggle filter off
        tab.classList.remove('active');
        activeFilterCategory = null;
      } else {
        // Clear all active states and set new active
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilterCategory = selectedCat;
      }
      
      renderArticles();
    });
  });
}

// ==========================================
// Scroll Header Transition
// ==========================================
function setupHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Mobile Nav Menu Toggle
// function setupMobileMenu()
function setupMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-menu');
  
  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      menu.classList.remove('open');
    });

    // Close mobile menu when nav links are clicked
    const links = menu.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
      });
    });
  }
}

// ==========================================
// App Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initializeDatabase();
  renderArticles();
  setupScrollReveal();
  setupModalHandlers();
  setupHeaderScroll();
  setupMobileMenu();
  setupVisitorSubmissionModal();
  setupCategoryFiltering();
});
