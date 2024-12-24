import express from 'express'
import { Post } from '../models/Post.js'
import { User } from '../models/User.js'

const router = express.Router()

//CREATE A POST
router.post('/', async (req, res) => {
  try {
    const newPost = new Post(req.body)

    await newPost.save()
    res.status(200).json({
      status: 200,
      message: "Post created successfully",
      data: newPost
    })

  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message
    })
  }
})


//GET A POST
router.get('/:id', async (req, res) => {
  try {
    const { id: postId } = req.params

    const post = await Post.findById(postId)
    res.status(200).json({
      status: 200,
      message: "Post retrieved successfully",
      data: post

    })
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message
    })
  }
})

//UPDATE A POST
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    //check if a user is allowed to update
    if (post.userId !== req.body.userId) {
      return res.status(403).json({
        status: 403,
        message: "You cant update another users post"
      })
    }
    //update the post
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    res.status(200).json({
      status: 200,
      message: "Post Updated Successfully",
      data: updatedPost
    })
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message
    })
  }
})

//DELETE A POST
router.delete("/:id", async (req, res) => {

  try {
    const post = await Post.findById(req.params.id)
    //check if a user can delete a post
    if (post.userId !== req.body.userId) {
      res.status(403).json({
        status: 403,
        message: "You cant delete another users post"
      })
    }

    //delete a post
    await Post.findByIdAndDelete(req.params.id)
    res.status(200).json({
      status: 200,
      message: "Post Successfully Deleted"
    })

  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message
    })
  }
})


// LIKE A POST
router.post("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;

    // Check if the post exists
    /* if (!post) {
      return res.status(404).json({
        status: 404,
        message: "Post not found",
      });
    } */

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(403).json({
        status: 403,
        message: "You already liked this post",
      });
    }

    // Add the user's ID to the likes array
    await post.updateOne({ $push: { likes: userId } });

    res.status(200).json({
      status: 200,
      message: "Post liked successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message || "An error occurred while liking the post",
    });
  }
});

// UNLIKE A POST
router.post("/:id/unlike", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;

    // Check if the post exists
    /*   if (!post) {
        return res.status(404).json({
          status: 404,
          message: "Post not found",
        });
      } */

    // Check if the user has already liked the post
    if (!post.likes.includes(userId)) {
      return res.status(403).json({
        status: 403,
        message: "You can't unlike a post you haven't liked",
      });
    }

    // Remove the user's ID from the likes array
    await post.updateOne({ $pull: { likes: userId } });

    res.status(200).json({
      status: 200,
      message: "Post unliked successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message || "An error occurred while unliking the post",
    });
  }
});


// GET TIMELINE POSTS - Get all posts based on user's followings and own posts
router.get('/timeline/all', async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);

    if (!currentUser) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Fetch user's own posts
    const userPosts = await Post.find({ userId: currentUser._id });

    // Fetch posts from the user's followings
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );

    // Combine all posts and return
    const allPosts = userPosts.concat(...friendPosts);

    res.status(200).json({
      status: 200,
      message: "Timeline fetched successfully",
      data: allPosts,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message || "An error occurred",
    });
  }
});


export const postRoute = router