import { Parser } from "../src/parser.js";

const parser = new Parser();

const program = ` //number 
  { "34"; 
  x = 34 ;
    (42 +1) * 7 ;
    34 + 3 *9;
  "hello";
  int z = 9 ;
}

  `;
const ast = parser.parse(program);
console.log(isNaN(program[0]));
console.log(JSON.stringify(ast, null, 2));
