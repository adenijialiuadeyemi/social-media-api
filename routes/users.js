import express from "express"
import bcrypt from "bcrypt"
import { User } from "../models/User.js"
const router = express.Router()

//GET A USER
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    !user && res.json({
      status: 404,
      message: "User not found"
    })
    res.json({
      "status": 200,
      "message": "User retrieved successfully",
      "data": user
    })
  } catch (err) {
    res.json({
      "status": 500,
      "message": err.message
    })
  }
})

//UPDATE A USER
router.put('/:id', async (req, res) => {
  try {
    // Check if the user has permissions to update
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      // Hash password if provided
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      // Update user details
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true } // Return the updated user
      );
      !user && res.json({
        status: 404,
        message: "Account not found"
      })
      res.json({
        status: 200,
        message: "User updated successfully",
        data: user
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "You can't update another account"
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message || "An error occurred"
    });
  }
});

// DELETE A USER
router.delete('/:id', async (req, res) => {
  try {
    // Check if the user has permissions to delete
    if (req.body.userId === req.params.id) {
      const user = await User.findByIdAndDelete(req.params.id);
      !user && res.json({
        status: 404,
        message: "Account not found"
      })
      res.json({
        status: 200,
        message: "Account deleted successfully"
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "You can't delete another account"
      });
    }
  } catch (err) {
    res.status(404).json({
      status: 404,
      message: "User not found"
    });
  }
});

// FOLLOW A USER
router.post('/:id/follow', async (req, res) => {
  try {
    const { userId } = req.body;
    const { id: targetUserId } = req.params;

    // Ensure user is not following themselves
    if (userId === targetUserId) {
      return res.status(403).json({
        status: 403,
        message: "You cannot follow yourself"
      });
    }

    // Fetch target user and current user
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({
        status: 404,
        message: "User not found"
      });
    }

    // Check if already following
    if (targetUser.followers.includes(userId)) {
      return res.status(403).json({
        status: 403,
        message: "You are already a follower"
      });
    }

    // Update followers and following arrays
    await targetUser.updateOne({ $push: { followers: userId } });
    await currentUser.updateOne({ $push: { following: targetUserId } });

    res.status(200).json({
      status: 200,
      message: "You have successfully followed"
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message || "An error occurred while following the user"
    });
  }
});

//UNFOLLOW A USER
router.post('/:id/unfollow', async (req, res) => {
  try {
    const { id: targetUserId } = req.params
    const { userId: currentUserId } = req.body

    //User cant unfollow themselves
    if (currentUserId === targetUserId) {
      res.status(403).json({
        status: 403,
        message: "You cannot unfollow yourself"
      })
    }

    //Check if users exist
    const currentUser = await User.findById(currentUserId)
    const targetUser = await User.findById(targetUserId)

    if (!currentUser || !targetUser) {
      res.status(404).json({
        status: 404,
        message: "Users not found"
      })
    }

    //check if the target user is being followed
    if (!targetUser.followers.includes(currentUserId)) {
      res.status(403).json({
        status: 403,
        message: "You have not followed before now, so you cant unfollow"
      })
    }

    await targetUser.updateOne({
      $pull: { followers: currentUserId }
    })

    await currentUser.updateOne({
      $pull: { following: targetUserId }
    })

    res.status(200).json({
      status: 200,
      message: "You have successfully unfollowed"
    })
  } catch (err) {
    res.status(404).json({
      status: 404,
      message: "Users not found"
    })
  }
})

export const userRoute = router