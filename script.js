document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        mode: 'desktop',
        onboardingComplete: false,
        currentTab: 'profile',
        xp: 0,
        streak: 1
    };

    // --- DOM Elements ---
    const chatOverlay = document.getElementById('onboarding-overlay');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const xpCount = document.getElementById('xp-count');
    const viewToggleBtn = document.getElementById('view-toggle');
    const navLinks = document.querySelectorAll('.nav-links li');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    // --- Navigation Logic ---
    function switchTab(tabId) {
        // Update State
        state.currentTab = tabId;

        // Update UI Classes
        views.forEach(v => v.classList.remove('active'));
        const activeView = document.getElementById(tabId);
        if (activeView) activeView.classList.add('active');

        // Update Sidebar
        navLinks.forEach(l => {
            l.classList.toggle('active', l.dataset.tab === tabId);
        });

        // Update Bottom Nav
        bottomNavItems.forEach(i => {
            i.classList.toggle('active', i.dataset.tab === tabId);
        });

        // Update Header Title
        const titles = {
            'profile': 'Tổng quan',
            'journey': 'Hành trình',
            'marketplace': 'Cửa hàng',
            'identity': 'Định danh Số',
            'settings': 'Cài đặt'
        };
        if (pageTitle) pageTitle.textContent = titles[tabId];

        // Trigger Charts if needed
        if (tabId === 'profile') initCharts();
    }

    // Event Listeners for Nav
    navLinks.forEach(link => {
        link.addEventListener('click', () => switchTab(link.dataset.tab));
    });
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    // Logo Click
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('profile');
        });
    }

    // --- Chat / Onboarding Logic ---
    function addMessage(text, sender = 'bot', type = 'text') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        if (type === 'html') msgDiv.innerHTML = text;
        else msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function botSpeak(text, delay = 800) {
        // Simple typing simulation
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.id = id;
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        await new Promise(r => setTimeout(r, delay));
        document.getElementById(id).remove();
        addMessage(text, 'bot', 'html');
    }

    async function startOnboarding() {
        await botSpeak("Xin chào! Tôi là <strong>Mone</strong>. 👋");
        await botSpeak("Tôi sẽ giúp bạn quản lý tài chính và bảo vệ danh tính.");
        await botSpeak("Để bắt đầu, vui lòng nhập <strong>Số điện thoại</strong> để tôi tạo hồ sơ bảo mật.");

        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }

    // Send message function
    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;
        addMessage(text, 'user');

        await botSpeak(`Đang quét dữ liệu cho <strong>${text}</strong>... 📡`, 1000);
        await botSpeak("✅ <strong>Tuyệt vời!</strong> Hồ sơ của bạn sạch sẽ.");
        await botSpeak("Tôi đã cộng <strong>+50 XP</strong> vào tài khoản của bạn. Hãy khám phá ứng dụng ngay!");

        // Update XP
        state.xp = 50;
        if (xpCount) xpCount.textContent = state.xp;

        // Close Chat
        setTimeout(() => {
            chatOverlay.style.opacity = '0';
            setTimeout(() => {
                chatOverlay.style.display = 'none';
                state.onboardingComplete = true;
                switchTab('profile'); // Auto-switch to Profile Tab
            }, 500);
        }, 2000);
    }

    // Send button click
    sendBtn.addEventListener('click', sendMessage);

    // Enter key press
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !userInput.disabled) {
            sendMessage();
        }
    });

    // --- Charts (Chart.js) ---
    let netWorthChartInstance = null;

    function initCharts() {
        const ctx = document.getElementById('netWorthChart');
        if (!ctx) return;

        // Destroy existing to prevent duplicates
        if (netWorthChartInstance) netWorthChartInstance.destroy();

        netWorthChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
                datasets: [{
                    label: 'Tài sản',
                    data: [280, 290, 285, 300, 310, 320.5],
                    borderColor: '#5B4DFF',
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                        gradient.addColorStop(0, 'rgba(91, 77, 255, 0.5)');
                        gradient.addColorStop(1, 'rgba(91, 77, 255, 0)');
                        return gradient;
                    },
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                layout: { padding: 0 }
            }
        });
    }

    // --- View Toggle ---
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('mobile-mode');
            const isMobile = document.body.classList.contains('mobile-mode');
            const icon = viewToggleBtn.querySelector('i');
            const span = viewToggleBtn.querySelector('span');

            if (isMobile) {
                icon.className = 'fa-solid fa-desktop';
                span.textContent = 'Chuyển sang Web';
            } else {
                icon.className = 'fa-solid fa-mobile-screen';
                span.textContent = 'Chuyển sang App';
            }

            // Resize charts
            setTimeout(() => initCharts(), 500);
        });
    }

    // --- Init ---
    // Temporarily disabled auto-onboarding to allow direct navigation
    // setTimeout(() => {
    //     if (chatOverlay) {
    //         chatOverlay.style.display = 'flex';
    //         startOnboarding();
    //     }
    // }, 500);


    // --- Journey Map Interactivity (Global Delegation) ---
    document.body.addEventListener('click', (e) => {
        const node = e.target.closest('.journey-node');
        if (!node) return;

        console.log('Journey Node Clicked:', node);

        const step = node.getAttribute('data-step');
        const label = node.getAttribute('data-topic') || node.querySelector('.node-label').innerText;

        // Show Chat Overlay
        const overlay = document.getElementById('onboarding-overlay');
        const messages = document.getElementById('chat-messages');

        if (overlay && messages) {
            overlay.style.display = 'flex';
            // Force reflow
            void overlay.offsetWidth;
            overlay.style.opacity = '1';

            messages.innerHTML = ''; // Clear previous chat

            // Add Bot Message based on Node
            let message = "";
            if (node.classList.contains('locked')) {
                message = `🔒 <b>${label}</b> đang bị khóa! Hãy hoàn thành các bước trước để mở khóa.`;
            } else if (node.classList.contains('completed')) {
                message = `✅ Bạn đã hoàn thành <b>${label}</b>! Bạn muốn cập nhật lại thông tin không?`;
            } else {
                // Active Node
                if (step === '3') { // Assets
                    message = `💰 Hãy thêm tài sản để nhận <b>200 XP</b>! Bạn có Nhà, Xe hay Sổ tiết kiệm nào không?`;
                } else if (step === '2') { // CIC
                    message = `🚀 <b>Điểm CIC</b> của bạn đang được theo dõi. Bạn có muốn xem báo cáo chi tiết không?`;
                }
            }

            addMessage(message, 'bot');

            // Enable input
            const input = document.getElementById('user-input');
            const btn = document.getElementById('send-btn');
            if (input) {
                input.disabled = false;
                input.focus();
            }
            if (btn) btn.disabled = false;
        }
    });

    // --- Marketplace Logic ---
    const marketplaceData = [
        {
            id: 1,
            name: "VIB Super Card",
            category: "credit-cards",
            provider: "VIB",
            logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VIB-Blue.png",
            description: "Hoàn tiền 15% mua sắm, ăn uống",
            tags: ["Hoàn tiền", "Mua sắm"],
            highlight: "15% Cashback",
            color: "#0066B3"
        },
        {
            id: 2,
            name: "Techcombank Visa",
            category: "credit-cards",
            provider: "Techcombank",
            logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Techcombank.png",
            description: "Miễn phí thường niên trọn đời",
            tags: ["Miễn phí", "Visa"],
            highlight: "Free Lifetime",
            color: "#E31937"
        },
        {
            id: 3,
            name: "VPBank StepUp",
            category: "credit-cards",
            provider: "VPBank",
            logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VPBank.png",
            description: "Hoàn 15% chi tiêu Online",
            tags: ["Online", "Gen Z"],
            highlight: "Best for Gen Z",
            color: "#00B14F"
        },
        {
            id: 4,
            name: "Vay Tiêu Dùng Shinhan",
            category: "loans",
            provider: "Shinhan Finance",
            logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Shinhan-Finance.png",
            description: "Lãi suất từ 1.16%/tháng",
            tags: ["Lãi thấp", "Nhanh"],
            highlight: "1.16% / tháng",
            color: "#004685"
        },
        {
            id: 5,
            name: "Vay Nhanh MoneyCat",
            category: "loans",
            provider: "MoneyCat",
            logo: "https://moneycat.vn/public/images/logo.png",
            description: "Duyệt vay trong 5 phút",
            tags: ["Online", "Cấp tốc"],
            highlight: "5 Mins",
            color: "#66CC33"
        },
        {
            id: 6,
            name: "Bảo Hiểm Sức Khỏe Liberty",
            category: "insurance",
            provider: "Liberty Insurance",
            logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Liberty-Insurance.png",
            description: "Bảo vệ toàn diện lên đến 20 tỷ",
            tags: ["Sức khỏe", "Cao cấp"],
            highlight: "Max 20 Tỷ",
            color: "#1A3B8D"
        },
        {
            id: 7,
            name: "Bảo Hiểm Xe Máy PVI",
            category: "insurance",
            provider: "PVI",
            logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-PVI.png",
            description: "Bắt buộc TNDS chỉ 66k",
            tags: ["Xe máy", "Giá rẻ"],
            highlight: "66k / năm",
            color: "#FDB913"
        },
        {
            id: 8,
            name: "Tiết Kiệm Cake",
            category: "savings",
            provider: "Cake by VPBank",
            logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Cake-By-VPBank.png",
            description: "Lãi suất 5.5% kỳ hạn 6 tháng",
            tags: ["Online", "Lãi cao"],
            highlight: "5.5% p.a",
            color: "#FF0099"
        }
    ];

    function renderMarketplace(category = 'all') {
        const grid = document.getElementById('marketplace-grid');
        if (!grid) return;

        grid.innerHTML = '';

        const filtered = category === 'all'
            ? marketplaceData
            : marketplaceData.filter(p => p.category === category);

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'bento-card product-card';
            card.style.setProperty('--brand-color', product.color);

            card.innerHTML = `
                <div class="prod-badge">${product.highlight}</div>
                <div class="prod-header">
                    <div class="prod-logo">
                        <img src="${product.logo}" alt="${product.provider}">
                    </div>
                    <div class="prod-provider">${product.provider}</div>
                </div>
                <div class="prod-body">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="prod-tags">
                        ${product.tags.map(t => `<span>${t}</span>`).join('')}
                    </div>
                </div>
                <div class="prod-footer">
                    <button class="apply-btn">Đăng ký ngay <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Marketplace Category Switching
    const marketTabs = document.querySelectorAll('.market-tab');
    marketTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            marketTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderMarketplace(tab.dataset.category);
        });
    });

    // Initial Render
    renderMarketplace('all');

    // --- Journey Logic ---
    const journeyContainer = document.getElementById('journey-nodes-container');
    const journeyTopics = [
        { icon: 'fa-wallet', label: 'Quản lý chi tiêu' },
        { icon: 'fa-piggy-bank', label: 'Tiết kiệm thông minh' },
        { icon: 'fa-credit-card', label: 'Thẻ tín dụng' },
        { icon: 'fa-chart-line', label: 'Đầu tư cơ bản' },
        { icon: 'fa-shield-halved', label: 'Bảo hiểm' },
        { icon: 'fa-house', label: 'Mua nhà' },
        { icon: 'fa-coins', label: 'Tiền mã hóa' },
        { icon: 'fa-sack-dollar', label: 'Nghỉ hưu' }
    ];

    function generateJourneyData() {
        const milestones = [];
        const totalMilestones = 100;

        for (let i = 1; i <= totalMilestones; i++) {
            let type = 'lesson';
            let status = 'locked';
            let xp = 50;

            // First few are active/completed for demo
            if (i === 1) status = 'completed';
            else if (i === 2) status = 'active';

            // Every 5th is a chest
            if (i % 5 === 0) {
                type = 'chest';
                xp = 200;
            } else if (i % 10 === 0) {
                type = 'big-chest';
                xp = 500;
            }

            // Cycle through topics
            const topic = journeyTopics[(i - 1) % journeyTopics.length];

            milestones.push({
                id: i,
                type: type,
                status: status,
                xp: xp,
                icon: type.includes('chest') ? '' : topic.icon,
                topicName: type.includes('chest') ? 'Phần thưởng' : topic.label,
                label: type.includes('chest') ? 'Phần thưởng' : `${topic.label} ${Math.ceil(i / journeyTopics.length)}`
            });
        }
        return milestones;
    }

    function renderJourney() {
        if (!journeyContainer) return;
        journeyContainer.innerHTML = '';

        const milestones = generateJourneyData();

        milestones.forEach((m, index) => {
            const node = document.createElement('div');

            // Calculate winding path margin
            // 0 -> 0
            // 1 -> 40
            // 2 -> 0
            // 3 -> -40
            // 4 -> 0
            // Cycle of 4: 0, 40, 0, -40
            const pattern = [0, 50, 0, -50];
            const marginLeft = pattern[index % 4];

            if (m.type === 'chest' || m.type === 'big-chest') {
                node.className = `journey-chest ${m.status}`;
                node.setAttribute('data-step', m.id);
                node.setAttribute('data-topic', m.topicName);
                node.style.marginLeft = `${marginLeft}px`;
                node.innerHTML = `
                    <div class="chest-glow"></div>
                    <img src="https://cdn-icons-png.flaticon.com/512/9497/9497086.png" alt="Chest" width="${m.type === 'big-chest' ? 80 : 60}">
                    <div class="node-label" style="margin-top: 5px;">${m.label}</div>
                `;
            } else {
                node.className = `journey-node ${m.status}`;
                node.setAttribute('data-step', m.id);
                node.setAttribute('data-topic', m.topicName);
                node.style.marginLeft = `${marginLeft}px`;
                node.innerHTML = `
                    <div class="node-reward">+${m.xp} XP</div>
                    <div class="node-icon"><i class="fa-solid ${m.icon}"></i></div>
                    <div class="node-label">${m.label}</div>
                `;
            }

            journeyContainer.appendChild(node);

            // Add connector line if not last
            if (index < milestones.length - 1) {
                // We handle connectors via CSS usually, but for winding path it's tricky.
                // For now, let's rely on the vertical spacing and maybe a pseudo-element in CSS.
            }
        });
    }

    // Render Journey on Load
    renderJourney();

    // Close Chat on Click Outside
    if (chatOverlay) {
        chatOverlay.addEventListener('click', (e) => {
            if (e.target === chatOverlay) {
                chatOverlay.style.opacity = '0';
                setTimeout(() => {
                    chatOverlay.style.display = 'none';
                }, 300);
            }
        });
    }

    // Close Chat Button
    const chatCloseBtn = document.getElementById('chat-close-btn');
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => {
            chatOverlay.style.opacity = '0';
            setTimeout(() => {
                chatOverlay.style.display = 'none';
            }, 300);
        });
    }

    // --- MoneID Verification System ---
    const verifyCards = document.querySelectorAll('.verify-card');
    const verifyModal = document.getElementById('verify-modal');
    const closeModalBtn = verifyModal?.querySelector('.close-modal');
    const confirmVerifyBtn = document.getElementById('confirm-verify-btn');
    const modalVerifyType = document.getElementById('modal-verify-type');

    // Benefits data - Comprehensive list for all verification types
    const benefitsData = {
        student: [
            { name: 'Spotify Premium', logo: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png', discount: '50% OFF Student', locked: false },
            { name: 'Apple Music', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Apple_Music_logo.svg/1200px-Apple_Music_logo.svg.png', discount: 'Student Plan 59k', locked: false },
            { name: 'CGV Cinemas', logo: 'https://www.cgv.vn/skin/frontend/cgv/default/images/cgvlogo.png', discount: '30% OFF', locked: false },
            { name: 'California Fitness', logo: 'https://via.placeholder.com/100x40/FF6B6B/FFFFFF?text=CaliFit', discount: 'Giảm 40%', locked: false }
        ],
        teacher: [
            { name: 'Fahasa', logo: 'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/fahasa-logo.png', discount: '20% OFF Sách', locked: true },
            { name: 'Thế Giới Di Động', logo: 'https://cdn.tgdd.vn/2020/04/GameApp/Untitled-1-200x200-3.png', discount: '15% OFF Laptop', locked: true },
            { name: 'Microsoft Office', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg/1200px-Microsoft_Office_logo_%282019%E2%80%93present%29.svg.png', discount: 'Miễn phí', locked: true }
        ],
        military: [
            { name: 'VPBank Vay Ưu Đãi', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VPBank.png', discount: 'Lãi suất 0.5%', locked: true },
            { name: 'Bảo Việt Insurance', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Bao-Viet.png', discount: 'Giảm 40%', locked: true },
            { name: 'Vietjet Air', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/VietJet_Air_logo.svg/1200px-VietJet_Air_logo.svg.png', discount: '25% OFF', locked: true }
        ],
        healthcare: [
            { name: 'Vinpearl Resort', logo: 'https://statics.vinpearl.com/vinpearl-logo_1920x870.png', discount: '25% OFF', locked: true },
            { name: 'Thien Spa', logo: 'https://via.placeholder.com/100x40/9B59B6/FFFFFF?text=ThienSpa', discount: '30% OFF', locked: true },
            { name: 'Medicare Plus', logo: 'https://via.placeholder.com/100x40/00C853/FFFFFF?text=Medicare', discount: 'Miễn phí khám', locked: true }
        ],
        senior: [
            { name: 'Vietravel', logo: 'https://via.placeholder.com/100x40/3498DB/FFFFFF?text=Vietravel', discount: '35% OFF Tour', locked: true },
            { name: 'Bệnh viện Vinmec', logo: 'https://via.placeholder.com/100x40/E74C3C/FFFFFF?text=Vinmec', discount: 'Giảm 50% khám', locked: true },
            { name: 'Grab', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Grab_%28company%29_logo.svg/1200px-Grab_%28company%29_logo.svg.png', discount: 'Miễn phí 20 chuyến', locked: true }
        ],
        government: [
            { name: 'Agribank Vay Nhà', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Agribank.png', discount: 'Lãi suất 4.5%', locked: true },
            { name: 'Prudential', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Prudential_Financial_logo.svg/1200px-Prudential_Financial_logo.svg.png', discount: 'Giảm 30%', locked: true },
            { name: 'Honda Việt Nam', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/1200px-Honda_Logo.svg.png', discount: 'Trả góp 0%', locked: true }
        ],
        firstresponder: [
            { name: 'Decathlon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Decathlon_Logo.svg/1200px-Decathlon_Logo.svg.png', discount: '40% OFF', locked: true },
            { name: 'Bảo Minh Insurance', logo: 'https://via.placeholder.com/100x40/E67E22/FFFFFF?text=BaoMinh', discount: 'Miễn phí BH', locked: true },
            { name: 'The Coffee House', logo: 'https://via.placeholder.com/100x40/8B4513/FFFFFF?text=TCH', discount: '50% OFF', locked: true }
        ],
        freelancer: [
            { name: 'Toong Coworking', logo: 'https://via.placeholder.com/100x40/FF9800/FFFFFF?text=Toong', discount: '30% OFF', locked: true },
            { name: 'Adobe Creative Cloud', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/1200px-Adobe_Creative_Cloud_rainbow_icon.svg.png', discount: '40% OFF', locked: true },
            { name: 'Udemy', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/1200px-Udemy_logo.svg.png', discount: 'Giảm 50%', locked: true }
        ],
        startup: [
            { name: 'AWS Credits', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1200px-Amazon_Web_Services_Logo.svg.png', discount: '$5000 Credits', locked: true },
            { name: 'Google Cloud', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Google_Cloud_logo.svg/1200px-Google_Cloud_logo.svg.png', discount: '$3000 Credits', locked: true },
            { name: 'Notion', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1200px-Notion-logo.svg.png', discount: 'Miễn phí 1 năm', locked: true }
        ],
        parent: [
            { name: 'Bibo Mart', logo: 'https://via.placeholder.com/100x40/FF69B4/FFFFFF?text=BiboMart', discount: '25% OFF', locked: true },
            { name: 'Pampers', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pampers_logo.svg/1200px-Pampers_logo.svg.png', discount: 'Giảm 30%', locked: true },
            { name: 'Kids Plaza', logo: 'https://via.placeholder.com/100x40/FFD700/000000?text=KidsPlaza', discount: '20% OFF', locked: true }
        ],
        veteran: [
            { name: 'Vietcombank Vay 0%', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Vietcombank.png', discount: 'Lãi suất 0%', locked: true },
            { name: 'Manulife', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Manulife_logo.svg/1200px-Manulife_logo.svg.png', discount: 'Miễn phí BH', locked: true },
            { name: 'Vietnam Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Vietnam_Airlines_logo.svg/1200px-Vietnam_Airlines_logo.svg.png', discount: '50% OFF', locked: true }
        ],
        disabled: [
            { name: 'Bệnh viện FV', logo: 'https://via.placeholder.com/100x40/2ECC71/FFFFFF?text=FV', discount: 'Miễn phí khám', locked: true },
            { name: 'Grab Wheelchair', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Grab_%28company%29_logo.svg/1200px-Grab_%28company%29_logo.svg.png', discount: 'Miễn phí 50 chuyến', locked: true },
            { name: 'Thiết bị Y tế', logo: 'https://via.placeholder.com/100x40/34495E/FFFFFF?text=MedEquip', discount: 'Giảm 60%', locked: true }
        ],
        nonprofit: [
            { name: 'Microsoft 365', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png', discount: 'Miễn phí', locked: true },
            { name: 'Google Workspace', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Google_Workspace_Logo.svg/1200px-Google_Workspace_Logo.svg.png', discount: 'Miễn phí', locked: true },
            { name: 'Canva Pro', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/1200px-Canva_icon_2021.svg.png', discount: 'Miễn phí', locked: true }
        ],
        lowincome: [
            { name: 'Thực phẩm Co.op', logo: 'https://via.placeholder.com/100x40/27AE60/FFFFFF?text=CoopFood', discount: 'Voucher 500k', locked: true },
            { name: 'Bệnh viện Nhân Dân', logo: 'https://via.placeholder.com/100x40/E74C3C/FFFFFF?text=Hospital', discount: 'Miễn phí', locked: true },
            { name: 'Học bổng FPT', logo: 'https://via.placeholder.com/100x40/FF6B35/FFFFFF?text=FPT', discount: '100% học phí', locked: true }
        ],
        athlete: [
            { name: 'California Fitness', logo: 'https://via.placeholder.com/100x40/FF6B6B/FFFFFF?text=CaliFit', discount: 'Miễn phí 6 tháng', locked: true },
            { name: 'Whey Protein Store', logo: 'https://via.placeholder.com/100x40/8E44AD/FFFFFF?text=Whey', discount: '40% OFF', locked: true },
            { name: 'Decathlon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Decathlon_Logo.svg/1200px-Decathlon_Logo.svg.png', discount: '35% OFF', locked: true }
        ],
        artist: [
            { name: 'Adobe Creative Cloud', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/1200px-Adobe_Creative_Cloud_rainbow_icon.svg.png', discount: '60% OFF', locked: true },
            { name: 'Canva Pro', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/1200px-Canva_icon_2021.svg.png', discount: 'Miễn phí 1 năm', locked: true },
            { name: 'Wacom Tablet', logo: 'https://via.placeholder.com/100x40/000000/FFFFFF?text=Wacom', discount: '45% OFF', locked: true }
        ]
    };

    // Render benefits
    function renderBenefits() {
        const benefitsList = document.getElementById('benefits-list');
        if (!benefitsList) return;

        benefitsList.innerHTML = '';

        // Get all benefits from all categories
        const allBenefits = [];
        Object.keys(benefitsData).forEach(category => {
            benefitsData[category].forEach(benefit => {
                allBenefits.push({ ...benefit, category });
            });
        });

        allBenefits.forEach(benefit => {
            const item = document.createElement('div');
            item.className = `benefit-item ${benefit.locked ? 'locked' : ''}`;
            item.innerHTML = `
                <div class="benefit-logo">
                    <img src="${benefit.logo}" alt="${benefit.name}" onerror="this.src='https://via.placeholder.com/50'">
                </div>
                <div class="benefit-info">
                    <h4>${benefit.name}</h4>
                    <p>${benefit.discount}</p>
                </div>
                <div class="benefit-action">
                    <button class="btn-claim" ${benefit.locked ? 'disabled' : ''}>
                        ${benefit.locked ? '🔒 Khóa' : 'Nhận ưu đãi'}
                    </button>
                </div>
            `;
            benefitsList.appendChild(item);
        });
    }

    // Open verification modal
    verifyCards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-type');
            const typeNames = {
                student: 'Học sinh / Sinh viên',
                teacher: 'Giáo viên',
                military: 'Quân nhân',
                healthcare: 'Y tế',
                senior: 'Người cao tuổi (60+)',
                government: 'Công chức',
                firstresponder: 'Cứu hộ / Cảnh sát',
                freelancer: 'Freelancer',
                startup: 'Nhân viên Startup',
                parent: 'Phụ huynh',
                veteran: 'Cựu chiến binh',
                disabled: 'Người khuyết tật',
                nonprofit: 'Tổ chức phi lợi nhuận',
                lowincome: 'Thu nhập thấp',
                athlete: 'Vận động viên',
                artist: 'Nghệ sĩ / Sáng tạo'
            };

            if (modalVerifyType) {
                modalVerifyType.textContent = typeNames[type];
            }

            verifyModal.classList.add('active');
            verifyModal.setAttribute('data-verify-type', type);
        });
    });

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            verifyModal.classList.remove('active');
        });
    }

    // Close modal on overlay click
    if (verifyModal) {
        verifyModal.addEventListener('click', (e) => {
            if (e.target === verifyModal) {
                verifyModal.classList.remove('active');
            }
        });
    }

    // File Upload Interaction
    const uploadTrigger = document.getElementById('upload-trigger');
    const fileInput = document.getElementById('verify-file-input');
    const uploadText = document.getElementById('upload-text');

    if (uploadTrigger && fileInput) {
        uploadTrigger.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                const fileName = fileInput.files[0].name;
                uploadText.innerHTML = `<span style="color: var(--primary); font-weight: 600;">${fileName}</span><br><span style="font-size: 0.8rem;">Nhấn để thay đổi</span>`;
                uploadTrigger.style.borderColor = 'var(--primary)';
                uploadTrigger.style.background = 'rgba(108, 93, 211, 0.1)';
            }
        });
    }

    // Confirm verification
    if (confirmVerifyBtn) {
        confirmVerifyBtn.addEventListener('click', () => {
            const type = verifyModal.getAttribute('data-verify-type');

            // Update status badge
            const statusElement = document.getElementById(`status-${type}`);
            if (statusElement) {
                statusElement.innerHTML = '<span class="badge verified">✓ Đã xác thực</span>';
            }

            // Unlock benefits for this category
            if (benefitsData[type]) {
                benefitsData[type].forEach(benefit => {
                    benefit.locked = false;
                });
                renderBenefits();
            }

            // Show success message
            alert('✅ Yêu cầu xác thực đã được gửi! Chúng tôi sẽ xem xét trong vòng 24 giờ.');

            // Close modal
            verifyModal.classList.remove('active');
        });
    }



    // QR Scan Button
    const scanQrBtn = document.getElementById('scan-qr-btn');
    if (scanQrBtn) {
        scanQrBtn.addEventListener('click', () => {
            alert('📷 Đang mở camera để quét mã QR...\n(Tính năng này đang được phát triển)');
        });
    }

    // Initial render of benefits
    renderBenefits();

    // --- Toast Notification System ---
    function showToast(title, message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'fa-circle-check',
            info: 'fa-circle-info',
            warning: 'fa-triangle-exclamation'
        };

        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid ${iconMap[type]}"></i></div>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.4s forwards';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // --- Settings Navigation Logic ---
    const settingsHome = document.getElementById('settings-home');
    const settingsDetail = document.getElementById('settings-detail');
    const settingsDetailTitle = document.getElementById('settings-detail-title');
    const settingsDetailContent = document.getElementById('settings-detail-content');
    const settingsBackBtn = document.getElementById('settings-back-btn');

    // Settings Content Data
    const settingsData = {
        'security': {
            title: 'Bảo mật & Đăng nhập',
            content: `
                <div class="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input type="password" placeholder="********">
                </div>
                <div class="form-group">
                    <label>Mật khẩu mới</label>
                    <input type="password" placeholder="********">
                </div>
                <div class="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input type="password" placeholder="********">
                </div>
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; margin-top: 20px;">
                    <label style="margin:0;">Xác thực 2 yếu tố (2FA)</label>
                    <input type="checkbox" checked style="width: auto; transform: scale(1.5);">
                </div>
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                    <label style="margin:0;">Đăng nhập sinh trắc học</label>
                    <input type="checkbox" checked style="width: auto; transform: scale(1.5);">
                </div>
                <button class="btn-primary">Cập nhật mật khẩu</button>
            `
        },
        'notifications': {
            title: 'Cài đặt thông báo',
            content: `
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                    <label style="margin:0;">Thông báo đẩy</label>
                    <input type="checkbox" checked style="width: auto; transform: scale(1.5);">
                </div>
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                    <label style="margin:0;">Email khuyến mãi</label>
                    <input type="checkbox" style="width: auto; transform: scale(1.5);">
                </div>
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                    <label style="margin:0;">Biến động số dư</label>
                    <input type="checkbox" checked style="width: auto; transform: scale(1.5);">
                </div>
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                    <label style="margin:0;">Nhắc nhở thanh toán</label>
                    <input type="checkbox" checked style="width: auto; transform: scale(1.5);">
                </div>
                <button class="btn-primary">Lưu cài đặt</button>
            `
        },
        'privacy': {
            title: 'Quyền riêng tư',
            content: `
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                    <label style="margin:0;">Hiển thị số dư ngoài màn hình chính</label>
                    <input type="checkbox" checked style="width: auto; transform: scale(1.5);">
                </div>
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                    <label style="margin:0;">Cho phép tìm kiếm bằng SĐT</label>
                    <input type="checkbox" checked style="width: auto; transform: scale(1.5);">
                </div>
                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                    <label style="margin:0;">Chia sẻ dữ liệu ẩn danh</label>
                    <input type="checkbox" style="width: auto; transform: scale(1.5);">
                </div>
                <button class="btn-primary">Lưu thay đổi</button>
            `
        },
        'payment': {
            title: 'Thanh toán & Gói',
            content: `
                <div class="bento-card" style="background: linear-gradient(135deg, #6C63FF 0%, #4834d4 100%); padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px; color: white;">Gói Premium</h3>
                    <p style="margin: 0 0 20px; color: rgba(255,255,255,0.8);">Hạn dùng: 12/12/2025</p>
                    <button style="background: white; color: #6C63FF; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600;">Gia hạn</button>
                </div>
                <div class="form-group">
                    <label>Phương thức thanh toán mặc định</label>
                    <select>
                        <option>Ví Mone (***888)</option>
                        <option>Visa Debit (***1234)</option>
                    </select>
                </div>
                <button class="btn-primary">Quản lý phương thức thanh toán</button>
            `
        },
        'linked-accounts': {
            title: 'Liên kết tài khoản',
            content: `
                <div class="settings-list" style="margin: 0;">
                    <div class="settings-item">
                        <span class="settings-icon" style="color: #1877F2;"><i class="fa-brands fa-facebook"></i></span>
                        <span class="settings-label">Facebook</span>
                        <span class="settings-value">Đã liên kết</span>
                    </div>
                    <div class="settings-item">
                        <span class="settings-icon" style="color: #DB4437;"><i class="fa-brands fa-google"></i></span>
                        <span class="settings-label">Google</span>
                        <span class="settings-value">mikenguyen@gmail.com</span>
                    </div>
                    <div class="settings-item">
                        <span class="settings-icon" style="color: #000;"><i class="fa-brands fa-apple"></i></span>
                        <span class="settings-label">Apple ID</span>
                        <span class="settings-chevron">Liên kết</span>
                    </div>
                </div>
            `
        },
        'appearance': {
            title: 'Giao diện',
            content: `
                <div class="form-group">
                    <label>Chế độ hiển thị</label>
                    <select id="theme-select">
                        <option value="dark" selected>Tối (Mặc định)</option>
                        <option value="light">Sáng</option>
                        <option value="system">Theo hệ thống</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Màu chủ đạo</label>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #6C63FF; border: 2px solid white;"></div>
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #00C853;"></div>
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #E50914;"></div>
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #FFD700;"></div>
                    </div>
                </div>
                <button class="btn-primary">Áp dụng</button>
            `
        },
        'family': {
            title: 'Gia đình',
            content: `
                <div style="text-align: center; padding: 40px 20px;">
                    <i class="fa-solid fa-people-roof" style="font-size: 48px; color: rgba(255,255,255,0.2); margin-bottom: 20px;"></i>
                    <p>Tạo nhóm gia đình để chia sẻ hạn mức và quản lý chi tiêu chung.</p>
                    <button class="btn-primary" style="margin-top: 20px;">Tạo nhóm gia đình</button>
                </div>
            `
        },
        'help': {
            title: 'Trợ giúp & Hỗ trợ',
            content: `
                <div class="settings-list" style="margin: 0;">
                    <div class="settings-item">
                        <span class="settings-icon">📚</span>
                        <span class="settings-label">Hướng dẫn sử dụng</span>
                        <span class="settings-chevron">›</span>
                    </div>
                    <div class="settings-item">
                        <span class="settings-icon">💬</span>
                        <span class="settings-label">Chat với hỗ trợ</span>
                        <span class="settings-chevron">›</span>
                    </div>
                    <div class="settings-item">
                        <span class="settings-icon">📞</span>
                        <span class="settings-label">Hotline: 1900 1234</span>
                        <span class="settings-chevron">›</span>
                    </div>
                </div>
            `
        },
        'profile-edit': {
            title: 'Chỉnh sửa hồ sơ',
            content: `
                <div class="profile-avatar-edit" style="text-align: center; margin-bottom: 2rem;">
                    <img src="https://ui-avatars.com/api/?name=Mike+N&background=6C63FF&color=fff" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary);">
                    <div style="margin-top: 1rem; color: var(--primary); cursor: pointer;">Thay đổi ảnh đại diện</div>
                </div>
                <div class="form-group">
                    <label>Họ và tên</label>
                    <input type="text" value="Mike Nguyen">
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" value="@mikenguyen">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="mike@example.com">
                </div>
                <div class="form-group">
                    <label>Số điện thoại</label>
                    <input type="tel" value="0912345678">
                </div>
                <button class="btn-primary">Lưu thông tin</button>
            `
        }
    };

    function openSettingsDetail(key, titleOverride = null) {
        const data = settingsData[key];
        if (!data && !titleOverride) return;

        const title = titleOverride || data.title;
        const content = data ? data.content : `<p style="text-align: center; padding: 20px; color: #888;">Nội dung đang cập nhật...</p>`;

        if (settingsDetailTitle) settingsDetailTitle.textContent = title;
        if (settingsDetailContent) settingsDetailContent.innerHTML = content;

        if (settingsHome) settingsHome.style.display = 'none';
        if (settingsDetail) settingsDetail.style.display = 'flex';
    }

    function closeSettingsDetail() {
        if (settingsDetail) settingsDetail.style.display = 'none';
        if (settingsHome) settingsHome.style.display = 'block';
    }

    // Back Button
    if (settingsBackBtn) {
        settingsBackBtn.addEventListener('click', closeSettingsDetail);
    }

    // Event Delegation for Settings Items
    document.body.addEventListener('click', (e) => {
        // Settings Item
        const settingsItem = e.target.closest('.settings-item');
        if (settingsItem) {
            const key = settingsItem.getAttribute('data-setting');
            const label = settingsItem.querySelector('.settings-label')?.textContent;

            // Visual feedback
            settingsItem.style.backgroundColor = 'rgba(255,255,255,0.1)';
            setTimeout(() => settingsItem.style.backgroundColor = '', 200);

            if (key) {
                openSettingsDetail(key);
            } else if (label) {
                // Fallback for items without key (e.g. inside detail view)
                console.log('Clicked item without key:', label);
            }
            return;
        }

        // Profile Edit Button
        const profileEdit = e.target.closest('.profile-edit-btn');
        if (profileEdit) {
            openSettingsDetail('profile-edit');
            return;
        }

        // Logout Button
        const logoutBtn = e.target.closest('.logout-button');
        if (logoutBtn) {
            if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi Mone?')) {
                showToast('Đăng xuất', 'Đã đăng xuất thành công!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            return;
        }

        // Dynamic Buttons inside Detail View
        if (e.target.classList.contains('btn-primary') && settingsDetail.style.display !== 'none') {
            showToast('Thành công', 'Đã lưu thay đổi!', 'success');
            closeSettingsDetail();
        }
    });
});
