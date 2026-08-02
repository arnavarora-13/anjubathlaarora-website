// Enable progressive enhancement animations
document.body.classList.add('js-enabled');

// Helper: Generate URL-safe slug from text
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ==========================================
// Initial Seed Data (Articles)
// ==========================================
const DEFAULT_ARTICLES = [
  {
    id: 'seed-1',
    slug: 'exhilarating-magic-of-stock-markets',
    title: 'The Psychology of Market Volatility',
    seoTitle: 'The Psychology of Market Volatility | Dr. Anju Bathla Arora',
    socialShareTitle: 'How Emotional Intelligence Shapes Financial Resilience',
    socialShareDescription: 'Discover how emotional intelligence helps investors make better decisions, overcome market anxiety, and create long-term financial success.',
    socialShareImage: 'assets/images/book2.jpeg',
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
    slug: 'agilent-the-fast-and-focused',
    title: 'Defining Agility in Modern Workspaces',
    seoTitle: 'Defining Agility in Modern Workspaces | Dr. Anju Bathla Arora',
    socialShareTitle: 'Defining Agility in Modern Workspaces',
    socialShareDescription: 'Explore the core mechanisms of emotional and organizational agility needed to navigate modern hybrid work environments effectively.',
    socialShareImage: 'assets/images/photo.jpeg',
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
    slug: 'rekindled-life',
    title: 'Rekindling Purpose in Professional Life',
    seoTitle: 'Rekindling Purpose in Professional Life | Dr. Anju Bathla Arora',
    socialShareTitle: 'Rekindling Purpose in Professional Life',
    socialShareDescription: 'A guide to finding meaningful work alignment, sustained resilience, and avoiding burnout through conscious reflection.',
    socialShareImage: 'assets/images/book1.jpeg',
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

let activeFilterCategory = null;

// Get published articles from localStorage
function getPublishedArticles() {
  checkAndPublishScheduled();
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

// Open Full Article Modal (Updates hash for routing)
function openArticleModal(id) {
  window.location.hash = 'article/' + id;
}

// Renders the article in Medium-style viewer
function renderArticleModalContent(id) {
  const articles = JSON.parse(localStorage.getItem('arora_articles')) || [];
  const article = articles.find(art => art.id === id);
  if (!article) {
    window.location.hash = '';
    return;
  }

  const modal = document.getElementById('article-view-modal');
  const title = document.getElementById('modal-view-title');
  const author = document.getElementById('modal-view-author');
  const date = document.getElementById('modal-view-date');
  const readtime = document.getElementById('modal-view-readtime');
  const category = document.getElementById('modal-view-category');
  const image = document.getElementById('modal-view-image');
  const imageWrapper = document.getElementById('modal-view-image-wrapper');
  const body = document.getElementById('modal-view-body');
  
  // Set reading progress bar to 0% initially
  const progress = document.getElementById('reading-progress');
  if (progress) progress.style.width = '0%';

  title.textContent = article.title;
  author.textContent = article.author || 'Dr. Anju Arora';
  date.textContent = article.date || 'Recent';
  readtime.textContent = article.readTime || '3 min read';
  category.textContent = article.category || 'Research';
  
  if (article.image) {
    image.src = article.image;
    imageWrapper.style.display = 'block';
  } else {
    imageWrapper.style.display = 'none';
  }

  // Support both rich text HTML content and legacy double line break paragraph splitting
  if (/<[a-z][\s\S]*>/i.test(article.content)) {
    body.innerHTML = article.content;
  } else {
    const paragraphs = article.content.split('\n\n').filter(p => p.trim() !== '');
    body.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 1.75rem; font-size: 1.25rem; line-height: 1.85; color: #292929;">${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  // Update document Open Graph and Twitter metadata
  updateDocumentMetaTags(article);

  // Setup Share buttons
  setupShareButtons(article);

  // Setup Navigation
  setupArticleNavigation(article.id);

  // Setup Related Articles
  setupRelatedArticles(article);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.scrollTop = 0; // scroll to top when opening

  // Track article view
  if (typeof recordPageView === 'function') {
    recordPageView("Article: " + article.title);
  }
}

// Show toast message
function showToast(message) {
  const toast = document.getElementById('toast-message');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Helper: Extract 150-200 character excerpt for social previews
function getArticleExcerpt(article) {
  if (article.socialShareDescription && article.socialShareDescription.trim()) {
    return article.socialShareDescription.trim();
  }
  let text = (article.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= 180) return text;
  let truncated = text.substring(0, 175);
  let lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 100) {
    truncated = truncated.substring(0, lastSpace);
  }
  return truncated + '...';
}

// Helper: Generate canonical article permanent URL (/articles/{article-slug}) on this website only
function getArticleCanonicalUrl(article) {
  const origin = window.location.origin;
  const slug = typeof article === 'object' ? (article.slug || slugify(article.title) || article.id) : (article || '');
  let path = window.location.pathname;
  if (path.endsWith('index.html')) {
    path = path.substring(0, path.length - 'index.html'.length);
  }
  if (path.includes('/articles/')) {
    path = path.substring(0, path.indexOf('/articles/')) + '/';
  }
  if (path.includes('/article/')) {
    path = path.substring(0, path.indexOf('/article/')) + '/';
  }
  if (!path.endsWith('/')) {
    path += '/';
  }
  return `${origin}${path}articles/${slug}`;
}

// Dynamically update document title and head meta tags (OG & Twitter)
function updateDocumentMetaTags(article) {
  const title = article.socialShareTitle || article.seoTitle || article.title;
  const fullTitle = `${title} | Dr. Anju Bathla Arora`;
  const description = getArticleExcerpt(article);
  const canonicalUrl = getArticleCanonicalUrl(article);
  
  let imageUrl = article.socialShareImage || article.image || 'assets/images/photo.jpeg';
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
    const origin = window.location.origin;
    let path = window.location.pathname;
    const lastSlash = path.lastIndexOf('/');
    path = path.substring(0, lastSlash + 1);
    imageUrl = `${origin}${path}${imageUrl.replace(/^\//, '')}`;
  }

  document.title = fullTitle;

  const setMetaTag = (selector, attribute, attrVal, content) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attribute, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Open Graph
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'article');
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Dr. Anju Bathla Arora');

  // Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);
}

// Setup social sharing
function setupShareButtons(article) {
  const shareUrl = getArticleCanonicalUrl(article);
  const excerpt = getArticleExcerpt(article);
  const title = article.socialShareTitle || article.title;

  const encodedUrl = encodeURIComponent(shareUrl);
  
  // Custom share text payloads
  const whatsappPayload = `${title}\n\n${excerpt}\n\nRead More:\n${shareUrl}`;
  const encodedWhatsapp = encodeURIComponent(whatsappPayload);

  const xPayload = `${title}\n\n${excerpt}\n\nRead More:`;
  const encodedX = encodeURIComponent(xPayload);

  const telegramPayload = `${title}\n\n${excerpt}\n\nRead More:`;
  const encodedTelegram = encodeURIComponent(telegramPayload);

  const bindShare = (selector, url) => {
    document.querySelectorAll(selector).forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
      };
    });
  };
  
  bindShare('.btn-share-facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
  bindShare('.btn-share-whatsapp', `https://api.whatsapp.com/send?text=${encodedWhatsapp}`);
  bindShare('.btn-share-linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
  bindShare('.btn-share-x', `https://twitter.com/intent/tweet?text=${encodedX}&url=${encodedUrl}`);
  bindShare('.btn-share-telegram', `https://t.me/share/url?url=${encodedUrl}&text=${encodedTelegram}`);
  
  document.querySelectorAll('.btn-share-copy').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Article link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy link: ', err);
      });
    };
  });
  
  // Medium share handler (copies article link to clipboard)
  document.querySelectorAll('.btn-share-medium').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Article link copied for Medium!');
      }).catch(() => {});
    };
  });

  // Instagram share handler (copies article link to clipboard)
  document.querySelectorAll('.btn-share-instagram').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Article link copied! You can paste it into Instagram.');
      }).catch(() => {});
    };
  });
}

