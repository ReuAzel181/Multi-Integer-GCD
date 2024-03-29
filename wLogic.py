def gcd(*args):
    result = args[0]
    for num in args[1:]:
        while num:
            result, num = num, result % num
    return result

def ThreeOrMoreGCD():
    try:
        n = int(input("\nEnter integers count: "))
        print("")
        if n < 3:
            raise ValueError("At least three integers!")
        
        numbers = []
        for i in range(n):
            num = int(input(f"Integer {i + 1}: "))
            if num <= 0:
                raise ValueError("Invalid integer entered.")
            numbers.append(num)

        result = gcd(*numbers)
        print(f" \nThe GCD of the {n} numbers is: {result}\n")

    except ValueError as e:
        print(f"Error: {e}")

ThreeOrMoreGCD()
