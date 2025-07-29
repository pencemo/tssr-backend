import Gallery from '../models/gallerySchema.js';

export const AddGalleryPost = async (req, res) => {
    try {
        const { image, title, description } = req.body;
        
        const newPost = await Gallery.create({
            image,
            title,
            description
        })

        res.json({
            message: "Gallery post added successfully",
            post: newPost,
            success: true
        })

    } catch (error) {
        res.json({
            message: "Error in adding gallery post",
            error: error.message,
            success: false
        })
    }
}

export const editGalleryPost = async (req, res) => {
    try {
        const { _id, image, title, description } = req.body;
        if (!_id) {
            res.json({
                message: "Post ID is required",
                success: false
            });
        }
        
        const updatePost = await Gallery.findByIdAndUpdate(
          _id,
          {
            image,
            title,
            description,
          },
          { new: true }
        );

        res.json({
            message: "Gallery post edited successfully",
            post: updatePost,
            success: true
        })
    } catch (error) {
        res.json({
            message: "Error in editing gallery post",
            error: error.message,
            success: false
        })
    }
}

export const deleteGalleryPost = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedPost = await Gallery.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.json({
                message: "Gallery post not found",
                success: false
            });
        }
        res.json({
            message: "Gallery post deleted successfully",
            post: deletedPost,
            success: true
        })
    } catch (error) {
        res.json({
            message: "Error in deleting gallery post",
            error: error.message,
            success: false
        })
    }
}

export const getAllGalleryPosts = async (req, res) => {
    try {
        const posts = await Gallery.find().sort({ createdAt: -1 }).lean();
        if(!posts || posts.length === 0) {
            return res.json({
                message: "No gallery posts found",
                success: true
            });
        }
        res.json({
            message: "Gallery posts fetched successfully",
            posts,
            success: true
        })
    } catch (error) {
        res.json({
            message: "Error in fetching gallery posts",
            error: error.message,
            success: false
        })
        
    }
}