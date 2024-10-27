
import productModel from '../model/productModel.js';
import { faker } from '@faker-js/faker';


// Product listing with pagination support
const getProduct = async (req, res) => {
  
  
  const { page = 1, limit = 6 } = req.query;

  try {
      const categories = await productModel .find()
      
          .skip((page - 1) * limit)
          .limit(Number(limit));
      
      const totalCategories = await productModel .countDocuments();
    
     
      
      res.status(200).json({
        
          data: categories,
          totalPages: Math.ceil(totalCategories / limit),
          currentPage: page,
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Product adding function
const addProducts = async (req, res) => {
  try {
    const fakeProducts = [];
    for (let i = 0; i < 100; i++) {
      const product = new productModel({
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        category: faker.commerce.department(),
        description: faker.commerce.productDescription(),
      });
      const savedProduct = await product.save();
      fakeProducts.push(savedProduct);
    }
    res.json({ Success: true, message: "100 Fake Products Added", products: fakeProducts });
  } catch (err) {
   
    res.status(500).json({ Success: false, message: "Error Adding Fake Products" });
  }
};

export { getProduct, addProducts };
