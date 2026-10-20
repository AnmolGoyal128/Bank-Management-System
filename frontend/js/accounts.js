/**
 * Bank Account Operations UI Logic
 * Implements deposite, withdraw, transferFunds, displayAccountDetails, and createAccount
 */

let selectedAccountNumber = null;

document.addEventListener("DOMContentLoaded", () => {
    populateCustomerDropdowns();
    populateAccountDropdowns();
    renderAccountsTable();
    renderTransactionsTable();
    setupEventListeners();
    handleUrlParams();
});

function setupEventListeners() {
    // Operation Tab Switching (Deposit, Withdraw, Transfer, Details)
    document.querySelectorAll(".operation-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".operation-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const targetPane = document.getElementById(tab.getAttribute("data-tab"));
            if (targetPane) targetPane.classList.add("active");
        });
    });

    // Form Submissions
    const createAccForm = document.getElementById("create-account-form");
    if (createAccForm) createAccForm.addEventListener("submit", handleCreateAccount);

    const depositForm = document.getElementById("form-deposit");
    if (depositForm) depositForm.addEventListener("submit", handleDeposit);

    const withdrawForm = document.getElementById("form-withdraw");
    if (withdrawForm) withdrawForm.addEventListener("submit", handleWithdraw);

    const transferForm = document.getElementById("form-transfer");
    if (transferForm) transferForm.addEventListener("submit", handleTransfer);

    // Filter Account Table Search
    const searchInput = document.getElementById("account-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            renderAccountsTable(e.target.value);
        });
    }

    // Auto-generate Account Number helper
    const autoGenAccBtn = document.getElementById("btn-generate-acc-num");
    if (autoGenAccBtn) {
        autoGenAccBtn.addEventListener("click", () => {
            const accNum = "63" + Math.floor(10000000000 + Math.random() * 90000000000);
            const input = document.getElementById("new-account-number");
            if (input) input.value = accNum;
        });
    }

    // Interactive Virtual Card sync when source account changes
    const depositSelect = document.getElementById("deposit-account-select");
    if (depositSelect) {
        depositSelect.addEventListener("change", (e) => selectAndPreviewAccount(e.target.value));
    }

    const withdrawSelect = document.getElementById("withdraw-account-select");
    if (withdrawSelect) {
        withdrawSelect.addEventListener("change", (e) => selectAndPreviewAccount(e.target.value));
    }

    const transferSourceSelect = document.getElementById("transfer-source-select");
    if (transferSourceSelect) {
        transferSourceSelect.addEventListener("change", (e) => selectAndPreviewAccount(e.target.value));
    }
}

function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const prefillCustomer = params.get("prefillCustomer");
    const targetAcc = params.get("accountNumber");

    if (prefillCustomer) {
        const custSelect = document.getElementById("new-account-customer");
        if (custSelect) custSelect.value = prefillCustomer;
        openModal("create-account-modal");
    }

    if (targetAcc) {
        selectAndPreviewAccount(targetAcc);
    } else {
        const firstAcc = BankStore.getAccounts()[0];
        if (firstAcc) selectAndPreviewAccount(firstAcc.accountNumber);
    }
}

function populateCustomerDropdowns() {
    const customers = BankStore.getCustomers();
    const select = document.getElementById("new-account-customer");
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Customer --</option>' + 
        customers.map(c => `<option value="${c.customerId}">${c.customerName} (${c.customerId})</option>`).join("");
}

function populateAccountDropdowns() {
    const accounts = BankStore.getAccounts();
    const optionsHtml = accounts.map(a => 
        `<option value="${a.accountNumber}">${a.accountNumber} - ${a.customerName} (${BankStore.formatCurrency(a.balance)})</option>`
    ).join("");

    const dropdownIds = [
        "deposit-account-select", 
        "withdraw-account-select", 
        "transfer-source-select", 
        "transfer-dest-select",
        "display-account-select"
    ];

    dropdownIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const currentVal = el.value;
            el.innerHTML = '<option value="">-- Select Bank Account --</option>' + optionsHtml;
            if (currentVal) el.value = currentVal;
        }
    });
}