// Setup Next / Previous buttons
function setupArticleNavigation(id) {
  const published = getPublishedArticles();
  
  // Sort articles - newest first
  published.sort((a, b) => {
    if (a.id.startsWith('seed-') && !b.id.startsWith('seed-')) return 1;
    if (!a.id.startsWith('seed-') && b.id.startsWith('seed-')) return -1;
    return b.timestamp - a.timestamp;
  });

  const currentIndex = published.findIndex(art => art.id === id);
  const prevBtn = document.getElementById('nav-prev-article');
  const prevTitle = document.getElementById('nav-prev-title');
  
  if (currentIndex > 0) {
    const prevArt = published[currentIndex - 1];
    prevBtn.style.visibility = 'visible';
    prevTitle.textContent = prevArt.title;
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      openArticleModal(prevArt.id);
    };
  } else {
    prevBtn.style.visibility = 'hidden';
  }
  
  const nextBtn = document.getElementById('nav-next-article');
  const nextTitle = document.getElementById('nav-next-title');
  
  if (currentIndex >= 0 && currentIndex < published.length - 1) {
    const nextArt = published[currentIndex + 1];
    nextBtn.style.visibility = 'visible';
    nextTitle.textContent = nextArt.title;
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      openArticleModal(nextArt.id);
    };
  } else {
    nextBtn.style.visibility = 'hidden';
  }
}

