package in.java;

public class BankAccount {
    private double balance;
    private String accountNumber;
    private Customer customer;

    public BankAccount(double balance, String accountNumber, Customer customer) {
        this.balance = balance;
        this.accountNumber = accountNumber;
        this.customer = customer;
    }

    public double deposite(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive and greater than 0");
        }
        balance += amount;
        return balance;
    }
    public double withdraw(double amount) {
        if (amount <= balance) {
            System.out.println("Insufficient funds");
        }
        balance -= amount;
        return balance;
    }
    public void transferFunds(BankAccount destination, double amount) {
        if (amount > balance) {
            System.out.println("Insufficient funds");
        }

    }
    private double getBalance() {
        return balance;
    }
    public void displayAccountDetails(){
        System.out.println("Account Number: " + accountNumber
                + ", Balance: " + balance
                + ", Customer Name: " + customer.getCustomerName());
    }
}
