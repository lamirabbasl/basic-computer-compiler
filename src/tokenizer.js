const Spec = [
  // whitespace
  [/^\s+/, null],

  //comments
  [/^\/\/.*/, null],

  // symbols
  [/^;/, ";"],
  [/^\{/, "{"],
  [/^\}/, "}"],
  [/^\(/, "("],
  [/^\)/, ")"],
  [/^,/, ","],

  //keywords
  [/^\bint\b/, "int"],
  [/^\bif\b/, "if"],
  [/^\belse\b/, "else"],
  [/^\btrue\b/, "true"],
  [/^\bfalse\b/, "false"],
  [/^\bnull\b/, "null"],
  [/^\bwhile\b/, "while"],
  [/^\bdo\b/, "do"],
  [/^\bfor\b/, "for"],

  // number
  [/^\d+/, "NUMBER"],

  //identifier
  [/^\w+/, "IDENTIFIER"],

  //equality operator
  [/^[=!]=/, "Equality_Operator"],

  //assignment operators
  [/^=/, "Simple_Assignment"], // =
  [/^[\*\/\+\-]=/, "Complex_Assignment"],

  //operators
  [/^[+\-]/, "Additive_Operator"],
  [/^[*\/]/, "Mult_Operator"],

  //relational operators
  [/^[><]=?/, "Relational_Operator"],

  //logical operator
  [/^&&/, "Logical_AND"],
  [/^\|\|/, "Logical_OR"],
  [/^!/, "Logical_NOT"],

  // string
  [/^"[^"]*"/, "STRING"],
  [/^'[^']*'/, "STRING"],
];

export class Tokenizer {
  initial(string) {
    this._string = string;
    this._cursor = 0;
  }

  // Check if the file has ended
  isEOF() {
    return this._cursor === this._string.length;
  }

  // Check if there are more tokens
  hasMoreTokens() {
    return this._cursor < this._string.length;
  }

  // Obtain next token
  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }

    const string = this._string.slice(this._cursor);

    for (const [regexp, tokenType] of Spec) {
      const tokenValue = this._match(regexp, string);
      if (tokenValue == null) {
        continue;
      }

      // Skip whitespace
      if (tokenType == null) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue,
      };
    }

    throw new SyntaxError(`Unexpected token: ${string[0]}`);
  }

  _match(regexp, string) {
    let matched = regexp.exec(string);
    if (matched == null) {
      return null;
    }
    this._cursor += matched[0].length;
    return matched[0];
  }
}
