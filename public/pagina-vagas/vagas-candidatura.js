document.addEventListener("DOMContentLoaded", carregarVaga);

async function carregarVaga() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error("ID da vaga não encontrado na URL.");
    return;
  }

  try {
    const resposta = await fetch(`/api/vagas/${id}`);
    const vaga = await resposta.json();

    if (!vaga || vaga.mensagem === "Vaga não encontrada.") {
      document.querySelector(".vacancy-canditadura").innerHTML =
        "<p>Vaga não encontrada.</p>";
      return;
    }

    // Preencher título
    document.getElementById("vaga-titulo").textContent = vaga.titulo;

    // Preencher descrição
    document.getElementById("vaga-descricao").textContent = vaga.descricao;

    // Preencher requisitos
    document.getElementById("vaga-requisitos").innerHTML =
      vaga.requisitos.map(req => `<li>${req}</li>`).join("");

    // Preencher benefícios
    document.getElementById("vaga-beneficios").innerHTML =
      vaga.beneficios.map(b => `<li>${b}</li>`).join("");

  } catch (erro) {
    console.error("Erro ao carregar vaga:", erro);
  }
}
