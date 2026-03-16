// Références
const bikeForm = document.getElementById('bikeForm');
const bikeTableBody = document.getElementById('bikeTableBody');
const searchInput = document.getElementById('searchInput');
const bikeSelect = document.getElementById('bikeSelect');
const saleForm = document.getElementById('saleForm');
const salesTableBody = document.getElementById('salesTableBody');
const incomeTableBody = document.getElementById('incomeTableBody');
const importFile = document.getElementById('importFile');

let bikes = [];
let sales = [];

// Charger les données depuis localStorage
function loadData() {
  bikes = JSON.parse(localStorage.getItem('bikes')) || [];
  sales = JSON.parse(localStorage.getItem('sales')) || [];
}

// Sauvegarder les données
function saveAll() {
  localStorage.setItem('bikes', JSON.stringify(bikes));
  localStorage.setItem('sales', JSON.stringify(sales));
}

function renderBikes(filter = "") {
  bikeTableBody.innerHTML = "";
  bikes
    .filter(b => b.name.includes(filter) || b.type.includes(filter) || b.frameNumber.includes(filter))
    .forEach((bike, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bike.name}</td>
        <td>${bike.type}</td>
        <td>${bike.frameNumber}</td>
        <td>${bike.price} MAD</td>
        <td>${bike.quantity}</td>
        <td class="${bike.quantity < 10 ? 'low-stock' : ''}">
          ${bike.quantity < 10 ? "⚠️ Stock faible" : "✅"}
        </td>
        <td>
          <button onclick="editBike(${index})">✏️</button>
          <button onclick="deleteBike(${index})">🗑️</button>
        </td>
      `;
      bikeTableBody.appendChild(row);
    });
}

function editBike(index) {
  const bike = bikes[index];
  const newName = prompt("Nom de la moto :", bike.name);
  const newType = prompt("Type de la moto :", bike.type);
  const newFrame = prompt("Numéro de châssis :", bike.frameNumber);
  const newPrice = parseFloat(prompt("Prix d'achat :", bike.price));
  const newQty = parseInt(prompt("Quantité :", bike.quantity));
  if (newName && newType && newFrame && newPrice > 0 && newQty >= 0) {
    bikes[index] = { name: newName, type: newType, frameNumber: newFrame, price: newPrice, quantity: newQty };
    saveAll();
    renderAll();
  }
}

function deleteBike(index) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette moto ?")) {
    bikes.splice(index, 1);
    saveAll();
    renderAll();
  }
}

function updateBikeOptions() {
  bikeSelect.innerHTML = '<option value="">Choisir une moto</option>';
  bikes.forEach((bike, index) => {
    if (bike.quantity > 0) {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${bike.name} - ${bike.type} (${bike.frameNumber})`;
      bikeSelect.appendChild(option);
    }
  });
}

function calculateIncome() {
  const incomeMap = {};
  sales.forEach(sale => {
    const amount = sale.salePrice;
    if (!incomeMap[sale.date]) {
      incomeMap[sale.date] = 0;
    }
    incomeMap[sale.date] += amount;
  });
  return Object.entries(incomeMap).map(([date, amount]) => ({ date, amount }));
}

function renderSales() {
  salesTableBody.innerHTML = "";
  sales.forEach((sale, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sale.date}</td>
      <td>${sale.customerName}</td>
      <td>${sale.customerPhone}</td>
      <td>${sale.bikeName}</td>
      <td>${sale.bikeType}</td>
      <td>${sale.frameNumber}</td>
      <td>${sale.purchasePrice} MAD</td>
      <td>${sale.salePrice} MAD</td>
      <td>
        <button onclick="editSale(${index})">✏️</button>
        <button onclick="deleteSale(${index})">🗑️</button>
      </td>
    `;
    salesTableBody.appendChild(row);
  });
}

function editSale(index) {
  const sale = sales[index];
  const newPrice = parseFloat(prompt("Nouveau prix de vente :", sale.salePrice));
  const newDate = prompt("Date de vente (aaaa-mm-jj) :", sale.date);
  if (newPrice > 0 && newDate) {
    sale.salePrice = newPrice;
    sale.date = newDate;
    saveAll();
    renderAll();
  }
}

function deleteSale(index) {
  if (confirm("Voulez-vous vraiment supprimer cette vente ?")) {
    sales.splice(index, 1);
    saveAll();
    renderAll();
  }
}

function renderIncomes() {
  incomeTableBody.innerHTML = "";
  const incomeData = calculateIncome();
  incomeData.forEach(income => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${income.date}</td>
      <td>${income.amount.toFixed(2)} MAD</td>
    `;
    incomeTableBody.appendChild(row);
  });
}

