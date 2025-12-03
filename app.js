// YouTube IFrame API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let players = {};
let currentUserType = null; // Global user type
let videoData = [
    { id: 'F96VtGCcS2Q', title: 'O que você precisa saber para se proteger no Uber' },
    { id: '7DGXcyFRovg', title: 'Como se proteger em situações de risco' },
    { id: 'j0H6BETOzzY', title: 'Dicas de segurança para motoristas' },
    { id: 'jU08fZ8aLV8', title: 'Como evitar riscos e assaltos' },
    { id: 'zHHasMoR_8c', title: 'Segurança no transporte de passageiros' },
    { id: 'f3BiCaIfiiM', title: 'Aumentando a segurança do veículo' }
];

function onYouTubeIframeAPIReady() {
    videoData.forEach(video => {
        players[video.id] = new YT.Player(`player-${video.id}`, {
            height: '100%',
            width: '100%',
            videoId: video.id,
            playerVars: {
                'playsinline': 1,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
        saveProgress(event.target);
    }
}

function saveProgress(player) {
    const videoUrl = player.getVideoUrl();
    const videoId = videoUrl.match(/[?&]v=([^&]+)/)[1];
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    if (duration > 0) {
        const progress = {
            currentTime: currentTime,
            duration: duration,
            percentage: (currentTime / duration) * 100,
            lastWatched: Date.now()
        };
        localStorage.setItem(`progress_${videoId}`, JSON.stringify(progress));
        updateContinueWatching();
    }
}

function playVideo(videoId) {
    if (players[videoId]) {
        players[videoId].playVideo();
    }
}

// App Logic
document.addEventListener('DOMContentLoaded', () => {

    // Login Logic
    const loginForm = document.getElementById('login-form');
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const loginError = document.getElementById('login-error');
    const userPlanDisplay = document.getElementById('user-plan-display');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');

    // Password Toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle Icon
        const iconName = type === 'password' ? 'eye-off' : 'eye';
        togglePassword.innerHTML = `<i data-lucide="${iconName}"></i>`;
        lucide.createIcons();

        // Toggle Color
        togglePassword.style.color = type === 'text' ? 'var(--primary)' : 'var(--text-muted)';
    });

    // Users
    const users = {
        'usuariopremiun@email.com': { password: 'senha456', type: 'premium' }
    };

    // let currentUserType = null; // Removed local declaration

    // Check for existing session
    const savedUserType = localStorage.getItem('userType');
    if (savedUserType === 'premium') {
        currentUserType = savedUserType;
        loginScreen.style.display = 'none';
        appContent.style.display = 'block';

        // Update Plan Display
        userPlanDisplay.textContent = currentUserType === 'premium' ? 'Premium' : 'Básico';
        userPlanDisplay.style.color = currentUserType === 'premium' ? 'var(--primary)' : 'var(--text-muted)';

        // Initialize App State
        updateContentAccess();
        renderNavigation(currentUserType);

        // Trigger click on first tab
        setTimeout(() => {
            const firstTab = document.querySelector('.nav-item');
            if (firstTab) firstTab.click();
        }, 100);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (users[email] && users[email].password === password) {
            // Success
            currentUserType = users[email].type;

            // Save session to localStorage
            localStorage.setItem('userType', currentUserType);

            loginScreen.style.display = 'none';
            appContent.style.display = 'block';

            // Update Plan Display
            userPlanDisplay.textContent = currentUserType === 'premium' ? 'Premium' : 'Básico';
            userPlanDisplay.style.color = currentUserType === 'premium' ? 'var(--primary)' : 'var(--text-muted)';

            // Initialize App State
            updateContentAccess();
            renderNavigation(currentUserType);

            // Trigger click on first tab
            const firstTab = document.querySelector('.nav-item');
            if (firstTab) firstTab.click();

        } else {
            // Error
            loginError.textContent = "E-mail ou senha incorretos. Tente novamente.";
        }
    });

    // Content Access Logic
    function updateContentAccess() {
        const premiumContent = document.getElementById('premium-content');
        const basicLock = document.getElementById('basic-lock');
        const carouselDots = document.getElementById('carouselDots');

        // Resource Locking
        const manualCard = document.querySelector('.resource-card[data-resource="manual"]');
        const golpeCard = document.querySelector('.resource-card[data-resource="golpe"]');

        // Always show Premium Content
        premiumContent.style.display = 'flex';
        carouselDots.style.display = 'flex';
        if (basicLock) basicLock.style.display = 'none';

        // Unlock resources
        if (manualCard) manualCard.classList.remove('locked');
        if (golpeCard) golpeCard.classList.remove('locked');

        if (window.lucide) window.lucide.createIcons();
    }

    // Dynamic Navigation
    function renderNavigation(type) {
        const nav = document.getElementById('bottom-nav');
        nav.innerHTML = '';

        let items = [];

        // Premium Navigation Only
        items = [
            { id: 'tab-aulas', icon: 'play-circle', label: 'Aulas' },
            { id: 'tab-continue', icon: 'clock', label: 'Continuar' },
            { id: 'tab-materiais', icon: 'file-text', label: 'Materiais' },
            { id: 'tab-settings', icon: 'settings', label: 'Config' }
        ];

        items.forEach(item => {
            const link = document.createElement('a');
            link.className = 'nav-item';
            link.setAttribute('data-target', item.id);
            link.innerHTML = `
                <i data-lucide="${item.icon}"></i>
                <span>${item.label}</span>
            `;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

                link.classList.add('active');
                document.getElementById(item.id).classList.add('active');

                if (item.id === 'tab-continue') {
                    updateContinueWatching();
                }
            });
            nav.appendChild(link);
        });

        if (window.lucide) window.lucide.createIcons();
    }

    // Carousel Dots Logic
    const carousel = document.getElementById('premium-content');
    const dotsContainer = document.getElementById('carouselDots');
    const cards = document.querySelectorAll('.video-card');

    // Create dots
    dotsContainer.innerHTML = ''; // Clear previous
    cards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    carousel.addEventListener('scroll', () => {
        const scrollLeft = carousel.scrollLeft;
        const cardWidth = cards[0].offsetWidth + 20; // width + gap
        const activeIndex = Math.round(scrollLeft / cardWidth);

        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    });

    if (window.lucide) window.lucide.createIcons();

    // Resource Card Interaction
    const resourceCards = document.querySelectorAll('.resource-card');
    resourceCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent triggering if button was clicked
            if (e.target.tagName === 'BUTTON') return;

            // Remove active from all
            resourceCards.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            card.classList.add('active');
        });
    });
});

