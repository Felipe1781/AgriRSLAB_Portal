const express = require("express");
const router = express.Router();


const noticias = require("./noticiaRoutes");
const artigos = require("./artigosRoutes")
const membros = require("./membrosRoutes");
const projetos = require("./projetosRoutes");
const email = require("./emailRoutes");

router.use('/noticias', noticias);
router.use('/artigos', artigos);
router.use('/membros', membros); 
router.use('/projetos', projetos);
router.use('/email', email);

module.exports = router;
