export const validatePost = (req, res, next) => {
  const { title, content } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required' });
  }
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Content is required' });
  }
  
  if (title.length > 200) {
    return res.status(400).json({ message: 'Title must be less than 200 characters' });
  }
  
  next();
};

export const validatePostUpdate = (req, res, next) => {
  const { title, content } = req.body;
  
  if (title !== undefined && title.trim().length === 0) {
    return res.status(400).json({ message: 'Title cannot be empty' });
  }
  
  if (content !== undefined && content.trim().length === 0) {
    return res.status(400).json({ message: 'Content cannot be empty' });
  }
  
  next();
};