function selectAndPreviewAccount(accountNumber) {
    if (!accountNumber) return;
    selectedAccountNumber = accountNumber;

    const account = BankStore.getAccountByNumber(accountNumber);
    if (!account) return;

    // Update Virtual Card View
    const cardNumEl = document.getElementById("visual-card-number");
    const cardHolderEl = document.getElementById("visual-card-holder");
    const cardBalanceEl = document.getElementById("visual-card-balance");
    const cardTypeEl = document.getElementById("visual-card-type");

    if (cardNumEl) {
        // Format account number nicely like 6347 •••• •••• 5890
        const raw = account.accountNumber;
        const formatted = raw.length > 8 ? `${raw.slice(0, 4)} •••• •••• ${raw.slice(-4)}` : raw;
        cardNumEl.textContent = formatted;
        cardNumEl.title = raw;
    }

    if (cardHolderEl) cardHolderEl.textContent = account.customer?.customerName || account.customerName || "ACCOUNT HOLDER";
    if (cardBalanceEl) {
        cardBalanceEl.textContent = BankStore.formatCurrency(account.balance);
    }
    if (cardTypeEl) cardTypeEl.textContent = account.accountType || "Savings Account";

    // Update synchronization in dropdowns
    ["deposit-account-select", "withdraw-account-select", "transfer-source-select", "display-account-select"].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value !== accountNumber) {
            el.value = accountNumber;
        }
    });

    // Update Live Account Statement Card
    renderAccountStatement(account);
}

function renderAccountStatement(account) {
    const statementEl = document.getElementById("java-display-details-output");
    if (!statementEl) return;

    const formattedBalance = BankStore.formatCurrency(account.balance);
    const custName = account.customer ? account.customer.customerName : (account.customerName || "Verified Client");
    const custId = account.customer ? account.customer.customerId : (account.customerId || "N/A");

    statementEl.innerHTML = `
        <div class="statement-card-header">
            <div class="statement-title">
                <span class="live-status-dot"></span>
                <span>Account Specification & Status</span>
            </div>
            <span class="badge badge-emerald">Verified Active</span>
        </div>
        <div class="statement-grid">
            <div class="statement-item">
                <span class="statement-label">Primary Holder</span>
                <span class="statement-val">${custName}</span>
            </div>
            <div class="statement-item">
                <span class="statement-label">Customer ID</span>
                <span class="statement-val mono">${custId}</span>
            </div>
            <div class="statement-item">
                <span class="statement-label">Account Number</span>
                <span class="statement-val mono">${account.accountNumber}</span>
            </div>
            <div class="statement-item">
                <span class="statement-label">Available Balance</span>
                <span class="statement-val highlight">${formattedBalance}</span>
            </div>
        </div>
        <div class="statement-footer">
            <span>Institutional Security Tier 1</span>
            <span>Ledger: Reconciled</span>
        </div>
    `;
}

