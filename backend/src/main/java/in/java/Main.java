package in.java;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    static void main() {
        System.out.println("Hello World");
        Customer c1 = new Customer("iuhuifhjeiofvj", "nuifhidujq");
        BankAccount b1 = new BankAccount(7394739.89297, "6347389258905.6787", c1);

        b1.deposite(10010000677777777777.7887734);
        System.out.println(b1.getBalance());
    }
}
