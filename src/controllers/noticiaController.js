const { pool } = require('../database/dbConfig');

// GET ALL notícias
async function getAllNoticias(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM noticias WHERE exibir = true ORDER BY data_criacao DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
};


// GET notícias DESTAQUE
async function getDestaqueNoticias(_req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM noticias WHERE destaque = true AND exibir = true ORDER BY data_criacao DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar notícias destaque:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias destaque' });
  }
};

async function getDefesasNoticias(_req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM noticias WHERE categoria = Defesa AND exibir = true ORDER BY data_criacao DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar notícias de defesa:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias de defesa' });
  }
};

//DELETE noticia
async function deleteNoticia(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM noticias WHERE id_noticias = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada para exclusão' });
    }

    res.status(200).json({ message: 'Notícia deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar notícia:', error);
    res.status(500).json({ error: 'Erro ao deletar notícia' });
  }
}

//DELETE all noticias
async function deleteAllNoticias(_req, res) {
  try {
    await pool.query('TRUNCATE TABLE noticias RESTART IDENTITY CASCADE');
    res.status(200).json({ message: 'Todas as notícias foram deletadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar todas as notícias:', error);
    res.status(500).json({ error: 'Erro ao deletar todas as notícias' });
  }
}

//CREATE noticia
async function createNoticia(req, res) {
  const { titulo, subtitulo, data_criacao, url_imagem, texto, categoria,destaque,url_noticia, exibir} = req.body;

  exibir = (exibir === 'on' || exibir === 'true' || exibir === true);    
  
  try {
    const result = await pool.query(
      `INSERT INTO noticias (titulo, subtitulo, data_criacao, url_imagem, texto, categoria,destaque, url_noticia, exibir)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [titulo, subtitulo, data_criacao, url_imagem, texto,categoria,destaque,url_noticia, exibir]
    );

    const noticia = result.rows[0];
    res.status(201).json({
      message: 'Notícia criada com sucesso!',
      noticia
    });
  } catch (error) {
    console.error('Erro ao criar notícia:', error);
    res.status(500).json({ error: 'Erro ao criar notícia' });
  }
}

//UPDATE noticia
async function updateNoticia(req, res) {
  const { id } = req.params;
  // Pegue todas as colunas que podem ser atualizadas
  let { titulo, subtitulo, data_criacao, url_imagem, texto, categoria, destaque, url_noticia, exibir } = req.body;
  
  // Trata o 'exibir' que vem do formulário
  exibir = (exibir === 'on' || exibir === 'true' || exibir === true);

  try {
    
    const result = await pool.query(
      `UPDATE noticias
       SET 
         titulo = $1, 
         subtitulo = $2, 
         data_criacao = $3, 
         url_imagem = $4, 
         texto = $5, 
         categoria = $6, 
         destaque = $7, 
         url_noticia = $8,
         exibir = $9
       WHERE id_noticias = $10
       RETURNING *`,
      [titulo, subtitulo, data_criacao, url_imagem, texto, categoria, destaque, url_noticia, exibir, id] 
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada para atualização' });
    }
    
    res.status(200).json({
      message: 'Notícia atualizada com sucesso!',
      noticia: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error);
    res.status(500).json({ error: 'Erro ao atualizar notícia' });
  }
}


module.exports = {
  createNoticia,
  getAllNoticias,
  getDestaqueNoticias,
  getDefesasNoticias,
  updateNoticia,
  deleteNoticia,
  deleteAllNoticias
};

