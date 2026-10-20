/**
 * Bank Management System - Shared Store & Core Backend Models
 * Mirrors Java Backend: Customer.java & BankAccount.java
 */

class Customer {
    constructor(customerId, customerName) {
        this.customerId = customerId;
        this.customerName = customerName;
    }

    getCustomerId() {
        return this.customerId;
    }

    getCustomerName() {
        return this.customerName;
    }
}

class BankAccount {
    constructor(balance, accountNumber, customer) {
        this.balance = parseFloat(balance) || 0.0;
        this.accountNumber = accountNumber;
        this.customer = customer; // Instance or object with customerId and customerName
    }

    deposite(amount) {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new Error("Amount must be positive and greater than 0");
        }
        this.balance += parsedAmount;
        return this.balance;
    }

    withdraw(amount) {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new Error("Withdrawal amount must be greater than 0");
        }
        if (parsedAmount > this.balance) {
            throw new Error("Insufficient funds. Available balance: ₹" + this.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        }
        this.balance -= parsedAmount;
        return this.balance;
    }

    transferFunds(destinationAccount, amount) {
        const parsedAmount = parseFloat(amount);

        if (!destinationAccount || destinationAccount.accountNumber === this.accountNumber) {
            throw new Error("Transfer Unsuccessful: Invalid destination account");
        }
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new Error("Transfer Unsuccessful: Amount must be greater than 0");
        }
        if (parsedAmount > this.balance) {
            throw new Error("Transfer Unsuccessful: Insufficient funds in source account");
        }

        // Execute transfer
        this.balance -= parsedAmount;
        destinationAccount.balance += parsedAmount;

        return {
            amount: parsedAmount,
            sourceAccount: this.accountNumber,
            destAccount: destinationAccount.accountNumber,
            remainingBalance: this.balance,
            destinationBalance: destinationAccount.balance
        };
    }

    getBalance() {
        return this.balance;
    }

    displayAccountDetails() {
        const custName = this.customer ? (this.customer.customerName || this.customer.getCustomerName?.() || "Unknown") : "N/A";
        return `Account Number: ${this.accountNumber}, Balance: ₹${this.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Customer Name: ${custName}`;
    }
}

// Persistent Storage Management
const STORAGE_KEYS = {
    CUSTOMERS: 'bms_customers',
    ACCOUNTS: 'bms_accounts',
    TRANSACTIONS: 'bms_transactions'
};

