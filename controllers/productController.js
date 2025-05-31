import Product from '../models/productSchema.js'
export const addProduct = async (req, res) => {
    try {
        const { name, course, description, price } = req.body;
        const product = await Product.create({
          name,
          courseId:course,
          description,
          price,
        });
        await product.save();
        return res.json({
            message: "Product has added .",
            success: true,
            product
        })   
    } catch (error) {
        return res.json({
            message: error.message,
            success: false
        })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("courseId", "name");
        return res.json({
            message: "All products.",
            success: true,
            products
        })   
    } catch (error) {
        return res.json({
            message: error.message,
            success: false
        })
    }
}

export const getProductById = async (req, res) => {
    const id = req.query.id;
    try {
        const product = await Product.findById(id).populate('courseId', 'name');
        return res.json({
            message: "Product details",
            success: true,
            product
        });
    } catch (error) {
        return res.json({
            message: error.message,
            success: false
        })
    }
}

export const updateProductById = async (req, res) => {
  try {
    const { id } = req.query;
    const { name, course, description, price } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Product ID is required.",
        success: false,
      });
    }

    const updateFields = {};

    if (name) updateFields.name = name;
    if (course) updateFields.courseId = course;
    if (description) updateFields.description = description;
    if (price !== undefined) updateFields.price = price;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Product has been updated successfully.",
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
      error: error.message,
    });
  }
};