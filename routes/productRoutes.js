import express from "express";
const router = express.Router();

import { addProduct, getAllProducts, getProductById, updateProductById } from '../controllers/productController.js';


router.post('/addProduct', addProduct);
router.get('/getAllProducts', getAllProducts);
router.get('/getProduct', getProductById);
router.post('/updateProduct', updateProductById);


export default router;
