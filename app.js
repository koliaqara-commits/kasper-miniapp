const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#f4f4fa");
  tg.setBackgroundColor("#f4f4fa");
}

const state = {
  filter: "active",
  deals: [
    {
      id: "etfrljm4i3",
      amount: 67,
      currency: "STARS",
      title: "подарок",
      date: "12 мая, 21:36",
      status: "Оплачена",
      step: 3,
    },
    {
      id: "j33mdx14el",
      amount: 5,
      currency: "TON",
      title: "лададвл",
      date: "12 мая, 15:25",
      status: "Ожидание оплаты",
      step: 1,
    },
    {
      id: "ksp482m0q",
      amount: 10.92,
      currency: "USDT",
      title: "аккаунт",
      date: "14 мая, 14:57",
      status: "Получена",
      step: 5,
    },
  ],
  balances: [
    ["STARS", 322.15],
    ["TON", 18.4],
    ["USDT", 128.76],
  ],
  transactions: [
    ["USDT", "Оплата сделки", "14.05.2026 в 14:57", -10.92],
    ["USDT", "Зачисление", "14.05.2026 в 14:56", 5],
    ["USDT", "Получено по сделке", "13.05.2026 в 18:07", 6.7],
    ["TON", "Оплата сделки", "12.05.2026 в 22:35", -28],
    ["TON", "Оплата сделки", "12.05.2026 в 21:51", -0.36],
    ["STARS", "Оплата сделки", "12.05.2026 в 21:36", -67.67],
    ["STARS", "Вывод", "12.05.2026 в 21:23", -50, "ОЖИДАНИЕ"],
    ["STARS", "Получено по сделке", "12.05.2026 в 21:22", 100],
  ],
  leaders: [
    ["4", "rally", "73 сделок", "$25.6k"],
    ["5", "rally", "62 сделок", "$20.5k"],
    ["6", "rally", "58 сделок", "$18.1k"],
  ],
};

const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");
const dealList = document.querySelector("#dealList");
const balanceGrid = document.querySelector("#balanceGrid");
const transactionList = document.querySelector("#transactionList");
const leaderList = document.querySelector("#leaderList");
const dealForm = document.querySelector("#dealForm");

function showView(id) {
  views.forEach((view) => view.classList.toggle("active", view.id === id));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatAmount(amount, currency) {
  const value = Number(amount).toLocaleString("ru-RU", {
    minimumFractionDigits: Number.isInteger(Number(amount)) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `${value} ${currency}`;
}

function assetClass(currency) {
  return currency.toLowerCase();
}

function assetMark(currency) {
  if (currency === "TON") return "▽";
  if (currency === "USDT") return "T";
  return "★";
}

function renderProgress(step) {
  const labels = ["Создана", "Покупатель", "Оплачена", "В эскроу", "Получена"];

  return `
    <div class="progress">
      ${labels
        .map(
          (label, index) => `
            <div class="step ${index < step ? "done" : ""}">
              <span class="step-dot"></span>
              <span class="step-line"></span>
              <span class="step-label">${label}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderDeals() {
  const deals =
    state.filter === "active"
      ? state.deals.filter((deal) => deal.status !== "Получена")
      : state.deals;

  dealList.innerHTML = deals
    .map(
      (deal) => `
        <article class="deal-card">
          <div class="deal-top">
            <strong>#${deal.id}</strong>
            <span class="status ${deal.step < 3 ? "waiting" : ""}">${deal.status}</span>
          </div>

          <div class="asset-row">
            <span class="asset-icon ${assetClass(deal.currency)}">${assetMark(deal.currency)}</span>
            <div>
              <strong class="asset-amount">${formatAmount(deal.amount, deal.currency)}</strong>
              <span class="asset-title">${deal.title}</span>
            </div>
          </div>

          <time class="deal-date">◷ ${deal.date}</time>
          ${renderProgress(deal.step)}
        </article>
      `
    )
    .join("");
}

function renderBalances() {
  balanceGrid.innerHTML = state.balances
    .map(
      ([currency, amount]) => `
        <article class="balance-card">
          <span class="asset-icon ${assetClass(currency)}">${assetMark(currency)}</span>
          <div>
            <span>${currency}</span>
            <strong>${formatAmount(amount, currency)}</strong>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTransactions() {
  transactionList.innerHTML = state.transactions
    .map(([currency, title, date, amount, badge]) => {
      const plus = amount > 0;
      const sign = plus ? "+" : "−";
      return `
        <article class="transaction-card">
          <span class="asset-icon ${assetClass(currency)}">${assetMark(currency)}</span>
          <span class="direction ${plus ? "in" : "out"}">${plus ? "↑" : "↓"}</span>
          <div class="transaction-main">
            <strong>${title}</strong>
            ${badge ? `<em>${badge}</em>` : ""}
            <time>${date}</time>
          </div>
          <strong class="transaction-amount ${plus ? "plus" : "minus"}">
            ${sign}${Math.abs(amount).toFixed(2)} ${currency}
          </strong>
        </article>
      `;
    })
    .join("");
}

function renderLeaders() {
  leaderList.innerHTML = state.leaders
    .map(
      ([rank, name, deals, amount]) => `
        <article class="leader-row">
          <strong class="leader-rank">${rank}</strong>
          <span class="leader-avatar small-avatar"></span>
          <div>
            <strong>${name}</strong>
            <span>${deals}</span>
          </div>
          <strong class="leader-amount">${amount}</strong>
          <button class="mini-gift" type="button" aria-label="Подарок">🎁</button>
        </article>
      `
    )
    .join("");
}

function hydrateProfile() {
  const user = tg?.initDataUnsafe?.user;
  if (!user) return;

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const displayName = name || "Kasper user";

  document.querySelector("#profileName").textContent = displayName;
  document.querySelector("#leaderUserName").textContent = displayName;
  document.querySelector("#profileMeta").textContent = user.username ? `@${user.username}` : `ID ${user.id}`;
  document.querySelector("#leaderUserMeta").textContent = user.username ? `@${user.username}` : "Telegram Mini App";
  document.querySelector("#profileAvatar").textContent = displayName.slice(0, 1).toUpperCase();
}

document.querySelector("#openCreate").addEventListener("click", () => showView("createView"));
document.querySelector("#openTransactions").addEventListener("click", () => showView("transactionsView"));

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelectorAll(".deal-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll(".deal-tab").forEach((item) => item.classList.toggle("active", item === button));
    renderDeals();
  });
});

dealForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const form = new FormData(dealForm);
  state.deals.unshift({
    id: Math.random().toString(36).slice(2, 12),
    amount: Number(form.get("amount")),
    currency: form.get("currency"),
    title: form.get("title"),
    date: "сегодня",
    status: "Ожидание оплаты",
    step: 1,
  });

  tg?.HapticFeedback?.notificationOccurred?.("success");
  renderDeals();
  showView("dealsView");
});

hydrateProfile();
renderDeals();
renderBalances();
renderTransactions();
renderLeaders();
