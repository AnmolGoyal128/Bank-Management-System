/**
 * Customer Management UI Logic
 * Interacts with BankStore and Customer model
 */

document.addEventListener("DOMContentLoaded", () => {
    renderCustomers();
    updateCustomerMetrics();
    setupEventListeners();
});

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById("customer-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            renderCustomers(e.target.value);
        });
    }

    // New Customer Form Submit
    const addCustomerForm = document.getElementById("add-customer-form");
    if (addCustomerForm) {
        addCustomerForm.addEventListener("submit", handleAddCustomer);
    }

    // Auto-generate Customer ID button
    const autoGenBtn = document.getElementById("btn-generate-cust-id");
    if (autoGenBtn) {
        autoGenBtn.addEventListener("click", () => {
            const randomId = "CUST-" + Math.floor(1000 + Math.random() * 9000);
            const idInput = document.getElementById("new-customer-id");
            if (idInput) idInput.value = randomId;
        });
    }
}

function updateCustomerMetrics() {
    const customers = BankStore.getCustomers();
    const accounts = BankStore.getAccounts();

    const totalCustEl = document.getElementById("stat-total-customers");
    const activeWithAccEl = document.getElementById("stat-active-with-accounts");
    const totalDepositsCustEl = document.getElementById("stat-total-customer-deposits");

    if (totalCustEl) totalCustEl.textContent = customers.length;

    // Count customers with at least 1 account
    const customerIdsWithAccounts = new Set(accounts.map(a => a.customerId));
    if (activeWithAccEl) activeWithAccEl.textContent = customerIdsWithAccounts.size;

    // Total deposit sum
    const totalLiquidity = accounts.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);
    if (totalDepositsCustEl) {
        totalDepositsCustEl.textContent = BankStore.formatCurrency(totalLiquidity);
    }
}

function renderCustomers(filterText = "") {
    const customerListContainer = document.getElementById("customer-grid");
    if (!customerListContainer) return;

    let customers = BankStore.getCustomers();

    if (filterText.trim()) {
        const query = filterText.toLowerCase();
        customers = customers.filter(c => 
            c.customerName.toLowerCase().includes(query) || 
            c.customerId.toLowerCase().includes(query)
        );
    }

    if (customers.length === 0) {
        customerListContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary); background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                <div style="font-size: 2rem; margin-bottom: 0.75rem;">👥</div>
                <h3>No Customers Found</h3>
                <p style="font-size: 0.9rem; margin-top: 0.25rem;">Try adjusting your search criteria or register a new customer above.</p>
            </div>
        `;
        return;
    }

    customerListContainer.innerHTML = customers.map(cust => {
        const accounts = BankStore.getAccountsByCustomer(cust.customerId);
        const totalCustBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
        const initials = cust.customerName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();

        return `
            <div class="customer-card">
                <div>
                    <div class="customer-header">
                        <div class="customer-avatar">${initials}</div>
                        <div class="customer-meta">
                            <h4>${cust.customerName}</h4>
                            <span>ID: ${cust.customerId}</span>
                        </div>
                    </div>

                    <div class="customer-stats">
                        <div class="customer-stats-item">
                            <span class="label">Accounts</span>
                            <span class="val">${accounts.length} linked</span>
                        </div>
                        <div class="customer-stats-item" style="text-align: right;">
                            <span class="label">Total Balance</span>
                            <span class="val" style="color: var(--brand-emerald);">
                                ${BankStore.formatCurrency(totalCustBalance)}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="customer-actions">
                    <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="viewCustomerDetails('${cust.customerId}')">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        View Profile
                    </button>
                    <a href="accounts.html?prefillCustomer=${cust.customerId}" class="btn btn-primary btn-sm" title="Create Account for this Customer">
                        + Account
                    </a>
                    <button class="btn btn-danger btn-sm" onclick="handleDeleteCustomer('${cust.customerId}', '${cust.customerName}')" title="Delete Customer">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function handleAddCustomer(e) {
    e.preventDefault();
    const idInput = document.getElementById("new-customer-id");
    const nameInput = document.getElementById("new-customer-name");

    const customerId = idInput.value.trim();
    const customerName = nameInput.value.trim();

    try {
        const newCust = BankStore.addCustomer(customerId, customerName);
        showToast(`Customer '${newCust.customerName}' (ID: ${newCust.customerId}) created successfully!`, "success");
        
        // Reset form & close modal
        idInput.value = "";
        nameInput.value = "";
        closeModal("add-customer-modal");

        renderCustomers();
        updateCustomerMetrics();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function handleDeleteCustomer(customerId, customerName) {
    if (!confirm(`Are you sure you want to remove customer '${customerName}' (ID: ${customerId})?`)) {
        return;
    }

    try {
        BankStore.deleteCustomer(customerId);
        showToast(`Customer '${customerName}' deleted successfully`, "success");
        renderCustomers();
        updateCustomerMetrics();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function viewCustomerDetails(customerId) {
    const cust = BankStore.getCustomerById(customerId);
    if (!cust) return;

    const accounts = BankStore.getAccountsByCustomer(customerId);
    const modalContent = document.getElementById("customer-detail-content");

    if (modalContent) {
        modalContent.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-color);">
                <div class="customer-avatar" style="width: 54px; height: 54px; font-size: 1.35rem;">
                    ${cust.customerName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h3 style="font-size: 1.25rem; color: var(--brand-navy); font-family: var(--font-heading);">${cust.customerName}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.88rem;">Customer ID: <strong style="color: var(--brand-navy); font-variant-numeric: tabular-nums;">${cust.customerId}</strong></p>
                </div>
            </div>

            <h4 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Linked Accounts (${accounts.length})</h4>
            
            ${accounts.length === 0 ? `
                <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-md); text-align: center; color: var(--text-secondary);">
                    No bank accounts linked to this client yet.
                    <div style="margin-top: 0.75rem;">
                        <a href="accounts.html?prefillCustomer=${cust.customerId}" class="btn btn-primary btn-sm">+ Open Account</a>
                    </div>
                </div>
            ` : `
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${accounts.map(acc => `
                        <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600; color: var(--brand-navy); font-variant-numeric: tabular-nums;">${acc.accountNumber}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${acc.accountType || "Savings Account"}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 700; color: var(--brand-emerald); font-size: 1.1rem; font-variant-numeric: tabular-nums;">
                                    ${BankStore.formatCurrency(acc.balance)}
                                </div>
                                <a href="accounts.html?accountNumber=${acc.accountNumber}" style="font-size: 0.78rem; color: var(--brand-emerald); text-decoration: none; font-weight: 600;">Manage Account &rarr;</a>
                            </div>
                        </div>
                    `).join("")}
                </div>
            `}
        `;
    }

    openModal("customer-detail-modal");
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
}