function updateContinueWatching() {
    const list = document.getElementById('continue-list');
    list.innerHTML = '';

    let hasItems = false;

    videoData.forEach(video => {
        const saved = localStorage.getItem(`progress_${video.id}`);
        if (saved) {
            hasItems = true;
            const data = JSON.parse(saved);
            const isCompleted = data.percentage > 90;

            const item = document.createElement('div');
            item.className = 'continue-item';
            item.onclick = () => resumeVideo(video.id, data.currentTime);

            item.innerHTML = `
                <div class="continue-thumb">
                    <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" alt="Thumb">
                </div>
                <div class="continue-info">
                    <div class="continue-title">${video.title}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.percentage}%"></div>
                    </div>
                </div>
                <div class="check-icon ${isCompleted ? 'completed' : ''}">
                    <i data-lucide="check-circle"></i>
                </div>
            `;
            list.appendChild(item);
        }
    });

    if (!hasItems) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Você ainda não começou a assistir nenhum vídeo.</p>';
    }

    if (window.lucide) window.lucide.createIcons();
}

function resumeVideo(videoId, time) {
    // Find nav item for Aulas
    const aulasNav = document.querySelector('.nav-item[data-target="tab-aulas"]');
    if (aulasNav) aulasNav.click();

    const card = document.querySelector(`.video-card[data-video-id="${videoId}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        setTimeout(() => {
            if (players[videoId]) {
                players[videoId].loadVideoById(videoId, time);
            }
        }, 500);
    }
}

function logout() {
    // Clear session
    localStorage.removeItem('userType');
    location.reload();
}

// PDF Generation Logic
// PDF Generation Logic
function generatePDF(type, action = 'download') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurações de Design
    const colors = {
        primary: [0, 243, 255], // Cyan
        secondary: [20, 20, 20], // Dark/Black
        text: [60, 60, 60], // Dark Grey
        lightBg: [245, 245, 245] // Light Grey
    };

    // Função para desenhar cabeçalho em todas as páginas
    function drawHeader(doc, title) {
        doc.setFillColor(...colors.secondary);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(...colors.primary);
        doc.text(title.toUpperCase(), 105, 25, { align: "center" });

        // Linha decorativa
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(1);
        doc.line(20, 35, 190, 35);
    }

    // Função para desenhar rodapé
    function drawFooter(doc, pageNumber) {
        const pageHeight = doc.internal.pageSize.height;

        doc.setDrawColor(...colors.primary);
        doc.line(20, pageHeight - 20, 190, pageHeight - 20);

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Proteção no Volante - Material Exclusivo", 20, pageHeight - 10);
        doc.text(`Página ${pageNumber}`, 190, pageHeight - 10, { align: "right" });
    }

    // Função para criar capa
    function createCover(doc, title, subtitle) {
        // Fundo escuro
        doc.setFillColor(...colors.secondary);
        doc.rect(0, 0, 210, 297, 'F');

        // Elemento decorativo central
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(3);
        doc.rect(30, 30, 150, 237);

        // Título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(40);
        doc.setTextColor(...colors.primary);
        const splitTitle = doc.splitTextToSize(title.toUpperCase(), 130);
        doc.text(splitTitle, 105, 100, { align: "center" });

        // Subtítulo
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(subtitle, 105, 160, { align: "center" });

        // Logo/Marca simulada
        doc.setFontSize(14);
        doc.setTextColor(200, 200, 200);
        doc.text("PROTEÇÃO NO VOLANTE", 105, 250, { align: "center" });
    }

    let title = "";
    let subtitle = "";
    let contentData = [];
    let filename = "";

    // Definição de Conteúdo Rico
    switch (type) {
        case 'ebook':
            title = "Manual de Sobrevivência Urbana";
            subtitle = "Guia Definitivo para Motoristas de App";
            filename = "ebook_seguranca_premium.pdf";
            contentData = [
                {
                    header: "1. Mentalidade de Segurança",
                    body: "A segurança começa antes de ligar o carro. A consciência situacional é sua maior arma. Esteja sempre atento ao ambiente, identificando padrões anormais e possíveis rotas de fuga. Não confie apenas na tecnologia; seu instinto é vital."
                },
                {
                    header: "2. Preparação do Veículo",
                    body: "Seu carro é seu escritório e seu escudo. Mantenha:\n- Vidros limpos e desobstruídos.\n- Portas travadas automaticamente.\n- Tanque sempre acima de 1/4.\n- Celular posicionado fora da visão externa."
                },
                {
                    header: "3. Análise de Perfil",
                    body: "Ao aceitar uma corrida, verifique:\n- Nota do passageiro (abaixo de 4.7 exige cautela).\n- Nome (apelidos ou nomes estranhos são alerta).\n- Local de embarque (zonas de risco ou ruas sem saída)."
                },
                {
                    header: "4. Durante a Corrida",
                    body: "Estabeleça autoridade gentil. Cumprimente olhando nos olhos. Se sentir perigo, invente uma desculpa mecânica e encerre a corrida em local movimentado. Nunca reaja a assaltos se estiver rendido."
                }
            ];
            break;

        case 'checklist':
            title = "Checklist Diário de Elite";
            subtitle = "Procedimentos Operacionais Padrão";
            filename = "checklist_diario_pro.pdf";
            contentData = [
                {
                    header: "Verificações Externas (Walk-around)",
                    body: "[ ] Pneus: Calibragem e estado de conservação.\n[ ] Luzes: Faróis, lanternas, freio e setas.\n[ ] Lataria: Verificar avarias novas antes de começar.\n[ ] Placas: Limpas e legíveis."
                },
                {
                    header: "Mecânica Básica",
                    body: "[ ] Nível de óleo do motor.\n[ ] Água do radiador/arrefecimento.\n[ ] Fluido de freio.\n[ ] Limpadores de para-brisa."
                },
                {
                    header: "Interior e Segurança",
                    body: "[ ] Câmera interna (Dashcam) funcionando.\n[ ] Botão de pânico acessível.\n[ ] Higienização e cheiro agradável.\n[ ] Carregadores e cabos organizados."
                },
                {
                    header: "Documentação",
                    body: "[ ] CNH válida.\n[ ] CRLV do veículo.\n[ ] Seguro do app ativo."
                }
            ];
            break;

        case 'manual':
            title = "Seus Direitos na Lei";
            subtitle = "Blindagem Jurídica para Motoristas";
            filename = "manual_juridico_completo.pdf";
            contentData = [
                {
                    header: "1. Vínculo e Autonomia",
                    body: "Entenda que, atualmente, você é considerado um prestador de serviços autônomo. Isso lhe dá liberdade de horário, mas retira certas proteções da CLT. Conheça os termos de uso de cada plataforma detalhadamente."
                },
                {
                    header: "2. Em Caso de Acidentes",
                    body: "A prioridade é a vida. Em seguida:\n1. Boletim de Ocorrência (B.O.) é obrigatório.\n2. Acione o seguro DPVAT e o seguro da plataforma.\n3. Colete contatos de testemunhas e fotos da cena."
                },
                {
                    header: "3. Defesa contra Bloqueios",
                    body: "Bloqueios injustos podem ser contestados. Mantenha registros de suas corridas, avaliações e conversas com o suporte. Em casos extremos, a via judicial pode ser necessária para reaver o acesso à conta."
                },
                {
                    header: "4. Legítima Defesa",
                    body: "A lei permite a defesa proporcional à agressão. No entanto, o foco deve ser sempre evitar o confronto. O uso de spray de pimenta ou outros itens deve seguir a legislação local rigorosamente."
                }
            ];
            break;

        case 'golpe':
            title = "Protocolo Anti-Golpe";
            subtitle = "Proteção Financeira e Digital";
            filename = "guia_anti_golpe_avancado.pdf";
            contentData = [
                {
                    header: "1. O Golpe do PIX Agendado",
                    body: "O golpista mostra um comprovante, mas é apenas um agendamento que ele cancela depois. REGRA DE OURO: Só libere o passageiro após a notificação do banco ou conferência no app do banco. Não confie na tela do cliente."
                },
                {
                    header: "2. Engenharia Social",
                    body: "Cuidado com passageiros excessivamente simpáticos que pedem o celular emprestado ou pedem para rotear internet. Eles podem instalar malwares ou acessar seus apps bancários."
                },
                {
                    header: "3. Falsa Central de Atendimento",
                    body: "O app nunca liga pedindo códigos via SMS. Se receber ligação pedindo código para 'confirmar cadastro', desligue. É golpe para roubar sua conta."
                },
                {
                    header: "4. Troco Mágico",
                    body: "O passageiro paga com nota alta, você dá o troco, ele esconde parte do troco e diz que você deu errado. Conte o troco em voz alta e entregue na mão do passageiro sob a luz interna."
                }
            ];
            break;
    }

    // Geração do Documento

    // Página 1: Capa
    createCover(doc, title, subtitle);

    // Página 2: Conteúdo
    doc.addPage();
    drawHeader(doc, title);

    let yPos = 50;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);

    contentData.forEach((section) => {
        // Verificar se precisa de nova página
        if (yPos > 240) {
            drawFooter(doc, doc.internal.getNumberOfPages());
            doc.addPage();
            drawHeader(doc, title);
            yPos = 50;
        }

        // Título da Seção
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(section.header, 20, yPos);
        yPos += 8;

        // Corpo da Seção
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.text);

        const splitBody = doc.splitTextToSize(section.body, 170);
        doc.text(splitBody, 20, yPos);

        yPos += (splitBody.length * 5) + 10; // Espaçamento dinâmico
    });

    drawFooter(doc, doc.internal.getNumberOfPages());

    // Save or Open PDF
    if (action === 'open') {
        const blobUrl = doc.output('bloburl');
        window.open(blobUrl, '_blank');
    } else {
        doc.save(filename);
    }
}

// Download Handler
function handleDownload(type) {
    // Always allow download for Premium
    generatePDF(type, 'download');
}

// Open Handler
function handleOpen(type) {
    generatePDF(type, 'open');
}

// Close Popup
function closePopup() {
    document.getElementById('upgrade-popup').style.display = 'none';
}

// Carousel Dots Logic
function initCarouselDots() {
    const carousel = document.getElementById('premium-content');
    const dotsContainer = document.getElementById('carouselDots');

    if (!carousel || !dotsContainer) return;

    // Clear existing dots
    dotsContainer.innerHTML = '';

    // Create dots based on video cards
    const cards = carousel.querySelectorAll('.video-card');
    cards.forEach((card, index) => {
        const dot = document.createElement('div');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.addEventListener('click', () => {
            card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        dotsContainer.appendChild(dot);
    });

    // Update active dot on scroll
    carousel.addEventListener('scroll', () => {
        const scrollLeft = carousel.scrollLeft;
        const centerPosition = scrollLeft + (carousel.offsetWidth / 2);

        let activeIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, index) => {
            // Calculate center relative to the scroll parent
            const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
            const distance = Math.abs(centerPosition - cardCenter);

            if (distance < minDistance) {
                minDistance = distance;
                activeIndex = index;
            }
        });

        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    });
}

// Initialize Dots
document.addEventListener('DOMContentLoaded', () => {
    initCarouselDots();
});
