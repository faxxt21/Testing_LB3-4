const DEFAULT_PRODUCTS = [
  { id: "01", name: "Миша бездротова", desc: "Оптична", price: "550", date: "2026-01-01" },
  { id: "02", name: "Клавіатура мех.", desc: "Red Switches", price: "1800", date: "2026-03-05" },
  { id: "03", name: "Аудіокабель", desc: "Mini-Jack 1.5m", price: "200", date: "2026-03-21" }
];
let products = JSON.parse(localStorage.getItem('products_v3')) || DEFAULT_PRODUCTS;
const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const editIndexField = document.getElementById('edit-index');
const idInput = document.getElementById('prod-id');
const nameInput = document.getElementById('prod-name');
const descInput = document.getElementById('prod-desc');
const priceInput = document.getElementById('prod-price');
const dateInput = document.getElementById('prod-date');
const errorAlert = document.getElementById('error-alert');
const cancelBtn = document.getElementById('cancel-btn');
const sortSelect = document.getElementById('sort-select');
const tbody = document.getElementById('product-tbody');
const emptyState = document.getElementById('empty-state');
function saveToStorage() {
  localStorage.setItem('products_v3', JSON.stringify(products));
}
function showError(message) {
  errorAlert.textContent = message;
  errorAlert.style.display = 'block';
}
function clearError() {
  errorAlert.textContent = '';
  errorAlert.style.display = 'none';
}
function renderTable() {
  tbody.innerHTML = '';
  let displayList = [...products];
  const sortVal = sortSelect.value;
  if (sortVal === 'name-asc') {
    displayList.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  } else if (sortVal === 'name-desc') {
    displayList.sort((a, b) => b.name.localeCompare(a.name, 'uk'));
  } else if (sortVal === 'price-asc') {
    displayList.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortVal === 'price-desc') {
    displayList.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }

  if (displayList.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    displayList.forEach((prod) => {
      const originalIndex = products.findIndex(p => p.id === prod.id);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${prod.id}</strong></td>
        <td>${prod.name}</td>
        <td>${prod.desc || '—'}</td>
        <td>${prod.price}</td>
        <td>${prod.date}</td>
        <td class="actions-cell">
          <button class="btn-secondary" onclick="startEdit(${originalIndex})">Редагувати</button>
          <button class="btn-danger" onclick="deleteProduct(${originalIndex})">Видалити</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();
  const idVal = idInput.value.trim();
  const nameVal = nameInput.value.trim();
  const descVal = descInput.value.trim();
  const priceVal = priceInput.value.trim();
  const dateVal = dateInput.value;
  const editIndex = parseInt(editIndexField.value, 10);
  if (!idVal || !nameVal || !priceVal || !dateVal) {
    showError("Усі поля, позначені зірочкою (*) є обов'язковими");
    return;
  }
  const numPrice = parseFloat(priceVal);
  if (isNaN(numPrice) || numPrice < 0) {
    showError("Ціна повинна бути невід'ємним числом");
    return;
  }
  const isDuplicate = products.some((p, idx) => p.id.toLowerCase() === idVal.toLowerCase() && idx !== editIndex);
  if (isDuplicate) {
    showError(`Товар із ID "${idVal}" вже існує`);
    return;
  }
  const productPayload = {
    id: idVal,
    name: nameVal,
    desc: descVal,
    price: priceVal,
    date: dateVal
  };
  if (editIndex >= 0) {
    products[editIndex] = productPayload;
  } else {
    products.push(productPayload);
  }
  saveToStorage();
  resetForm();
  renderTable();
});
window.startEdit = function(index) {
  clearError();
  const prod = products[index];
  editIndexField.value = index;
  idInput.value = prod.id;
  nameInput.value = prod.name;
  descInput.value = prod.desc;
  priceInput.value = prod.price;
  dateInput.value = prod.date;
  formTitle.textContent = 'Редагувати товар';
  cancelBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
window.deleteProduct = function(index) {
  if (confirm(`Видалити товар "${products[index].name}"?`)) {
    products.splice(index, 1);
    saveToStorage();
    renderTable();
  }
};
function resetForm() {
  form.reset();
  editIndexField.value = '-1';
  formTitle.textContent = 'Додати новий товар';
  cancelBtn.style.display = 'none';
  clearError();
}
cancelBtn.addEventListener('click', resetForm);
sortSelect.addEventListener('change', renderTable);
renderTable();
