// ============================================
// ELITE SOCCER EXPERIENCE - SCRIPT PRINCIPAL
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const header = document.getElementById("header");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");
    const scrollTopBtn = document.getElementById("scrollTop");
    const faqItems = document.querySelectorAll(".faq-item");
    const statNumbers = document.querySelectorAll(".stat-number");
    const form = document.getElementById("formPeneira");

    const pacoteSelect = document.getElementById("pacoteSelect");
    const resumoValor = document.getElementById("resumoValor");

    const resumoCard = document.getElementById("resumoCard");
    const resumoConteudo = document.getElementById("resumoConteudo");
    const confirmarBtn = document.getElementById("confirmarInscricao");

    let dadosTemporarios = {};

    // ============================================
    // VALORES DOS PACOTES
    // ============================================

    const valoresPacotes = {
        Basic: 197,
        Premium: 397,
        Elite: 697
    };

    function formatarMoeda(valor) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // ============================================
    // MOSTRAR VALOR AUTOMÁTICO
    // ============================================

    pacoteSelect?.addEventListener("change", function () {
        const pacote = this.value;
        const valor = valoresPacotes[pacote];

        if (valor) {
            resumoValor.textContent = `Valor: ${formatarMoeda(valor)}`;
        } else {
            resumoValor.textContent = "Valor: R$ 0,00";
        }
    });

    // ============================================
    // MOBILE MENU
    // ============================================

    navToggle?.addEventListener("click", () => {
        navToggle.classList.toggle("active");
        navMenu?.classList.toggle("active");
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navMenu?.classList.remove("active");
            navToggle?.classList.remove("active");
        });
    });

    // ============================================
    // HEADER SCROLL
    // ============================================

    window.addEventListener("scroll", () => {
        header?.classList.toggle("scrolled", window.scrollY > 80);
        scrollTopBtn?.classList.toggle("visible", window.scrollY > 400);
    });

    scrollTopBtn?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ============================================
    // FAQ
    // ============================================

    faqItems.forEach(item => {
        item.addEventListener("click", () => {
            faqItems.forEach(f => f.classList.remove("active"));
            item.classList.toggle("active");
        });
    });

    // ============================================
    // ANIMAÇÃO DOS NÚMEROS
    // ============================================

    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;

        const update = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        };
        update();
    }

    const statsObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            statNumbers.forEach(stat => {
                animateCounter(stat, parseInt(stat.dataset.target));
            });
            statsObserver.disconnect();
        }
    }, { threshold: 0.5 });

    document.querySelector(".hero") && statsObserver.observe(document.querySelector(".hero"));

    // ============================================
    // MOSTRAR RESUMO ANTES DE ENVIAR
    // ============================================

    form?.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        dadosTemporarios = data;

        const valor = valoresPacotes[data.pacote] || 0;

        resumoConteudo.innerHTML = `
    <p><strong>Nome:</strong> ${data.nome}</p>
    <p><strong>Data de Nascimento:</strong> ${data.data}</p>
    <p><strong>Posição:</strong> ${data.posicao}</p>
    <p><strong>Telefone:</strong> ${data.telefone}</p>
    <p><strong>Responsável:</strong> ${data.responsavel}</p>
    <p><strong>Pacote:</strong> ${data.pacote}</p>
`;

        document.getElementById("valorFinal").textContent =
            formatarMoeda(valor);

        resumoCard.style.display = "block";
        window.scrollTo({ top: resumoCard.offsetTop - 100, behavior: "smooth" });
    });

    // ============================================
    // CONFIRMAR E ENVIAR PARA PLANILHA
    // ============================================
    confirmarBtn?.addEventListener("click", async function () {

        try {

            // 🔹 1 - Enviar para Google Sheets
            await fetch("https://script.google.com/macros/s/AKfycbywlzt1oRzdVAvNFP3oknJsH7Pp3Cg38qVVAqiraW1ACZtuF0ElwkAk5idk1gMvs4xadw/exec", {
                method: "POST",
                mode: "no-cors", // 👈 IMPORTANTE
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosTemporarios)
            });

            // 2 - Cria pagamentos
            confirmarBtn.disabled = true;
            const response = await fetch("https://SEU-BACKEND.onrender.com/criar_pagamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...dadosTemporarios,
                    valor: valoresPacotes[dadosTemporarios.pacote]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert("❌ Erro ao criar pagamento.");
                return;
            }



            // 🔥 LIMPA o container antes de criar novamente
            const container = document.getElementById("wallet_container");
            container.innerHTML = "";

            const mp = new MercadoPago("APP_USR-894c3446-4efb-4fa6-8079-b18633624f39", {
                locale: "pt-BR"
            });

            const bricksBuilder = mp.bricks();

            await bricksBuilder.create("wallet", "wallet_container", {
                initialization: {
                    preferenceId: data.id
                }
            });

            confirmarBtn.style.display = "none";

        } catch (error) {
            console.error(error);
            alert("❌ Erro de conexão.");
        }

    });
    // 👈 ESSA AQUI TEM QUE EXISTIR

    console.log("⚽ Elite Soccer Experience carregado com sucesso!");

}); // 👈 E ESSA AQUI TAMBÉM (fecha o DOMContentLoaded)

