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


        if(destination == null || destination == this) {
            System.out.println("Transfer Unsuccessful due to Invalid destination");
        }
        else if(amount <= 0 && amount > balance){
            System.out.println("Transfer Unsuccessful due to unsufficient funds");
        }
        else{
            balance -= amount;
            destination.balance += amount;
            System.out.println("Transfer Unsuccessful");
            System.out.println("Transfer successful amount: " + amount);
            System.out.println("Transfer successful destination: " + destination.balance);
            System.out.println("Remaining Balance: " + balance);

        }

    }
    public double getBalance() {
        return balance;
    }
    public void displayAccountDetails(){
        System.out.println("Account Number: " + accountNumber
                + ", Balance: " + balance
                + ", Customer Name: " + customer.getCustomerName());
    }
}
