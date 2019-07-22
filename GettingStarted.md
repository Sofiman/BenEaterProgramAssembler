# How to create a program ? (for Bean Eater's 8-bit computer)
*I am Sorry for my bad english and if some sentences are not correct or not understandable, I haven't a English origin. If some informations are wrong (like instructions descriptions) I'll accept any recitification and I would love code changes (like features) or optimizations !*

## Requirements
You can only use the set of instructions available in Bean Eater's computer but you can also change it by using the option `--dict={p}` or `-d={p}` where {p} is a path to the dictionnary JSON file. The format is simple, the root element must be an object with an object at the key "instructions", in this object, each keys represent and instruction and the value is the opcode (binary and hex values only). If you want to upgrade the memory size (default is 16 bytes) you can add an element with key "memory_size" to the json where the value represents the number of bytes of your memory.

Default instructions are: 
* `NOP` (0b0000): No operation
* `LDA` (0b0001): Load a value in the A register
* `ADD` (0b0010): Adds the A and B register into the A register
* `SUB` (0b0011): Substracts the B register from the A register into the A register
* `STA` (0b0100): Stores the value of the A register into the ram (at a free address, in the code, in a variable)
* `LDI` (0b0101): Load Immadiate a value from the RAM
* `JMP` (0b0110): Jumps to a defined address in the program
* `JC`  (0b0111): Jumps (look for `JMP`) but only if the carry bit is set of the last operation
* `JZ`  (0b1000): Jumps (look for `JMP`) but ponly is the last result of an operation is zero
* `OUT` (0b1110): Outputs the value of the output register
* `HLT` (0b1111): Halts the computer's clock (stops the program)

## Syntax

The input file must have the same number of line as the your memory size (defined earlier)
Each line is a different statements, you can write an instruction or define a variable, the Syntax is similar:

### Statements
Each line is a new statement, each parts the statement is sperated by a comma; The first part must be the instruction (all defined in the dictionnary: defined above) the second part is the argument, mostly an address to a different statement or a variable, with variables you can use "@{n}" where {n} is the variable name, it will automatically redirects to variable's address but with some instructions you don't need an argument (No test are executed so be aware if some ones needs argument).

__Examples__:
```
LDA,@X
```
In this example we create a statement with the instruction "LDA": Loads the content of the Address of variable X into the A register.

```
LDA,@X
ADD,@Y
OUT
HLT
```
This example is a valid program, his task is to add together content of the A and B register and output it. But giving this to the assembler could not pass, you need...

### Variables!
You use variables anywhere in your code. Variables can contains a (4 bit, according to Ben Eater's default RAM configuration) integer. In your statement it will be replaced by the address of the variabel definition.
The definition of a variable take one byte (the value), so one line of your program, you can name it for more readable code, it starts with `:{n}` where {n} is the name of your variable, it can contain an 8-bit integer (according to Ben Eater's default RAM configuration) add `,{i}` where i is the integer (binary and hex values allowed with prefixes).

__Examples__:
Above, we loaded variable X and add it to Y, but we didn't defined them... The way to do it:
```
:X,10
:Y,2
```
Here we defined variables X and Y and set them to 10 and 2, If we put all together:
```
LDA,@X
ADD,@Y
OUT
HLT
:X,10
:Y,2
```

### Extra
If you want to program your computer by your well-compiled algorithm, you can set the Steps option with `--steps` or `-S`. It will output a step-by-step small "tutorial" to program each entry (address) of your memory with colors to seperate numbers. Yellow numbers are memory address, Blue one are the instruction ID (opcode) and Greens are addresses of variables or memory offset (like used in the Jump instruction).

By default when you compile a program, the output doesn't show wich line (address) represents which statement in the code but you can shows the equivalents by adding the option `--pscode` or `-p`. If you use this tool with an another project, add the option `--format` or `-O` to make the tool only printing machine code easy to parse and a tip if you want to save it to a file (only works with defined terminals and on linux) add `> yourfile` to the command!

Get a look in the provided example file where we have converted a little program from a [Ben Eater's Computer Video](https://www.youtube.com/watch?v=Zg1NdPKoosU) to this format