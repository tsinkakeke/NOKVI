// Redirect if not logged in
if (!localStorage.getItem('user')) {
  window.location.href = 'login.html';
}

// Load saved data
let userName = localStorage.getItem('user') || 'Friend';
let avatarSrc = localStorage.getItem('userAvatar') || '';

const profileName = document.getElementById('profileName');
const profileAvatar = document.getElementById('profileAvatar');
const editNameBtn = document.getElementById('editNameBtn');
const editNameRow = document.getElementById('editNameRow');
const editNameInput = document.getElementById('editNameInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const cancelNameBtn = document.getElementById('cancelNameBtn');
const logoutBtn = document.getElementById('logoutBtn');
const avatarUpload = document.getElementById('avatarUpload');

// Set initial values
profileName.textContent = userName;
profileAvatar.src = avatarSrc || 'assets/basket_of_yarn.jpg';

// Edit name
editNameBtn.addEventListener('click', () => {
  editNameInput.value = userName;
  editNameRow.hidden = false;
  editNameBtn.hidden = true;
  editNameInput.focus();
});

saveNameBtn.addEventListener('click', () => {
  const newName = editNameInput.value.trim();
  if (!newName) return;
  userName = newName;
  localStorage.setItem('user', userName);
  profileName.textContent = userName;
  editNameRow.hidden = true;
  editNameBtn.hidden = false;
});

cancelNameBtn.addEventListener('click', () => {
  editNameRow.hidden = true;
  editNameBtn.hidden = false;
});

// Avatar upload
avatarUpload.addEventListener('change', () => {
  const file = avatarUpload.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    avatarSrc = reader.result;
    localStorage.setItem('userAvatar', avatarSrc);
    profileAvatar.src = avatarSrc;
  };
  reader.readAsDataURL(file);
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  localStorage.removeItem('userAvatar');
  window.location.href = 'login.html';
});

// Hamburger nav
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));

// Load orders
function renderOrders() {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;

  const orders = JSON.parse(localStorage.getItem('kn_orders') || '[]');

  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="orders-empty">No orders yet — go shop something! 🧶</p>';
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-card__header">
        <span class="order-card__date">📅 ${order.date}</span>
        <span class="order-card__total">$${order.total.toFixed(2)}</span>
      </div>
      <div class="order-card__items">
        ${order.items.map(item => `
          <div class="order-card__item">
            <span>${item.name}</span>
            <span>$${item.price.toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

renderOrders();
