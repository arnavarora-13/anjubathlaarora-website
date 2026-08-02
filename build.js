const fs = require('fs');
const path = require('path');

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory does not exist: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('Starting build process...');

  // Create public directory (clean it if it exists)
  if (fs.existsSync('public')) {
    console.log('Cleaning existing public directory...');
    fs.rmSync('public', { recursive: true, force: true });
  }
  fs.mkdirSync('public', { recursive: true });

  // Files to copy
  const filesToCopy = [
    'index.html',
    'admin.html',
    'styles.css',
    'app.js',
    'admin.js'
  ];

  for (const file of filesToCopy) {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join('public', file));
      console.log(`Copied file: ${file}`);
    } else {
      console.warn(`Warning: File not found: ${file}`);
    }
  }

  // Directories to copy
  const dirsToCopy = [
    'assets',
    'agilent',
    'rekindled-life'
  ];

  for (const dir of dirsToCopy) {
    if (fs.existsSync(dir)) {
      copyDirSync(dir, path.join('public', dir));
      console.log(`Copied directory: ${dir}`);
    } else {
      console.warn(`Warning: Directory not found: ${dir}`);
    }
  }

  // Copy ezgif-frame files from root
  const files = fs.readdirSync('.');
  let frameCount = 0;
  for (const file of files) {
    if (file.startsWith('ezgif-frame-') && file.endsWith('.jpg')) {
      fs.copyFileSync(file, path.join('public', file));
      frameCount++;
    }
  }
  console.log(`Copied ${frameCount} ezgif-frame files.`);

  // Copy articles.json if exists
  if (fs.existsSync('articles.json')) {
    fs.copyFileSync('articles.json', path.join('public', 'articles.json'));
    console.log('Copied file: articles.json');
  }

  // Pre-render static article HTML files for static hosting social crawlers
  const indexHtmlPath = path.join('public', 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    const articlesFile = fs.existsSync('articles.json') ? 'articles.json' : null;
    let articlesList = [];
    if (articlesFile) {
      try { articlesList = JSON.parse(fs.readFileSync(articlesFile, 'utf8')); } catch (e) {}
    }
    if (!articlesList || articlesList.length === 0) {
      articlesList = [
        {
          id: 'seed-1',
          slug: 'exhilarating-magic-of-stock-markets',
          title: 'The Psychology of Market Volatility',
          socialShareTitle: 'How Emotional Intelligence Shapes Financial Resilience',
          socialShareDescription: 'Discover how emotional intelligence helps investors make better decisions, overcome market anxiety, and create long-term financial success.',
          socialShareImage: 'assets/images/book2.jpeg',
          content: 'Understanding how emotional intelligence impacts investment decisions...'
        },
        {
          id: 'seed-2',
          slug: 'agilent-the-fast-and-focused',
          title: 'Defining Agility in Modern Workspaces',
          socialShareTitle: 'Defining Agility in Modern Workspaces',
          socialShareDescription: 'Explore the core mechanisms of emotional and organizational agility needed to navigate modern hybrid work environments effectively.',
          socialShareImage: 'assets/images/photo.jpeg',
          content: 'Organizational structures are rapidly evolving...'
        },
        {
          id: 'seed-3',
          slug: 'rekindled-life',
          title: 'Rekindling Purpose in Professional Life',
          socialShareTitle: 'Rekindling Purpose in Professional Life',
          socialShareDescription: 'A guide to finding meaningful work alignment, sustained resilience, and avoiding burnout through conscious reflection.',
          socialShareImage: 'assets/images/book1.jpeg',
          content: 'A guide to finding meaningful work alignment...'
        }
      ];
    }

    const slugifyBuild = (txt) => {
      if (!txt) return '';
      return txt.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
    };

    const articlesPublicDir = path.join('public', 'articles');
    const articlePublicDir = path.join('public', 'article');
    fs.mkdirSync(articlesPublicDir, { recursive: true });
    fs.mkdirSync(articlePublicDir, { recursive: true });

    const normalizeImageUrl = (url) => {
      if (!url || typeof url !== 'string') return '/assets/images/photo.jpeg';
      const trimmed = url.trim();
      if (!trimmed) return '/assets/images/photo.jpeg';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
      }
      if (trimmed.startsWith('./')) {
        return '/' + trimmed.substring(2);
      }
      if (!trimmed.startsWith('/')) {
        return '/' + trimmed;
      }
      return trimmed;
    };

    articlesList.forEach(art => {
      const slug = art.slug || slugifyBuild(art.title) || art.id;
      const title = art.socialShareTitle || art.seoTitle || art.title;
      const cleanText = (art.socialShareDescription || (art.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()).substring(0, 180);
      const rawImg = art.socialShareImage || art.image;
      const img = normalizeImageUrl(rawImg);
      const canonicalUrl = `/articles/${slug}`;

      let artHtml = indexHtmlContent
        .replace(/<title>.*?<\/title>/i, `<title>${title} | Dr. Anju Bathla Arora</title>`)
        .replace(/<meta property="og:title".*?>/i, `<meta property="og:title" content="${title}">`)
        .replace(/<meta property="og:description".*?>/i, `<meta property="og:description" content="${cleanText}">`)
        .replace(/<meta property="og:image".*?>/i, `<meta property="og:image" content="${img}">`)
        .replace(/<meta property="og:url".*?>/i, `<meta property="og:url" content="${canonicalUrl}">`)
        .replace(/<meta name="twitter:title".*?>/i, `<meta name="twitter:title" content="${title}">`)
        .replace(/<meta name="twitter:description".*?>/i, `<meta name="twitter:description" content="${cleanText}">`)
        .replace(/<meta name="twitter:image".*?>/i, `<meta name="twitter:image" content="${img}">`)
        .replace(/<link rel="canonical".*?>/i, `<link rel="canonical" href="${canonicalUrl}">`);

      // Write /articles/{slug}.html
      fs.writeFileSync(path.join(articlesPublicDir, `${slug}.html`), artHtml, 'utf8');

      // Write /articles/{slug}/index.html for nested directory routing
      const subDir = path.join(articlesPublicDir, slug);
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(subDir, 'index.html'), artHtml, 'utf8');

      // Write legacy /article/{id}.html
      fs.writeFileSync(path.join(articlePublicDir, `${art.id}.html`), artHtml, 'utf8');
    });
    console.log(`Pre-rendered ${articlesList.length} static article fallback HTML files in public/articles/`);

    // Write public/404.html for GitHub Pages / Netlify / Vercel SPA routing fallback
    fs.writeFileSync(path.join('public', '404.html'), indexHtmlContent, 'utf8');
    console.log('Created public/404.html SPA router fallback');
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}
