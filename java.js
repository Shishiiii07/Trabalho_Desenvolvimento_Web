// ELEMENTOS
const professor = document.getElementById("professor");
const mundo = document.getElementById("mundo");
const jogo = document.getElementById("jogo");
const pontosTela = document.getElementById("pontos");
const fim = document.getElementById("fim");

const imagens = ["fundo.png", "fundocd.png"];

const fundos = [
    { el: document.getElementById("fundo1"), x: 0, img: 0 },
    { el: document.getElementById("fundo2"), x: 600, img: 1 }
];

// CONFIGURACOES
const GRAVIDADE = 0.25;
const IMPULSO = -6.5;
const VELOCIDADE = 2.2;
const LARGURA = 600;
const ALTURA = 400;

// VARIAVEIS
let professorY = 150;
let velocidade = 0;
let pontos = 0;
let ativo = true;
let livros = [];
let tempo = 0;
let animacao = null;

// AJUSTAR TELA
function ajustarTela() {
    let escala = Math.min(jogo.clientWidth / 600, jogo.clientHeight / 400);
    mundo.style.setProperty("--escala", escala);
}

window.addEventListener("resize", ajustarTela);

// MOVIMENTAR CENARIO
function moverFundo(delta) {
    fundos.forEach(f => f.x -= 0.7 * delta);

    fundos.forEach(f => {
        if (f.x <= -600) {
            let outro = fundos.find(item => item !== f);

            f.x = outro.x + 600;
            f.img = (outro.img + 1) % imagens.length;
            f.el.src = imagens[f.img];
        }

        f.el.style.left = f.x + "px";
    });
}

// som do voar
const somVoar = new Audio("stomp.mp3");

somVoar.volume = 0.4;

function voar() {
    somVoar.currentTime = 0;
    somVoar.play();
}

// VOAR
function voar() {
    if (ativo) velocidade = IMPULSO;
    document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        somVoar.currentTime = 0;
        somVoar.play();
    }
});
}

// TECLADO
document.addEventListener("keydown", function(e) {
    if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (ativo) voar();
        else reiniciar();
    }
});

// CELULAR E MOUSE
jogo.addEventListener("pointerdown", function() {
    if (ativo) voar();
    else reiniciar();
});

// CRIAR LIVROS
function criarLivro() {
    let altura = Math.floor(Math.random() * 120) + 50;

    let cima = document.createElement("div");
    cima.className = "livro";
    cima.style.height = altura + "px";
    cima.style.top = "0";

    let baixo = document.createElement("div");
    baixo.className = "livro";
    baixo.style.height = (400 - altura - 180) + "px";
    baixo.style.bottom = "0";

    // ADICIONAR IMAGEM DOS LIVROS
    cima.style.backgroundImage = "url('livro.png')";
    baixo.style.backgroundImage = "url('livro.png')";

    cima.style.backgroundSize = "100% 100%";
    baixo.style.backgroundSize = "100% 100%";

    cima.style.backgroundRepeat = "no-repeat";
    baixo.style.backgroundRepeat = "no-repeat";

    mundo.appendChild(cima);
    mundo.appendChild(baixo);

    livros.push({ cima, baixo, x: 600, marcou: false });
}

// COLISAO
function colidiu(livro) {
    let p = professor.getBoundingClientRect();
    let c = livro.cima.getBoundingClientRect();
    let b = livro.baixo.getBoundingClientRect();

    let margem = 8;

    let esquerda = p.left + margem;
    let direita = p.right - margem;
    let topo = p.top + margem;
    let base = p.bottom - margem;

    function bate(o) {
        return direita > o.left &&
               esquerda < o.right &&
               base > o.top &&
               topo < o.bottom;
    }

    return bate(c) || bate(b);
}

// FIM DE JOGO
function terminar() {
    ativo = false;
    fim.style.display = "block";
}

// JOGO
function jogar(t) {
    animacao = null;
    if (!ativo) return;

    if (tempo === 0) tempo = t;

    let delta = Math.min((t - tempo) / 16.67, 2);
    tempo = t;

    moverFundo(delta);

    velocidade += GRAVIDADE * delta;
    professorY += velocidade * delta;
    professor.style.top = professorY + "px";

    if (livros.length === 0 ||
        livros[livros.length - 1].x <= 300) {
        criarLivro();
    }

    livros.forEach(livro => {
        livro.x -= VELOCIDADE * delta;

        livro.cima.style.left = livro.x + "px";
        livro.baixo.style.left = livro.x + "px";

        if (!livro.marcou &&
            livro.x + 36 < 150) {
            pontos++;
            pontosTela.innerText = pontos;
            livro.marcou = true;
        }

        if (colidiu(livro)) terminar();
    });

    livros = livros.filter(livro => {
        if (livro.x + 36 < 0) {
            livro.cima.remove();
            livro.baixo.remove();
            return false;
        }
        return true;
    });

    if (professorY < 0 || professorY + 50 > 400) {
        terminar();
    }

    if (ativo) animacao = requestAnimationFrame(jogar);
}

// REINICIAR
function reiniciar() {
    if (animacao !== null) cancelAnimationFrame(animacao);

    livros.forEach(livro => {
        livro.cima.remove();
        livro.baixo.remove();
    });

    livros = [];
    professorY = 150;
    velocidade = 0;
    pontos = 0;
    tempo = 0;
    ativo = true;

    professor.style.top = "150px";
    pontosTela.innerText = "0";
    fim.style.display = "none";

    fundos[0].x = 0;
    fundos[0].img = 0;
    fundos[1].x = 600;
    fundos[1].img = 1;

    fundos.forEach(f => {
        f.el.src = imagens[f.img];
        f.el.style.left = f.x + "px";
    });

    animacao = requestAnimationFrame(jogar);
}

// INICIAR
document.getElementById("reiniciar").addEventListener("click", reiniciar);

ajustarTela();
animacao = requestAnimationFrame(jogar);
