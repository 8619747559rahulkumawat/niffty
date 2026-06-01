const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const ecommerceService = require('../services/ecommerceService');
const { auth } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

router.get('/webhooks', auth, tenantMiddleware, integrationController.getWebhooks);
router.post('/webhooks', auth, tenantMiddleware, integrationController.createWebhook);
router.put('/webhooks/:id', auth, tenantMiddleware, integrationController.updateWebhook);
router.delete('/webhooks/:id', auth, tenantMiddleware, integrationController.deleteWebhook);
router.post('/webhooks/:id/test', auth, tenantMiddleware, integrationController.testWebhook);

router.get('/api-keys', auth, tenantMiddleware, integrationController.getApiKeys);
router.post('/api-keys', auth, tenantMiddleware, integrationController.createApiKey);
router.delete('/api-keys/:id', auth, tenantMiddleware, integrationController.deleteApiKey);

// Shopify webhook endpoints (no auth - verified by HMAC)
router.post('/shopify/abandoned-checkout', async (req, res) => {
  try {
    const result = await ecommerceService.handleAbandonedCheckout(req.body, 'shopify', req.body.tenantId || null, req.app.get('io'));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/shopify/order-created', async (req, res) => {
  try {
    const result = await ecommerceService.handleOrderCreated(req.body, 'shopify', req.body.tenantId || null, req.app.get('io'));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/shopify/order-updated', async (req, res) => {
  try {
    const result = await ecommerceService.handleOrderUpdated(req.body, 'shopify', req.body.tenantId || null, req.app.get('io'));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// WooCommerce webhook endpoints (no auth - verified by signature)
router.post('/woocommerce/abandoned-checkout', async (req, res) => {
  try {
    const result = await ecommerceService.handleAbandonedCheckout(req.body, 'woocommerce', req.body.tenantId || null, req.app.get('io'));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/woocommerce/order-created', async (req, res) => {
  try {
    const result = await ecommerceService.handleOrderCreated(req.body, 'woocommerce', req.body.tenantId || null, req.app.get('io'));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/woocommerce/order-updated', async (req, res) => {
  try {
    const result = await ecommerceService.handleOrderUpdated(req.body, 'woocommerce', req.body.tenantId || null, req.app.get('io'));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
