const stubs = {};

stubs.cpp = `#include <iostream>
#include <stdio.h>

using namespace std;

int main() {
  cout<<"Hello world!\\n";
  return 0;
}
`;

stubs.py = `print("Hello world!")`;

stubs.java = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");
    }
}`;

export default stubs;
