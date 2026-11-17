
"use strict";

// Цены магазина
const pricingTiers = [
    { stars: 50, price: 13000 },
    { stars: 100, price: 24000 },
    { stars: 200, price: 46000 },
    { stars: 350, price: 79000 },
    { stars: 500, price: 112000 },
    { stars: 750, price: 167000 },
    { stars: 1000, price: 222000 },
    { stars: 2000, price: 442000 },
    { stars: 5000, price: 1102000 },
    { stars: 10000, price: 2202000 }
];

const MIN_STARS = 50;
const MAX_STARS = 10000000;

// Элементы страницы
const starInput = document.getElementById("starInput");
const calcPrice = document.getElementById("calcPrice");
const inputHint = document.getElementById("inputHint");

const modalOverlay = document.getElementById("modalOverlay");
const modalStarsCount = document.getElementById("modalStarsCount");
const modalTotalPrice = document.getElementById("modalTotalPrice");

const usernameInput = document.getElementById("usernameInput");
const formError = document.getElementById("formError");
const orderForm = document.getElementById("orderForm");

// Выбранный заказ
let selectedStars = 50;
let selectedPrice = 13000;

// Форматирование чисел
function formatNumber(number) {
    return Math.round(number).toLocaleString("ru-RU");
}

// Получение цены для любого количества Stars
function getPriceForStars(stars) {
    stars = Math.max(MIN_STARS, Math.min(MAX_STARS, stars));

    const exactTier = pricingTiers.find(
        tier => tier.stars === stars
    );

    if (exactTier) {
        return exactTier.price;
    }

    for (let i = 0; i < pricingTiers.length - 1; i++) {
        const lower = pricingTiers[i];
        const upper = pricingTiers[i + 1];

        if (stars > lower.stars && stars < upper.stars) {
            const progress =
                (stars - lower.stars) /
                (upper.stars - lower.stars);

            const price =
                lower.price +
                progress * (upper.price - lower.price);

            return Math.round(price);
        }
    }

    const lastTier = pricingTiers[pricingTiers.length - 1];

    return Math.round(
        stars * (lastTier.price / lastTier.stars)
    );
}

// Проверка и нормализация количества
function getValidStars() {
    const value = Number(starInput.value);

    if (!Number.isFinite(value)) {
        return MIN_STARS;
    }

    return Math.floor(
        Math.max(MIN_STARS, Math.min(MAX_STARS, value))
    );
}

// Пересчёт цены
function calculatePrice() {
    const rawValue = Number(starInput.value);

    if (
        starInput.value.trim() === "" ||
        !Number.isFinite(rawValue)
    ) {
        calcPrice.textContent = "—";
        inputHint.textContent = "Введи количество Stars";
        return;
    }

    if (rawValue < MIN_STARS) {
        calcPrice.textContent = formatNumber(
            pricingTiers[0].price
        ) + " сум";

        inputHint.textContent =
            "Минимальный заказ — 50 Stars";

        return;
    }

    if (rawValue > MAX_STARS) {
        calcPrice.textContent = "—";
        inputHint.textContent =
            "Максимум — 10 000 000 Stars";
        return;
    }

    const stars = Math.floor(rawValue);
    const price = getPriceForStars(stars);

    calcPrice.textContent =
        formatNumber(price) + " сум";

    inputHint.textContent =
        "Количество: " + formatNumber(stars) + " Stars";
}

// Быстрое добавление Stars
function addStars(amount) {
    const current = Number(starInput.value);

    const base = Number.isFinite(current) && current >= MIN_STARS
        ? Math.floor(current)
        : MIN_STARS;

    starInput.value = Math.min(
        MAX_STARS,
        base + amount
    );

    calculatePrice();
}

// Переключение вкладок
function switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.tab === tabId
        );
    });

    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.toggle(
            "active",
            section.id === tabId
        );
    });

    if (tabId === "calculator") {
        calculatePrice();
    }
}

