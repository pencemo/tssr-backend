import express from "express";
import { AddGalleryPost, deleteGalleryPost, editGalleryPost, getAllGalleryPosts } from "../controllers/galleryController.js";

const router = express.Router();

router.post("/addGallery", AddGalleryPost);
router.post("/editGallery", editGalleryPost);
router.post('/deleteGallery',deleteGalleryPost);
router.get('/fetchAllGalleryPosts', getAllGalleryPosts);

export default router;

