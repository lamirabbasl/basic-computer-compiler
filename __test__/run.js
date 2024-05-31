import { Parser } from "../src/parser.js";

const parser = new Parser();

const program = ` //number 
  42
  "hello"
  'hello'
  `;
const ast = parser.parse(program);
console.log(isNaN(program[0]));
console.log(JSON.stringify(ast, null, 2));
