import { Tokenizer } from "./tokenizer.js";

export class Parser {
  constructor() {
    this._string = "";
    this._tokenizer = new Tokenizer();
  }

  // parse the given string
  parse(string) {
    this._string = string;
    this._tokenizer.initial(string);
    this._lookahead = this._tokenizer.getNextToken();
    return this.program();
  }

  /**
main entrypoint 

    programs:
        NumbericLiteral

*/
  program() {
    return {
      type: "pro",
      body: this.Literal(),
    };
  }

  /**
   * Literals :
   *     NumericLiteral
   *     Stringliteral
   */

  Literal() {
    switch (this._lookahead.type) {
      case "NUMBER":
        return this.NumericLiteral();
      case "STRING":
        return this.StringLiteral();
    }
    throw new SyntaxError(`Literal : unexpected literal production`);
  }

  //numeric token
  NumericLiteral() {
    const token = this._eat("NUMBER");
    return {
      type: "NumericLiteral",
      value: Number(token.value),
    };
  }

  StringLiteral() {
    const token = this._eat("STRING");
    return {
      type: "StringLiteral",
      value: token.value.slice(1, -1),
    };
  }

  //expects a token of given token
  _eat(tokenType) {
    const token = this._lookahead;
    if (token == null) {
      throw new SyntaxError(
        `unexpected end of input , expected : ${tokenType}`
      );
    }
    if (token.type !== tokenType) {
      throw new SyntaxError(
        `unexpected token ${token.value} , expected : ${tokenType}`
      );
    }

    this._lookahead = this._tokenizer.getNextToken();

    return token;
  }
}
