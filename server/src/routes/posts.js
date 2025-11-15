const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const multer = require('multer');
const slugify = require('slugify');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// simple disk storage for uploads (for dev). create server/uploads dir
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// GET /api/posts?search=&category=&page=&limit=
router.get(
  '/',
  [
    query('page').optional().toInt(),
    query('limit').optional().toInt()
  ],
  async (req, res, next) => {
    try {
      const page = Math.max(1, req.query.page || 1);
      const limit = Math.min(100, req.query.limit || 10);
      const skip = (page - 1) * limit;

      const search = req.query.search || '';
      const category = req.query.category;

      const filter = {};
      if (search) filter.$text = { $search: search };
      if (category) filter.category = category;

      const total = await Post.countDocuments(filter);
      const posts = await Post.find(filter)
        .populate('category')
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({ data: posts, pagination: { page, limit, total } });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/posts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('category').populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts (create)
router.post(
  '/',
  requireAuth,
  upload.single('featuredImage'),
  [
    body('title').isLength({ min: 3 }),
    body('content').isLength({ min: 10 }),
    body('category').optional().isMongoId()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, content, excerpt, category, tags } = req.body;
      const slug = slugify(title, { lower: true, strict: true });

      // ensure slug unique (very simple)
      let uniqueSlug = slug;
      let i = 1;
      while (await Post.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${i++}`;
      }

      const post = new Post({
        title,
        slug: uniqueSlug,
        content,
        excerpt,
        category: category || null,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t=>t.trim())) : [],
        author: req.user._id,
        featuredImage: req.file ? `/uploads/${req.file.filename}` : undefined
      });

      await post.save();
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/posts/:id (update)
router.put(
  '/:id',
  requireAuth,
  upload.single('featuredImage'),
  [
    param('id').isMongoId(),
    body('title').optional().isLength({ min: 3 }),
    body('content').optional().isLength({ min: 10 })
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      // Only author can update (simple check)
      if (!post.author.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });

      const updates = req.body;
      if (req.file) updates.featuredImage = `/uploads/${req.file.filename}`;
      updates.updatedAt = Date.now();

      Object.assign(post, updates);
      await post.save();
      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.author.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    await post.remove();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/comments
router.post(
  '/:id/comments',
  [body('author').isLength({ min: 2 }), body('content').isLength({ min: 1 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      post.comments.push({ author: req.body.author, content: req.body.content });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;