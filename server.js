import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const JWT_SECRET = process.env.JWT_SECRET;

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Unauthorised access.' }); //Access denied. No token provided.
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Your session has expired. Please login again.' }); //Invalid or expired token.
  }
}

// Setup ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

function readDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.users) {
        parsed.users = [];
      }

      // Ensure the default author/admin user is seeded
      if (!parsed.users.some(u => u.email === 'safak@lama.dev')) {
        parsed.users.push({
          id: 'user_safak',
          name: 'Safak Lama',
          email: 'safak@lama.dev',
          password: '$2b$10$MywwUYVLQS8.aGiwUmKgiOpSu3QQKq.0TyK7M2V887cLYZvU7MY7G',
          image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          role: 'admin'
        });
        fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading JSON DB, using empty fallback', err);
  }
  return {
    categories: [],
    posts: [],
    comments: [],
    users: [
      {
        id: 'user_safak',
        name: 'Safak Lama',
        email: 'safak@lama.dev',
        password: '$2b$10$MywwUYVLQS8.aGiwUmKgiOpSu3QQKq.0TyK7M2V887cLYZvU7MY7G',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: 'admin'
      }
    ]
  };
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing JSON DB', err);
    return false;
  }
}

// Simple slugify helper
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API: Health probe
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API: User registration
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, image } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const db = readDb();
    const normalizedEmail = email.toLowerCase().trim();
    if (db.users.some(u => u.email === normalizedEmail)) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    /*
    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // high quality female/male elegant default
      role: normalizedEmail === 'safak@lama.dev' ? 'admin' : 'member'
    };
 */
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // high quality female/male elegant default
      role: normalizedEmail === 'safak@lama.dev' ? 'admin' : 'member'
    };

    db.users.push(newUser);
    const success = writeDb(db);
    if (!success) {
      return res.status(500).json({ message: 'Error registering user.' });
    }

    const { password: _, ...sessionUser } = newUser;
    res.status(201).json(sessionUser);
  });

  // API: User login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const db = readDb();
    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users.find(u => u.email === normalizedEmail);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    /*
    console.log('Attempting login for:', normalizedEmail);
    console.log('User found:', user ? 'yes' : 'no');
    console.log('Stored password:', user?.password);
    console.log('Password valid:', isPasswordValid);
    */

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...sessionUser } = user;
    res.json({ ...sessionUser, token });
  });

  // API: Get categories
  app.get('/api/categories', (req, res) => {
    const db = readDb();
    res.json(db.categories);
  });

  // API: Get posts with pagination + filtering
  app.get('/api/posts', (req, res) => {
    const db = readDb();
    let posts = [...db.posts];

    // Filter by category
    const cat = req.query.cat;
    if (cat) {
      posts = posts.filter(post => post.catSlug === cat);
    }

    // Sort posts by date descending
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Highlight featured (optional, but keep in complete list if not filtering)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.json({
      posts: paginatedPosts,
      totalCount: posts.length,
      page,
      limit,
      hasPrev: page > 1,
      hasNext: endIndex < posts.length
    });
  });

  // API: Get featured post
  app.get('/api/posts/featured', (req, res) => {
    const db = readDb();
    const featured = db.posts.find(p => p.featured === true) || db.posts[0];
    res.json(featured);
  });

  // API: Get trending / popular posts
  app.get('/api/posts/popular', (req, res) => {
    const db = readDb();
    // Sort by views descending
    const popular = [...db.posts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 4);
    res.json(popular);
  });

  // API: Get single post by slug & increment views
  app.get('/api/posts/:slug', (req, res) => {
    const db = readDb();
    const { slug } = req.params;
    const postIndex = db.posts.findIndex(p => p.slug === slug);

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    db.posts[postIndex].views = (db.posts[postIndex].views || 0) + 1;
    writeDb(db);

    res.json(db.posts[postIndex]);
  });

  // API: Write/Publish a new post
  app.post('/api/posts', authenticateToken, (req, res) => {
    const { title, desc, img, catSlug, userEmail, userName, userImage } = req.body;

    if (!title || !desc || !catSlug) {
      return res.status(400).json({ message: 'Title, content, and category are required.' });
    }

    const db = readDb();
    const baseSlug = slugify(title);

    // Ensure slug uniqueness
    let targetSlug = baseSlug;
    let counter = 1;
    while (db.posts.some(p => p.slug === targetSlug)) {
      targetSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate excerpt from desc (strip markdown/HTML headers)
    const strippedText = desc
      .replace(/#+\s+/g, '') // Strip headings
      .replace(/\*\*|\*/g, '') // Strip bold/italic
      .replace(/`{3}[\s\S]*?`{3}/g, '') // Strip codeblocks
      .replace(/`.*?`/g, '') // Strip inline code
      .trim();
    const excerpt = strippedText.length > 140
      ? strippedText.substring(0, 137) + '...'
      : strippedText;

    const newPost = {
      id: `post_${Date.now()}`,
      slug: targetSlug,
      title,
      desc,
      excerpt,
      img: img || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
      views: 0,
      catSlug,
      createdAt: new Date().toISOString(),
      userEmail: userEmail || 'guest@example.com',
      userName: userName || 'Guest Writer',
      userImage: userImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      featured: false
    };

    db.posts.push(newPost);

    const success = writeDb(db);
    if (!success) {
      return res.status(500).json({ message: 'Error saving post to database.' });
    }

    res.status(201).json(newPost);
  });

  // API: Get comments for a post
  app.get('/api/comments', (req, res) => {
    const { postSlug } = req.query;
    if (!postSlug) {
      return res.status(400).json({ message: 'postSlug query parameter is required' });
    }

    const db = readDb();
    const comments = db.comments
      .filter(c => c.postSlug === postSlug)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(comments);
  });

  // API: Post a comment
  app.post('/api/comments', authenticateToken, (req, res) => {
    const { postSlug, desc, userEmail, userName, userImage } = req.body;

    if (!postSlug || !desc) {
      return res.status(400).json({ message: 'postSlug and description are required' });
    }

    const db = readDb();
    // Validate that post exists
    if (!db.posts.some(p => p.slug === postSlug)) {
      return res.status(404).json({ message: 'Cannot comment on non-existent post' });
    }

    const newComment = {
      id: `comm_${Date.now()}`,
      createdAt: new Date().toISOString(),
      desc,
      postSlug,
      userEmail: userEmail || 'guest@example.com',
      userName: userName || 'Anonymous Reader',
      userImage: userImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };

    db.comments.push(newComment);
    const success = writeDb(db);
    if (!success) {
      return res.status(500).json({ message: 'Error saving comment.' });
    }

    res.status(201).json(newComment);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/{*path}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  });
}

startServer();