function exportIncomeToExcel() {
  const wb = XLSX.utils.book_new();
  const wsData = [["Date", "Total des ventes (MAD)"]];
  calculateIncome().forEach(income => {
    wsData.push([income.date, income.amount]);
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Revenus journaliers");
  XLSX.writeFile(wb, "revenus_journaliers.xlsx");
}

function exportSalesToExcel() {
  const wb = XLSX.utils.book_new();
  const wsData = [["Date", "Client", "Téléphone", "Moto", "Type", "Châssis", "Prix d'achat", "Prix de vente"]];
  sales.forEach(sale => {
    wsData.push([
      sale.date, sale.customerName, sale.customerPhone,
      sale.bikeName, sale.bikeType, sale.frameNumber,
      sale.purchasePrice, sale.salePrice
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Historique des ventes");
  XLSX.writeFile(wb, "ventes.xlsx");
}

// Ajouter une moto
bikeForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('bikeName').value.trim();
  const type = document.getElementById('bikeType').value.trim();
  const frameNumber = document.getElementById('bikeFrame').value.trim();
  const price = parseFloat(document.getElementById('bikePrice').value);
  const quantity = parseInt(document.getElementById('bikeQuantity').value);
  if (!name || !type || !frameNumber || price <= 0 || quantity <= 0) {
    return alert("Veuillez remplir correctement les informations.");
  }
  bikes.push({ name, type, frameNumber, price, quantity });
  saveAll();
  renderAll();
  bikeForm.reset();
});

// Enregistrer une vente
saleForm.addEventListener('submit', e => {
  e.preventDefault();
  const customerName = document.getElementById('customerName').value.trim();
  const customerPhone = document.getElementById('customerPhone').value.trim();
  const bikeIndex = parseInt(bikeSelect.value);
  const saleDate = document.getElementById('saleDate').value;
  const salePrice = parseFloat(document.getElementById('salePrice').value);
  if (!customerName || !customerPhone || isNaN(bikeIndex) || !saleDate || isNaN(salePrice)) {
    return alert("Veuillez remplir tous les champs.");
  }
  const bike = bikes[bikeIndex];
  if (salePrice <= bike.price) {
    return alert("⚠️ Le prix de vente doit être supérieur au prix d'achat !");
  }
  bike.quantity--;
  sales.push({
    date: saleDate,
    customerName, customerPhone,
    bikeName: bike.name, bikeType: bike.type,
    frameNumber: bike.frameNumber,
    purchasePrice: bike.price, salePrice
  });
  saveAll();
  renderAll();
  saleForm.reset();
});

// Recherche
searchInput.addEventListener('input', () => renderBikes(searchInput.value.trim()));

// Importation manuelle (par bouton)
function importData() {
  const file = importFile.files[0];
  if (!file) return alert("Veuillez choisir un fichier JSON.");
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      bikes = data.bikes || [];
      sales = data.sales || [];
      saveAll();
      renderAll();
      alert("✅ Données importées avec succès !");
    } catch (err) {
      alert("❌ Erreur lors de l'importation !");
    }
  };
  reader.readAsText(file);
}

// Sauvegarde
function downloadBackup() {
  const dataStr = JSON.stringify({ bikes, sales }, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "sauvegarde_motos.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Affichage général
function renderAll() {
  renderBikes();
  updateBikeOptions();
  renderSales();
  renderIncomes();
}

// Initialisation après chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  renderAll();
});