function handleCreateAccount(e) {
    e.preventDefault();
    const customerId = document.getElementById("new-account-customer").value;
    const initialBalance = document.getElementById("new-account-balance").value;
    const accountNumber = document.getElementById("new-account-number").value;
    const accountType = document.getElementById("new-account-type").value;

    try {
        const created = BankStore.createAccount(customerId, initialBalance, accountNumber, accountType);
        showToast(`Bank Account '${created.accountNumber}' opened successfully!`, "success");

        // Clear and close
        document.getElementById("create-account-form").reset();
        closeModal("create-account-modal");

        refreshAllViews(created.accountNumber);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function handleDeposit(e) {
    e.preventDefault();
    const accNum = document.getElementById("deposit-account-select").value;
    const amount = document.getElementById("deposit-amount").value;

    if (!accNum) {
        showToast("Please select an account to deposit into", "error");
        return;
    }

    try {
        const updatedAccount = BankStore.executeDeposit(accNum, amount);
        showToast(`Successfully deposited ${BankStore.formatCurrency(amount)} into account ${accNum}!`, "success");
        document.getElementById("deposit-amount").value = "";
        refreshAllViews(accNum);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function handleWithdraw(e) {
    e.preventDefault();
    const accNum = document.getElementById("withdraw-account-select").value;
    const amount = document.getElementById("withdraw-amount").value;

    if (!accNum) {
        showToast("Please select an account to withdraw from", "error");
        return;
    }

    try {
        const updatedAccount = BankStore.executeWithdraw(accNum, amount);
        showToast(`Successfully withdrew ${BankStore.formatCurrency(amount)} from account ${accNum}!`, "success");
        document.getElementById("withdraw-amount").value = "";
        refreshAllViews(accNum);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function handleTransfer(e) {
    e.preventDefault();
    const sourceAcc = document.getElementById("transfer-source-select").value;
    const destAcc = document.getElementById("transfer-dest-select").value;
    const amount = document.getElementById("transfer-amount").value;

    if (!sourceAcc || !destAcc) {
        showToast("Please select both source and destination accounts", "error");
        return;
    }

    if (sourceAcc === destAcc) {
        showToast("Transfer Unsuccessful: Invalid destination (source cannot be destination)", "error");
        return;
    }

    try {
        const result = BankStore.executeTransfer(sourceAcc, destAcc, amount);
        showToast(`Transfer successful: ${BankStore.formatCurrency(amount)} transferred to ${destAcc}!`, "success");
        document.getElementById("transfer-amount").value = "";
        refreshAllViews(sourceAcc);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function refreshAllViews(targetAccountNum) {
    populateAccountDropdowns();
    renderAccountsTable();
    renderTransactionsTable();
    selectAndPreviewAccount(targetAccountNum || selectedAccountNumber);
}

function renderAccountsTable(filterText = "") {
    const tableBody = document.getElementById("accounts-table-body");
    if (!tableBody) return;

    let accounts = BankStore.getAccounts();

    if (filterText.trim()) {
        const q = filterText.toLowerCase();
        accounts = accounts.filter(a => 
            a.accountNumber.toLowerCase().includes(q) || 
            a.customerName.toLowerCase().includes(q) ||
            a.customerId.toLowerCase().includes(q)
        );
    }

    if (accounts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No accounts match the criteria</td></tr>`;
        return;
    }

    tableBody.innerHTML = accounts.map(a => `
        <tr style="cursor: pointer;" onclick="selectAndPreviewAccount('${a.accountNumber}')" title="Click to inspect this account">
            <td style="font-weight: 600; color: var(--brand-navy); font-variant-numeric: tabular-nums;">
                ${a.accountNumber}
                ${a.accountNumber === selectedAccountNumber ? '<span class="badge badge-emerald" style="margin-left: 0.5rem; font-size: 0.65rem;">Selected</span>' : ''}
            </td>
            <td>
                <div style="font-weight: 600; color: var(--text-primary);">${a.customerName}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); font-variant-numeric: tabular-nums;">${a.customerId}</div>
            </td>
            <td><span class="badge badge-navy">${a.accountType || "Savings Account"}</span></td>
            <td style="font-weight: 700; color: var(--brand-navy); font-variant-numeric: tabular-nums;">
                ${BankStore.formatCurrency(a.balance)}
            </td>
            <td><span class="badge badge-emerald">Active</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); quickSelectOp('${a.accountNumber}', 'transfer')">
                    Transfer
                </button>
            </td>
        </tr>
    `).join("");
}

function quickSelectOp(accountNumber, opType) {
    selectAndPreviewAccount(accountNumber);
    const tab = document.querySelector(`.operation-tab[data-tab="tab-${opType}"]`);
    if (tab) tab.click();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function renderTransactionsTable() {
    const tableBody = document.getElementById("transactions-table-body");
    if (!tableBody) return;

    const txns = BankStore.getTransactions();

    if (txns.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">No transactions recorded yet</td></tr>`;
        return;
    }

    tableBody.innerHTML = txns.slice(0, 15).map(t => {
        let badgeClass = "badge-emerald";
        let sign = "+";
        let amountColor = "var(--brand-emerald)";

        if (t.type === "WITHDRAW") {
            badgeClass = "badge-rose";
            sign = "−";
            amountColor = "var(--danger)";
        } else if (t.type === "TRANSFER") {
            badgeClass = "badge-gold";
            sign = "⇄";
            amountColor = "var(--brand-navy)";
        }

        const dateStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(t.timestamp).toLocaleDateString();

        return `
            <tr>
                <td style="font-size: 0.8rem; color: var(--text-secondary); font-variant-numeric: tabular-nums;">${t.id}</td>
                <td><span class="badge ${badgeClass}">${t.type}</span></td>
                <td style="font-size: 0.88rem; font-variant-numeric: tabular-nums;">
                    ${t.sourceAccount} ${t.destinationAccount ? ` &rarr; ${t.destinationAccount}` : ''}
                </td>
                <td style="font-weight: 700; color: ${amountColor}; font-variant-numeric: tabular-nums;">
                    ${sign} ${BankStore.formatCurrency(t.amount)}
                </td>
                <td style="font-size: 0.8rem; color: var(--text-secondary);">${dateStr}</td>
                <td><span class="badge badge-emerald">${t.status}</span></td>
            </tr>
        `;
    }).join("");
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
}