// Открытие оформления заказа
function openModal(stars, price) {
    selectedStars = stars;
    selectedPrice = price;

    modalStarsCount.textContent =
        formatNumber(stars) + " ⭐";

    modalTotalPrice.textContent =
        formatNumber(price) + " сум";

    formError.textContent = "";
    modalOverlay.classList.add("active");
    modalOverlay.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    setTimeout(() => {
        usernameInput.focus();
    }, 50);
}

// Заказ из калькулятора
function openModalFromCalc() {
    const rawValue = Number(starInput.value);

    if (
        starInput.value.trim() === "" ||
        !Number.isFinite(rawValue) ||
        rawValue < MIN_STARS ||
        rawValue > MAX_STARS
    ) {
        inputHint.textContent =
            "Введи число от 50 до 10 000 000";

        starInput.focus();
        return;
    }

    const stars = Math.floor(rawValue);
    const price = getPriceForStars(stars);

    openModal(stars, price);
}

// Закрытие окна
function closeModal() {
    modalOverlay.classList.remove("active");
    modalOverlay.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
    formError.textContent = "";
}

// Обработчики вкладок
document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", () => {
        switchTab(button.dataset.tab);
    });
});

// Обработчики пакетов
document.querySelectorAll(".package-card").forEach(button => {
    button.addEventListener("click", () => {
        const stars = Number(button.dataset.stars);
        const price = Number(button.dataset.price);

        openModal(stars, price);
    });
});

// Калькулятор
starInput.addEventListener("input", calculatePrice);

// Быстрые кнопки
document.querySelectorAll(".btn-add").forEach(button => {
    button.addEventListener("click", () => {
        addStars(Number(button.dataset.add));
    });
});

// Кнопка заказа из калькулятора
document.getElementById("calcOrderBtn").addEventListener(
    "click",
    openModalFromCalc
);

// Кнопка закрытия
document.getElementById("closeModalBtn").addEventListener(
    "click",
    closeModal
);

// Закрытие по нажатию на затемнённый фон
modalOverlay.addEventListener("click", event => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

// Закрытие клавишей Escape
document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        modalOverlay.classList.contains("active")
    ) {
        closeModal();
    }
});

// Отправка заказа в Telegram
orderForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        formError.textContent =
            "Пожалуйста, укажи свой Telegram username или ID.";

        usernameInput.focus();
        return;
    }

    if (username.length > 100) {
        formError.textContent =
            "Слишком длинный username или ID.";

        return;
    }

    const message =
        "Здравствуйте! Хочу купить Telegram Stars:\n\n" +
        "⭐ Количество: " + formatNumber(selectedStars) + " Stars\n" +
        "💰 Сумма: " + formatNumber(selectedPrice) + " сум\n" +
        "👤 Telegram покупателя: " + username;

    const telegramURL =
        "https://t.me/Dragon_jdjd" 
        encodeURIComponent(message);

    closeModal();

    // Переход в Telegram
    window.location.href = telegramURL;
});

// Анимированный фон с частицами
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let animationFrame = null;

function resizeCanvas() {
    const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.round(canvasWidth * pixelRatio);
    canvas.height = Math.round(canvasHeight * pixelRatio);

    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    const particleCount = Math.min(
        70,
        Math.max(30, Math.floor(canvasWidth / 18))
    );

    particles = Array.from(
        { length: particleCount },
        () => new Particle(true)
    );
}

class Particle {
    constructor(randomY = false) {
        this.x = Math.random() * canvasWidth;

        this.y = randomY
            ? Math.random() * canvasHeight
            : canvasHeight;

        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.65 + 0.15;
        this.opacity = Math.random() * 0.45 + 0.15;
    }

    update() {
        this.y -= this.speedY;

        if (this.y < -5) {
            this.y = canvasHeight + 5;
            this.x = Math.random() * canvasWidth;
        }
    }

    draw() {
        ctx.fillStyle =
            `rgba(0, 210, 255, ${this.opacity})`;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

function animateBackground() {
    ctx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    animationFrame = requestAnimationFrame(
        animateBackground
    );
}

resizeCanvas();
animateBackground();

window.addEventListener("resize", resizeCanvas);

// Уменьшаем нагрузку, когда вкладка не видна
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    } else if (animationFrame === null) {
        animateBackground();
    }
});

// Первоначальный расчёт
calculatePrice();
