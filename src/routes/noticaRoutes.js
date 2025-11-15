const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticiaController');

// Rotas para o CRUD de notícias
router.get('/', noticeController.getAllNoticias);
router.post('/', noticeController.createNoticia);
router.get('/destaques', noticeController.getDestaqueNoticias);
router.get('/defesas', noticeController.getDefesasNoticias);
router.put('/:id',noticeController.updateNoticia);
router.delete('/:id', noticeController.deleteNoticia);
router.delete('/', noticeController.deleteAllNoticias);


module.exports = router;