const BankStore = {
    formatCurrency(val) {
        const num = parseFloat(val) || 0;
        return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    // Initial Seed Data (Monarch Private Banking Overview)
    init() {
        // Upgrade to Monarch private banking seed if previous seed is legacy
        if (!localStorage.getItem('monarch_private_banking_v1')) {
            localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
            localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
            localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
            localStorage.setItem('monarch_private_banking_v1', 'true');
        }

        if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
            const initialCustomers = [
                { customerId: "CUST-1001", customerName: "Anmol Goyal" },
                { customerId: "CUST-1002", customerName: "Sophia Martinez" },
                { customerId: "CUST-1003", customerName: "David Chen" },
                { customerId: "CUST-1004", customerName: "Elena Rostova" }
            ];
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
        }

        if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
            const customers = this.getCustomers();
            const initialAccounts = [
                {
                    accountNumber: "6347389258905",
                    balance: 5000.00,
                    customerId: customers[0].customerId,
                    customerName: customers[0].customerName,
                    accountType: "Savings Account",
                    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
                },
                {
                    accountNumber: "8840192471920",
                    balance: 12000.00,
                    customerId: customers[0].customerId,
                    customerName: customers[0].customerName,
                    accountType: "Current Account",
                    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
                },
                {
                    accountNumber: "9123847291845",
                    balance: 85000.00,
                    customerId: customers[1]?.customerId || "CUST-1002",
                    customerName: customers[1]?.customerName || "Sophia Martinez",
                    accountType: "Business Current",
                    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
                }
            ];
            localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
        }

        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            const accounts = this.getAccounts();
            const initialTransactions = [
                {
                    id: "TXN-" + Math.floor(100000 + Math.random() * 900000),
                    type: "DEPOSIT",
                    amount: 2000.00,
                    sourceAccount: accounts[0]?.accountNumber || "6347389258905",
                    destinationAccount: null,
                    timestamp: new Date().toISOString(),
                    status: "Completed",
                    notes: "Money deposited · Savings · Today"
                },
                {
                    id: "TXN-" + Math.floor(100000 + Math.random() * 900000),
                    type: "WITHDRAW",
                    amount: 500.00,
                    sourceAccount: accounts[1]?.accountNumber || "8840192471920",
                    destinationAccount: null,
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    status: "Completed",
                    notes: "Money withdrawn · Current · Yesterday"
                }
            ];
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
        }
    },

    // Customers Operations
    getCustomers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
        } catch (e) {
            return [];
        }
    },

    addCustomer(customerId, customerName) {
        const id = customerId.trim();
        const name = customerName.trim();

        if (!id || !name) {
            throw new Error("Both Customer ID and Customer Name are required.");
        }

        const customers = this.getCustomers();
        if (customers.some(c => c.customerId.toLowerCase() === id.toLowerCase())) {
            throw new Error(`Customer with ID '${id}' already exists.`);
        }

        const newCustomer = new Customer(id, name);
        customers.push({ customerId: newCustomer.customerId, customerName: newCustomer.customerName });
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        return newCustomer;
    },

    getCustomerById(customerId) {
        return this.getCustomers().find(c => c.customerId === customerId);
    },

    deleteCustomer(customerId) {
        let customers = this.getCustomers();
        const accounts = this.getAccountsByCustomer(customerId);
        if (accounts.length > 0) {
            throw new Error(`Cannot delete customer: ${accounts.length} active bank account(s) are linked to this customer.`);
        }

        customers = customers.filter(c => c.customerId !== customerId);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        return true;
    },

    // Bank Account Operations
    getAccounts() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) || [];
        } catch (e) {
            return [];
        }
    },

    getAccountByNumber(accountNumber) {
        const raw = this.getAccounts().find(a => a.accountNumber === accountNumber);
        if (!raw) return null;
        const customer = new Customer(raw.customerId, raw.customerName);
        const account = new BankAccount(raw.balance, raw.accountNumber, customer);
        account.accountType = raw.accountType || "Standard Account";
        account.createdAt = raw.createdAt;
        return account;
    },

    getAccountsByCustomer(customerId) {
        return this.getAccounts().filter(a => a.customerId === customerId);
    },

    createAccount(customerId, initialBalance, customAccountNumber, accountType = "Standard Savings") {
        const customer = this.getCustomerById(customerId);
        if (!customer) {
            throw new Error("Invalid Customer: Customer ID not found.");
        }

        let accNumber = customAccountNumber?.trim();
        if (!accNumber) {
            // Auto generate 13 digit account number
            accNumber = "63" + Math.floor(10000000000 + Math.random() * 90000000000);
        }

        const accounts = this.getAccounts();
        if (accounts.some(a => a.accountNumber === accNumber)) {
            throw new Error(`Account Number '${accNumber}' already exists.`);
        }

        const balance = parseFloat(initialBalance);
        if (isNaN(balance) || balance < 0) {
            throw new Error("Initial balance cannot be negative.");
        }

        const newAcc = {
            accountNumber: accNumber,
            balance: balance,
            customerId: customer.customerId,
            customerName: customer.customerName,
            accountType: accountType,
            createdAt: new Date().toISOString()
        };

        accounts.push(newAcc);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

        // Log transaction if initial balance > 0
        if (balance > 0) {
            this.logTransaction("DEPOSIT", balance, accNumber, null, "Account opening initial deposit");
        }

        return newAcc;
    },

    saveAccountState(account) {
        const accounts = this.getAccounts();
        const index = accounts.findIndex(a => a.accountNumber === account.accountNumber);
        if (index !== -1) {
            accounts[index].balance = account.balance;
            localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
        }
    },

    // Transaction logging
    logTransaction(type, amount, sourceAccount, destinationAccount = null, notes = "") {
        const transactions = this.getTransactions();
        const txn = {
            id: "TXN-" + Math.floor(100000 + Math.random() * 900000),
            type: type, // DEPOSIT, WITHDRAW, TRANSFER
            amount: parseFloat(amount),
            sourceAccount: sourceAccount,
            destinationAccount: destinationAccount,
            timestamp: new Date().toISOString(),
            status: "Completed",
            notes: notes
        };
        transactions.unshift(txn);
        // Keep last 100 transactions
        if (transactions.length > 100) transactions.pop();
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        return txn;
    },

    getTransactions() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
        } catch (e) {
            return [];
        }
    },

    // High Level Backend Operations with Persistence
    executeDeposit(accountNumber, amount) {
        const account = this.getAccountByNumber(accountNumber);
        if (!account) throw new Error("Account not found");

        account.deposite(amount);
        this.saveAccountState(account);
        this.logTransaction("DEPOSIT", amount, accountNumber, null, "Cash / Online Deposit");
        return account;
    },

    executeWithdraw(accountNumber, amount) {
        const account = this.getAccountByNumber(accountNumber);
        if (!account) throw new Error("Account not found");

        account.withdraw(amount);
        this.saveAccountState(account);
        this.logTransaction("WITHDRAW", amount, accountNumber, null, "ATM / Branch Withdrawal");
        return account;
    },

    executeTransfer(sourceAccNum, destinationAccNum, amount) {
        const source = this.getAccountByNumber(sourceAccNum);
        if (!source) throw new Error("Source account not found");

        const dest = this.getAccountByNumber(destinationAccNum);
        if (!dest) throw new Error("Destination account not found");

        const result = source.transferFunds(dest, amount);
        this.saveAccountState(source);
        this.saveAccountState(dest);
        this.logTransaction("TRANSFER", amount, sourceAccNum, destinationAccNum, `Fund Transfer to ${destinationAccNum}`);
        return { source, dest, result };
    },

    // System Metrics
    getMetrics() {
        const customers = this.getCustomers();
        const accounts = this.getAccounts();
        const transactions = this.getTransactions();
        const totalLiquidity = accounts.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);

        return {
            totalCustomers: customers.length,
            totalAccounts: accounts.length,
            totalLiquidity: totalLiquidity,
            totalTransactions: transactions.length
        };
    }
};

// UI Notification Toast
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type} animate-slide-in`;
    
    const icon = type === "success" ? "✓" : (type === "error" ? "✕" : "ℹ");
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}

// Auto-initialize store on script load
BankStore.init();
