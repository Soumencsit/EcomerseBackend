import express from 'express'

import  {getProduct, addProducts}  from '../controller/productController.js'
const createRouter=express.Router()

createRouter.get('/list',getProduct)
createRouter.post('/add',addProducts)


export default createRouter