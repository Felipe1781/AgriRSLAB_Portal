const { pool } = require('../database/dbConfig');
const fs = require('fs'); // Para deletar arquivos no servidor
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

router.get("/__health", (req, res) => {
  res.json({
    pid: process.pid,
    file: __filename,
    uploads_route: "/uploads -> " + UPLOAD_BASE,
    now: new Date().toISOString()
  })
})

// Listar membros
router.get("/membros", async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT m.id, m.nome, m.descricao, m.link, m.foto, g.nome AS grupo
      FROM membros m
      JOIN grupos g ON m.grupo_id = g.id
      ORDER BY g.nome, m.nome
    `)
    res.json(r.rows.map(row => withFotoUrl(req, row)))
  } catch (e) {
    res.status(500).json({ erro: e.message })
  }
})

// Criar membro com upload
router.post("/membros", upload.single("foto"), async (req, res) => {
  try {
    const { nome, descricao, link, grupo_id } = req.body
    const grupo_id_num = Number(grupo_id)

    let foto = req.file ? `/uploads/membros/${req.file.filename}` : null
    console.log("[POST] filename:", req.file?.filename, "foto antes:", foto)
    foto = normalizeFotoPath(foto)

    // VALIDAÇÃO DURA: se sobrou singular, recusa
    if (foto && !foto.startsWith("/uploads/membros/")) {
      return res.status(400).json({ erro: "Caminho de foto inválido" })
    }

    const r = await pool.query(
      `INSERT INTO membros (nome, descricao, link, foto, grupo_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, descricao, link, foto, grupo_id_num]
    )
    console.log("[POST] foto salva:", r.rows[0].foto)

    res.status(201).json(withFotoUrl(req, r.rows[0]))
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: e.message })
  }
})

// Atualizar membro com foto opcional
router.put("/membros/:id", upload.single("foto"), async (req, res) => {
  try {
    const { id } = req.params
    const a = await pool.query("SELECT * FROM membros WHERE id = $1", [id])
    if (!a.rows.length) return res.status(404).json({ erro: "Membro não encontrado" })
    const row = a.rows[0]

    const nome = req.body.nome?.trim() ? req.body.nome : row.nome
    const descricao = req.body.descricao?.trim() ? req.body.descricao : row.descricao
    const link = req.body.link?.trim() ? req.body.link : row.link
    const grupo_id = req.body.grupo_id !== undefined && req.body.grupo_id !== "" ? Number(req.body.grupo_id) : row.grupo_id

    let foto = req.file ? `/uploads/membros/${req.file.filename}` : (req.body.foto || row.foto)
    console.log("[PUT ] filename:", req.file?.filename, "foto antes:", foto)
    foto = normalizeFotoPath(foto)

    // VALIDAÇÃO DURA
    if (foto && !foto.startsWith("/uploads/membros/")) {
      return res.status(400).json({ erro: "Caminho de foto inválido" })
    }

    const r = await pool.query(
      `UPDATE membros
       SET nome = $1, descricao = $2, link = $3, foto = $4, grupo_id = $5
       WHERE id = $6
       RETURNING *`,
      [nome, descricao, link, foto, grupo_id, id]
    )
    console.log("[PUT ] foto salva:", r.rows[0].foto)

    if (req.file && row.foto) {
      try {
        const antigo = path.join(UPLOAD_MEMBROS, path.basename(row.foto))
        await fs.promises.unlink(antigo)
      } catch {}
    }

    res.json(withFotoUrl(req, r.rows[0]))
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: e.message })
  }
})

// Deletar membro e apagar foto em disco
router.delete("/membros/:id", async (req, res) => {
  try {
    const { id } = req.params
    const b = await pool.query("SELECT foto FROM membros WHERE id = $1", [id])
    if (!b.rows.length) return res.status(404).json({ erro: "Membro não encontrado" })

    const foto = normalizeFotoPath(b.rows[0].foto)
    const r = await pool.query("DELETE FROM membros WHERE id = $1 RETURNING *", [id])

    if (foto) {
      try {
        const arq = path.join(UPLOAD_MEMBROS, path.basename(foto))
        await fs.promises.unlink(arq)
      } catch {}
    }

    res.json({ mensagem: "Membro excluído", membro: r.rows[0] })
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: e.message })
  }
})