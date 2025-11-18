document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".envio-de-email-contato");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = form.querySelector("#nome")?.value?.trim() || "";
    const email = form.querySelector("#email")?.value?.trim() || "";
    const assunto = form.querySelector("#assunto")?.value?.trim() || "";
    const comentario = form.querySelector("#comentario")?.value?.trim() || "";

    if (!nome || !email || !comentario) {
      alert("Por favor, preencha nome, e-mail e mensagem.");
      return;
    }

    try {
      const resposta = await fetch("/api/email/contato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome,
          email,
          assunto,
          comentario
        })
      });

      const dados = await resposta.json().catch(() => ({}));

      if (resposta.ok) {
        alert(dados.mensagem || "Mensagem enviada com sucesso!");
        form.reset();
      } else {
        alert(
          dados.mensagem ||
            "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde."
        );
      }
    } catch (erro) {
      console.error("Erro ao enviar formulário de contato:", erro);
      alert(
        "Não foi possível enviar sua mensagem no momento. Verifique sua conexão e tente novamente."
      );
    }
  });
});

