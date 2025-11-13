document.addEventListener("DOMContentLoaded", async () => {
  try {
    const resposta = await fetch("http://localhost:3000/membros")
    const membros = await resposta.json()

    const grupos = {
      coordenadores: [],
      pesquisadores: [],
      doutorandos: [],
      mestrandos: [],
      bolsistas: []
    }

    membros.forEach(m => {
      const grupoBanco = m.grupo?.toLowerCase() || ""
      let grupo
      if (grupoBanco.includes("coorden")) grupo = "coordenadores"
      else if (grupoBanco.includes("pesquis")) grupo = "pesquisadores"
      else if (grupoBanco.includes("doutor")) grupo = "doutorandos"
      else if (grupoBanco.includes("mestr")) grupo = "mestrandos"
      else grupo = "bolsistas"
      grupos[grupo].push(m)
    })

    Object.keys(grupos).forEach(grupo => {
      grupos[grupo].sort((a, b) => a.nome.localeCompare(b.nome))
    })

    Object.entries(grupos).forEach(([grupo, lista]) => {
      const container = document.querySelector(`.grupo-membros[data-grupo="${grupo}"] .grade-membros`)
      if (!container) return
      container.innerHTML = ""

      lista.forEach(m => {
        const card = document.createElement("div")
        card.classList.add("card-membro")

        const srcImg =
          m.foto_url ||
          (m.foto ? `http://localhost:3000${m.foto}` : "") ||
          "imagens/placeholder.png"

        card.innerHTML = `
          <div class="card-frente">
            <img src="${srcImg}" alt="Foto de ${m.nome}">
            <div class="nome-membro-banner">
              <h3>${m.nome}</h3>
              <p>${m.grupo}</p>
            </div>
          </div>
          <div class="card-verso">
            <p>${m.descricao || ""}</p>
            <a href="${m.link || "#"}" target="_blank" class="lattes-link">
              <span class="lattes-ver">Ver</span>
              <span class="lattes-curriculo">CURRÍCULO</span>
              <span class="lattes-lattes">LATTES</span>
            </a>
          </div>
        `
        container.appendChild(card)
      })
    })

    document.querySelectorAll(".grupo-membros").forEach(secao => {
      const botao = secao.querySelector(".toggle-btn")
      const conteudo = secao.querySelector(".grade-membros")
      secao.classList.add("aberto")
      botao.addEventListener("click", () => {
        secao.classList.toggle("aberto")
        conteudo.style.display = secao.classList.contains("aberto") ? "grid" : "none"
      })
    })
  } catch (erro) {
    console.error("Erro ao carregar membros:", erro)
  }
})