// Setup Related Articles grid
function setupRelatedArticles(currentArticle) {
  const published = getPublishedArticles();
  
  // Find related articles (same category, excluding current)
  let related = published.filter(art => art.category === currentArticle.category && art.id !== currentArticle.id);
  
  // If not enough related articles, fill with other categories (excluding current)
  if (related.length < 3) {
    const others = published.filter(art => art.category !== currentArticle.category && art.id !== currentArticle.id);
    related = related.concat(others.slice(0, 3 - related.length));
  }
  
  // Limit to 3
  related = related.slice(0, 3);
  
  const relatedGrid = document.getElementById('related-articles-grid');
  if (!relatedGrid) return;
  relatedGrid.innerHTML = '';
  
  if (related.length === 0) {
    relatedGrid.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No related articles found.</p>`;
    return;
  }
  
  related.forEach(art => {
    const card = document.createElement('div');
    card.className = 'article-card reveal active';
    card.style.minHeight = 'auto';
    card.style.padding = '1.5rem';
    card.style.cursor = 'pointer';
    
    card.innerHTML = `
      <div class="article-card-image-wrapper" style="aspect-ratio: 16/10; margin-bottom: 1rem;">
        <img src="${art.image || 'assets/images/photo.jpeg'}" alt="${art.title}" class="article-card-image" loading="lazy">
      </div>
      <div class="article-meta" style="margin-bottom: 0.75rem; font-size: 0.7rem;">
        <span class="article-category">${art.category}</span>
        <span>${art.readTime || '3 min read'}</span>
      </div>
      <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem; line-height: 1.3; font-family: var(--font-serif); color: var(--accent-forest-green); font-weight: 500;">${art.title}</h4>
    `;
    
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      openArticleModal(art.id);
    });
    
    relatedGrid.appendChild(card);
  });
}

// Router hash change handler
function handleHashChange() {
  const hash = window.location.hash;
  const match = hash.match(/^#?article\/(.+)$/);
  
  const modal = document.getElementById('article-view-modal');
  if (match) {
    const articleId = match[1];
    renderArticleModalContent(articleId);
  } else {
    if (modal && modal.classList.contains('open')) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (typeof recordPageView === 'function') {
        recordPageView('Home');
      }
    }
  }
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
        const wasOpen = overlay.classList.contains('open');
        if (wasOpen && overlay.id === 'article-view-modal') {
          window.location.hash = ''; // triggers hashchange which closes modal
        } else {
          overlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // Close button on view modal
  const closeViewModal = document.getElementById('view-modal-close');
  if (closeViewModal) {
    closeViewModal.addEventListener('click', () => {
      window.location.hash = ''; // triggers hashchange which closes modal
    });
  }

  // Scroll listener for reading progress bar
  const viewModal = document.getElementById('article-view-modal');
  if (viewModal) {
    viewModal.addEventListener('scroll', () => {
      const progress = document.getElementById('reading-progress');
      if (!progress) return;
      const scrollTop = viewModal.scrollTop;
      const scrollHeight = viewModal.scrollHeight - viewModal.clientHeight;
      const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progress.style.width = percent + '%';
    });
  }
}
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
  startTrackingSession();

  // Hash routing triggers
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange(); // check initial hash on load
});

// ==========================================
// Visitor Analytics & Heartbeat System
// ==========================================

function initializeAnalytics() {
  if (localStorage.getItem('arora_analytics')) return;

  const analytics = { sessions: [] };
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Generate unique visitor IDs (say 90 unique visitors)
  const visitors = [];
  for (let i = 0; i < 90; i++) {
    visitors.push('seed-visitor-' + Math.random().toString(36).substring(2, 9));
  }

  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const deviceWeights = [0.55, 0.35, 0.10]; // 55% Desktop, 35% Mobile, 10% Tablet
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const browserWeights = [0.60, 0.20, 0.12, 0.08];

  function getRandomWeighted(items, weights) {
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += weights[i];
      if (r <= sum) return items[i];
    }
    return items[items.length - 1];
  }

  const articleTitles = [
    "The Psychology of Market Volatility",
    "Defining Agility in Modern Workspaces",
    "Rekindling Purpose in Professional Life"
  ];

  // Generate sessions over the last 30 days (around 200 total sessions)
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const dayTimestamp = now - (dayOffset * oneDay);
    const d = new Date(dayTimestamp);
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // Number of sessions on this day: ranges from 4 to 12
    const sessionsCount = Math.floor(Math.random() * 8) + 4;

    for (let s = 0; s < sessionsCount; s++) {
      const visitorId = visitors[Math.floor(Math.random() * visitors.length)];
      const previousSession = analytics.sessions.find(sess => sess.visitorId === visitorId);
      const isNew = !previousSession;

      // Determine device & browser (keep consistent per visitor)
      let device, browser;
      if (previousSession) {
        device = previousSession.device;
        browser = previousSession.browser;
      } else {
        device = getRandomWeighted(devices, deviceWeights);
        browser = getRandomWeighted(browsers, browserWeights);
      }

      // Generate random hour for session start (between 7 AM and 11 PM)
      const hour = Math.floor(Math.random() * 16) + 7;
      const minute = Math.floor(Math.random() * 60);
      const sessionTime = new Date(d);
      sessionTime.setHours(hour, minute, 0, 0);

      const session = {
        id: 'seed-session-' + Math.random().toString(36).substring(2, 9),
        visitorId: visitorId,
        isNew: isNew,
        timestamp: sessionTime.getTime(),
        dateString: dateString,
        device: device,
        browser: browser,
        duration: 0,
        pageViews: []
      };

      // Always starts with Home
      const homeTime = Math.floor(Math.random() * 45) + 15;
      session.pageViews.push({
        page: 'Home',
        duration: homeTime,
        startTime: sessionTime.getTime()
      });

      // Maybe views some articles (50% chance of viewing articles)
      const pViews = Math.random() < 0.5 ? (Math.random() < 0.3 ? 2 : 1) : 0;
      let currentTimestamp = sessionTime.getTime() + (homeTime * 1000);

      for (let p = 0; p < pViews; p++) {
        const articleTitle = articleTitles[Math.floor(Math.random() * articleTitles.length)];
        const articleDuration = Math.floor(Math.random() * 240) + 5; // 5s to 4 mins
        const isRead = articleDuration >= 15; // considered "read" if >= 15s

        session.pageViews.push({
          page: 'Article: ' + articleTitle,
          duration: articleDuration,
          startTime: currentTimestamp,
          isRead: isRead
        });

        currentTimestamp += (articleDuration * 1000);
        
        // Maybe returns to home page
        if (Math.random() < 0.5) {
          const homeDuration = Math.floor(Math.random() * 20) + 5;
          session.pageViews.push({
            page: 'Home',
            duration: homeDuration,
            startTime: currentTimestamp
          });
          currentTimestamp += (homeDuration * 1000);
        }
      }

      session.duration = session.pageViews.reduce((acc, pv) => acc + pv.duration, 0);
      analytics.sessions.push(session);
    }
  }

  localStorage.setItem('arora_analytics', JSON.stringify(analytics));
}

function runActiveHeartbeat() {
  const sessionId = sessionStorage.getItem('arora_session_id');
  if (!sessionId) return;
  
  const activeSessions = JSON.parse(localStorage.getItem('arora_active_sessions')) || {};
  activeSessions[sessionId] = Date.now();
  
  const now = Date.now();
  for (const id in activeSessions) {
    if (now - activeSessions[id] > 15000) {
      delete activeSessions[id];
    }
  }
  localStorage.setItem('arora_active_sessions', JSON.stringify(activeSessions));
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return "Mobile";
  }
  return "Desktop";
}

function getBrowserType() {
  const ua = navigator.userAgent;
  if (ua.indexOf("Chrome") > -1 && ua.indexOf("Safari") > -1) {
    if (ua.indexOf("Edg") > -1) return "Edge";
    return "Chrome";
  }
  if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
    return "Safari";
  }
  if (ua.indexOf("Firefox") > -1) {
    return "Firefox";
  }
  return "Other";
}

function recordPageView(pageName) {
  const analytics = JSON.parse(localStorage.getItem('arora_analytics')) || { sessions: [] };
  const currentSessionId = sessionStorage.getItem('arora_session_id');
  if (!currentSessionId) return;

  const session = analytics.sessions.find(s => s.id === currentSessionId);
  if (session) {
    if (session.pageViews.length > 0) {
      const prevPv = session.pageViews[session.pageViews.length - 1];
      const elapsed = Math.round((Date.now() - prevPv.startTime) / 1000);
      prevPv.duration = Math.max(1, elapsed);
      if (prevPv.page.startsWith('Article:') && prevPv.duration >= 15) {
        prevPv.isRead = true;
      }
    }
    
    session.pageViews.push({
      page: pageName,
      startTime: Date.now(),
      duration: 0,
      isRead: false
    });
    
    session.duration = session.pageViews.reduce((acc, pv) => acc + (pv.duration || 0), 0);
    localStorage.setItem('arora_analytics', JSON.stringify(analytics));
  }
}

function updateCurrentPageViewDuration() {
  const analytics = JSON.parse(localStorage.getItem('arora_analytics'));
  if (!analytics) return;
  const currentSessionId = sessionStorage.getItem('arora_session_id');
  if (!currentSessionId) return;

  const session = analytics.sessions.find(s => s.id === currentSessionId);
  if (session && session.pageViews.length > 0) {
    const lastPv = session.pageViews[session.pageViews.length - 1];
    const elapsed = Math.round((Date.now() - lastPv.startTime) / 1000);
    lastPv.duration = Math.max(1, elapsed);
    if (lastPv.page.startsWith('Article:') && lastPv.duration >= 15) {
      lastPv.isRead = true;
    }
    session.duration = session.pageViews.reduce((acc, pv) => acc + (pv.duration || 0), 0);
    localStorage.setItem('arora_analytics', JSON.stringify(analytics));
  }
}

function startTrackingSession() {
  initializeAnalytics();

  let visitorId = localStorage.getItem('arora_visitor_id');
  let isNew = false;
  if (!visitorId) {
    visitorId = 'vis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('arora_visitor_id', visitorId);
    isNew = true;
  }

  let sessionId = sessionStorage.getItem('arora_session_id');
  if (!sessionId) {
    sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('arora_session_id', sessionId);
    
    const analytics = JSON.parse(localStorage.getItem('arora_analytics')) || { sessions: [] };
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const newSession = {
      id: sessionId,
      visitorId: visitorId,
      isNew: isNew,
      timestamp: Date.now(),
      dateString: dateString,
      device: getDeviceType(),
      browser: getBrowserType(),
      duration: 0,
      pageViews: []
    };
    
    analytics.sessions.push(newSession);
    localStorage.setItem('arora_analytics', JSON.stringify(analytics));
  }

  recordPageView('Home');

  runActiveHeartbeat();
  setInterval(runActiveHeartbeat, 5000);

  window.addEventListener('beforeunload', updateCurrentPageViewDuration);
}

// Deep linking router for shared article URLs (/articles/{slug})
function checkInitialArticleRoute() {
  const urlParams = new URLSearchParams(window.location.search);
  let targetSlug = urlParams.get('article') || urlParams.get('id');
  const pathname = window.location.pathname;

  if (!targetSlug && pathname.includes('/articles/')) {
    const parts = pathname.split('/articles/');
    if (parts[1]) {
      targetSlug = parts[1].replace(/\.html$/, '').replace(/\/$/, '');
    }
  } else if (!targetSlug && pathname.includes('/article/')) {
    const parts = pathname.split('/article/');
    if (parts[1]) {
      targetSlug = parts[1].replace(/\.html$/, '').replace(/\/$/, '');
    }
  } else if (!targetSlug && window.location.hash.startsWith('#article/')) {
    targetSlug = window.location.hash.replace('#article/', '');
  }

  if (targetSlug) {
    const published = typeof getPublishedArticles === 'function' ? getPublishedArticles() : DEFAULT_ARTICLES;
    const cleanTarget = targetSlug.toLowerCase().trim();
    const art = published.find(a => 
      (a.slug && a.slug.toLowerCase() === cleanTarget) ||
      (a.title && slugify(a.title) === cleanTarget) ||
      a.id === cleanTarget ||
      a.id === 'seed-' + cleanTarget
    );
    if (art && typeof openArticleModal === 'function') {
      openArticleModal(art);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkInitialArticleRoute);
} else {
  setTimeout(checkInitialArticleRoute, 100);
}
window.addEventListener('hashchange', checkInitialArticleRoute);
