package in.java;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        // Create customer
        System.out.print("Enter Customer ID: ");
        String id = sc.nextLine();

        System.out.print("Enter Customer Name: ");
        String name = sc.nextLine();

        Customer c1 = new Customer(id, name);

        // Create two accounts
        BankAccount b1 = new BankAccount(10000.0, "A101", c1);
        BankAccount b2 = new BankAccount(5000.0, "A102", c1);

        int choice;

        do {
            System.out.println("\n===== BANK MANAGEMENT SYSTEM =====");
            System.out.println("1. Deposit");
            System.out.println("2. Withdraw");
            System.out.println("3. Transfer Funds");
            System.out.println("4. Check Balance");
            System.out.println("5. Display Account Details");
            System.out.println("6. Exit");
            System.out.print("Enter your choice: ");

            try {
                choice = Integer.parseInt(sc.nextLine());

                switch (choice) {

                    case 1: {
                        BankAccount account = selectAccount(sc, b1, b2);
                        System.out.print("Enter deposit amount: ");
                        double amount = Double.parseDouble(sc.nextLine());

                        account.deposit(amount);
                        System.out.println("Deposit completed.");
                        System.out.println("Current balance: "
                                + account.getBalance());
                        break;
                    }

                    case 2: {
                        BankAccount account = selectAccount(sc, b1, b2);
                        System.out.print("Enter withdrawal amount: ");
                        double amount = Double.parseDouble(sc.nextLine());

                        account.withdraw(amount);
                        System.out.println("Withdrawal completed.");
                        System.out.println("Current balance: "
                                + account.getBalance());
                        break;
                    }

                    case 3: {
                        System.out.println("Select source account:");
                        BankAccount source = selectAccount(sc, b1, b2);

                        System.out.println("Select destination account:");
                        BankAccount destination = selectAccount(sc, b1, b2);

                        System.out.print("Enter transfer amount: ");
                        double amount = Double.parseDouble(sc.nextLine());

                        source.transferFunds(destination, amount);
                        break;
                    }

                    case 4: {
                        BankAccount account = selectAccount(sc, b1, b2);
                        System.out.println("Current balance: "
                                + account.getBalance());
                        break;
                    }

                    case 5: {
                        System.out.println("\n--- Account A101 ---");
                        b1.displayAccountDetails();

                        System.out.println("\n--- Account A102 ---");
                        b2.displayAccountDetails();
                        break;
                    }

                    case 6:
                        System.out.println("Thank you for using our bank!");
                        break;

                    default:
                        System.out.println("Invalid choice. Try again.");
                }

            } catch (NumberFormatException e) {
                System.out.println("Invalid input. Please enter a valid number.");
                choice = 0;

            } catch (IllegalArgumentException e) {
                System.out.println("Operation failed: " + e.getMessage());
                choice = 0;
            }

        } while (choice != 6);

        sc.close();
    }

    private static BankAccount selectAccount(
            Scanner sc, BankAccount b1, BankAccount b2) {

        while (true) {
            System.out.println("1. Account A101");
            System.out.println("2. Account A102");
            System.out.print("Select account: ");

            String input = sc.nextLine();

            if (input.equals("1")) {
                return b1;
            } else if (input.equals("2")) {
                return b2;
            } else {
                System.out.println("Invalid account selection. Try again.");
            }
        }
    }
}
