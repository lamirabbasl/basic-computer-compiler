import { Parser } from "../src/parser.js";

const parser = new Parser();

const program = ` //number 
  { "34"; 
  x = 34 ;
    (42 +1) * 7 ;
    34 + 3 *9;
  "hello";
  int z = 9 ;

  if(x == true && y){
    int y = 4;
  }else{
    int h = null;
  }

  !h ;
  ++y ;

  while( x>= 8){
    int v = null;
  }
  

  int x = 9;

do{
  y= 8;
}while(x ==9)


for( i= 0 ; i < 8 ; ++i ){
  int x = 7;
}

 
 3 + 3;

}

  `;
const ast = parser.parse(program);
console.log(isNaN(program[0]));
console.log(JSON.stringify(ast, null, 2));
