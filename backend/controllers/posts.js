const Post = require("../models/post");

exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId,
  });

  post
    .save()
    .then((createdPost) => {
      res.status(201).json({
        message: "Posts added successfully",
        post: {
          id: createdPost._id,
          title: createdPost.title,
          content: createdPost.content,
          imagePath: createdPost.imagePath,
          creator: req.userData.userId,
        },
      });
    })
    .catch((err) =>
      res.status(500).json({ message: "Creating a post failed" })
    );
};
exports.fetchPosts = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;

  let fetchedPosts;

  const postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((err) => res.status(500).json({ message: "Fetching posts failed" }));
};

exports.fetchPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json({ message: "Post fetched successfully", post });
      }
      if (!post) {
        res.status(404).json({ message: "Post not found" });
      }
    })
    .catch((err) => res.status(500).json({ message: "Fetching post failed" }));
};

exports.editPost = (req, res, next) => {
  let imagePath = req.body.imagePath;

  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    image: imagePath,
    creator: req.userData.userId,
  });

  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      console.log("🚀 ~ file: posts.js:88 ~ result:", result);
      if (result.matchedCount > 0) {
        return res
          .status(200)
          .json({ message: "Posts updated successfully!", post: post });
      }
      return res.status(401).json({ message: "Not authorized!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Couldn't update post!" });
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.id;

  Post.deleteOne({ _id: postId, creator: req.userData.userId }).then(
    (result) => {
      if (result.deletedCount > 0) {
        return res.status(200).json({ message: "Post deleted successfully" });
      }

      return res.status(401).json({ message: "Not authorized!" });
    }
  );
};
