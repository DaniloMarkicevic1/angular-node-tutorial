const express = require("express");

const checkAuth = require("../middleware/check-auth");
const {
  createPost,
  fetchPosts,
  fetchPost,
  editPost,
  deletePost,
} = require("../controllers/posts");
const upload = require("../middleware/file");

const router = express.Router();

router.post("", checkAuth, upload, createPost);
router.get("", fetchPosts);
router.get("/:id", fetchPost);

router.put("/:id", checkAuth, upload, editPost);

router.delete("/:id", checkAuth, deletePost);

module.exports = router;
