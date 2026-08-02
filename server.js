const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

const DEFAULT_ARTICLES = [
  {
    id: 'seed-1',
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
    image: 'assets/images/book2.jpeg'
  },
  {
    id: 'seed-2',
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
    image: 'assets/images/photo.jpeg'
  },
  {
    id: 'seed-3',
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
    image: 'assets/images/book1.jpeg'
  }
];

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

function getArticles() {
  const filePath = path.join(__dirname, 'articles.json');
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read articles.json:', e);
    }
  }
  return DEFAULT_ARTICLES;
}

function saveArticlesData(articles) {
  const filePath = path.join(__dirname, 'articles.json');
  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf8');
}

function getExcerpt(content) {
  if (!content) return '';
  const clean = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= 180) return clean;
  let truncated = clean.substring(0, 175);
  let lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 100) {
    truncated = truncated.substring(0, lastSpace);
  }
  return truncated + '...';
}

function injectOGMetadata(html, article, host, protocol) {
  const title = article.socialShareTitle || article.seoTitle || article.title;
  const description = article.socialShareDescription || getExcerpt(article.content);
  const canonicalUrl = `${protocol}://${host}/?article=${article.id}`;

  let image = article.socialShareImage || article.image || 'assets/images/photo.jpeg';
  if (!image.startsWith('http://') && !image.startsWith('https://')) {
    image = `${protocol}://${host}/${image.replace(/^\//, '')}`;
  }

  let updatedHtml = html;

  // Replace Title
  updatedHtml = updatedHtml.replace(/<title>.*?<\/title>/i, `<title>${title} | Dr. Anju Bathla Arora</title>`);

  // Meta helper
  const replaceOrInjectMeta = (htmlStr, tagAttr, tagVal, newMeta) => {
    const reg = new RegExp(`<meta\\s+${tagAttr}=["']${tagVal}["'].*?>`, 'i');
    if (reg.test(htmlStr)) {
      return htmlStr.replace(reg, newMeta);
    }
    return htmlStr.replace('</head>', `  ${newMeta}\n</head>`);
  };

  updatedHtml = replaceOrInjectMeta(updatedHtml, 'property', 'og:title', `<meta property="og:title" content="${title}">`);
  updatedHtml = replaceOrInjectMeta(updatedHtml, 'property', 'og:description', `<meta property="og:description" content="${description}">`);
  updatedHtml = replaceOrInjectMeta(updatedHtml, 'property', 'og:image', `<meta property="og:image" content="${image}">`);
  updatedHtml = replaceOrInjectMeta(updatedHtml, 'property', 'og:url', `<meta property="og:url" content="${canonicalUrl}">`);
  updatedHtml = replaceOrInjectMeta(updatedHtml, 'property', 'og:type', `<meta property="og:type" content="article">`);
  updatedHtml = replaceOrInjectMeta(updatedHtml, 'property', 'og:site_name', `<meta property="og:site_name" content="Dr. Anju Bathla Arora">`);

  updatedHtml = replaceOrInjectMeta(updatedHtml, 'name', 'twitter:card', `<meta name="twitter:card" content="summary_large_image">`);
  updatedHtml = replaceOrInjectMeta(updatedHtml, 'name', 'twitter:title', `<meta name="twitter:title" content="${title}">`);
  updatedHtml = replaceOrInjectMeta(updatedHtml, 'name', 'twitter:description', `<meta name="twitter:description" content="${description}">`);
  updatedHtml = replaceOrInjectMeta(updatedHtml, 'name', 'twitter:image', `<meta name="twitter:image" content="${image}">`);

  const canonicalReg = /<link\s+rel=["']canonical["'].*?>/i;
  const newCanonical = `<link rel="canonical" href="${canonicalUrl}">`;
  if (canonicalReg.test(updatedHtml)) {
    updatedHtml = updatedHtml.replace(canonicalReg, newCanonical);
  } else {
    updatedHtml = updatedHtml.replace('</head>', `  ${newCanonical}\n</head>`);
  }

  return updatedHtml;
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const protocol = req.headers['x-forwarded-proto'] || 'http';

  // API Endpoint for saving articles
  if (req.method === 'POST' && req.url === '/api/articles') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const articles = JSON.parse(body);
        saveArticlesData(articles);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // API Endpoint for fetching articles
  if (req.method === 'GET' && req.url === '/api/articles') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getArticles()));
    return;
  }

  // URL parsing
  const parsedUrl = new URL(req.url, `${protocol}://${host}`);
  const urlPath = parsedUrl.pathname;
  let articleId = parsedUrl.searchParams.get('article') || parsedUrl.searchParams.get('id');

  // Handle /article/:id path routing
  if (!articleId && urlPath.startsWith('/article/')) {
    articleId = urlPath.replace('/article/', '').replace(/\.html$/, '');
  }

  let filePath = (urlPath === '/' || urlPath === '' || urlPath.startsWith('/article/')) ? './index.html' : '.' + urlPath;
  const resolvedPath = path.resolve(filePath);
  const rootPath = path.resolve('.');
  
  if (!resolvedPath.startsWith(rootPath)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (ext === '.html' || ext === '') {
    const htmlFileToRead = ext === '' ? resolvedPath + '.html' : resolvedPath;
    fs.readFile(htmlFileToRead, 'utf8', (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File Not Found');
        } else {
          res.statusCode = 500;
          res.end(`Server Error: ${err.code}`);
        }
        return;
      }

      if (articleId) {
        const articles = getArticles();
        const art = articles.find(a => a.id === articleId || a.id === 'seed-' + articleId || a.id.toLowerCase() === articleId.toLowerCase());
        if (art) {
          content = injectOGMetadata(content, art, host, protocol);
        }
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  // Serve static asset files
  fs.readFile(resolvedPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('File Not Found');
      } else {
        res.statusCode = 500;
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
