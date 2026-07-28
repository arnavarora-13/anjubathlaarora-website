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

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}
