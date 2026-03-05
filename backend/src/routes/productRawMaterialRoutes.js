const express = require('express');
const router = express.Router({ mergeParams: true });
const productRawMaterialController = require('../controllers/productRawMaterialController');

router.post('/', productRawMaterialController.associateRawMaterial);
router.get('/', productRawMaterialController.getProductRawMaterials);
router.put('/:rawMaterialId', productRawMaterialController.updateQuantityNeeded);
router.delete('/:rawMaterialId', productRawMaterialController.removeRawMaterialAssociation);

module.exports = router;