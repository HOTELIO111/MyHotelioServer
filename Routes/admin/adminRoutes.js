const router = require('express').Router()
const { GetallCustomer, DeleteCustomerById } = require('../../Controllers/admincontrollers/admincustomerManage')


router.get("/allcustomer", GetallCustomer);
router.get("/customer/delete/:id", DeleteCustomerById)



module.exports = router 