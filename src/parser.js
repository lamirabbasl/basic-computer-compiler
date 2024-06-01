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
        StatementList

*/
  program() {
    return {
      type: "pro",
      body: this.StatementList(),
    };
  }

  /**
* StatementList:
      Statement
      Satementlist [statement]
*/

  StatementList(stopLookahead) {
    const statementList = [this.Statement()];
    while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement());
    }

    return statementList;
  }

  /**
* Statement:
      ExpressionStatement = ;
      BlockStatement = {}
      Emptystatement 
*/

  Statement() {
    switch (this._lookahead.type) {
      case "{":
        return this.BlockStatement();
      case ";":
        return this.EmptyStatement();
      case "int":
        return this.VariableStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  /**
   * varibalestatement
   */

  VariableStatement() {
    this._eat("int");
    const declarations = this.VariableDeclarationList();
    this._eat(";");
    return {
      type: "VaribleDeclaration",
      declarations,
    };
  }

  /**
   * VariableDeclarationList
   */
  VariableDeclarationList() {
    const declarations = [];
    do {
      declarations.push(this.VariableDeclaration());
    } while (this._lookahead.type === "," && this._eat(","));
    return declarations;
  }

  /**
   * VariableDeclaration
   */

  VariableDeclaration() {
    const id = this.Identifier();
    const initial =
      this._lookahead !== ";" && this._lookahead.type !== ","
        ? this.VariableDeclaratializer()
        : null;

    return {
      type: "VariableDeclration ",
      id,
      initial,
    };
  }

  /**
   * VariableDeclaratializer
   */

  VariableDeclaratializer() {
    this._eat("Simple_Assignment");
    return this.AssignmentExpression();
  }

  /**
   * Emptystatement
   */
  EmptyStatement() {
    this._eat(";");
    return {
      type: "Emptystatement",
    };
  }

  /**
   * BlockStatement:
   *    {StateList}
   */

  BlockStatement() {
    this._eat("{");
    const body = this._lookahead != "}" ? this.StatementList("}") : [];
    this._eat("}");
    return {
      type: "BlockStatement",
      body,
    };
  }

  /**
   * ExpressionStatement:
   *
   */

  ExpressionStatement() {
    const expression = this.Expression();
    this._eat(";");
    return {
      type: "ExpressionStatement",
      expression,
    };
  }

  /**
   * Expression:
   *    Literal
   */

  Expression() {
    return this.AssignmentExpression();
  }

  /**
   * AssignmentExpression
   */
  AssignmentExpression() {
    const left = this.AdditiveExpression();
    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left;
    }
    return {
      type: "AssignmentExpression",
      operator: this.AssignmentOperator().value,
      left: this._checkValidAddignmentTarget(left),
      right: this.AssignmentExpression(),
    };
  }

  //LeftHandSideExpression
  //    identifier
  LeftHandSideExpression() {
    return this.Identifier();
  }

  //Identifier
  Identifier() {
    const name = this._eat("IDENTIFIER").value;
    return {
      type: "Identifier",
      name,
    };
  }

  //checkValidAssignmentTarget
  _checkValidAddignmentTarget(node) {
    if (node.type === "Identifier") {
      return node;
    }
    throw new SyntaxError("Invalid left hand side in assignment expression");
  }

  //isAssignmentOperator
  _isAssignmentOperator(tokenType) {
    return (
      tokenType === "Simple_Assignment" || tokenType === "Complex_Assignment"
    );
  }

  //AssignmentOperator
  AssignmentOperator() {
    if (this._lookahead.type === "Simple_Assignment") {
      return this._eat("Simple_Assignment");
    }
    return this._eat("Complex_Assignment");
  }

  /**
   * AdditiveExpression:
   *  MultExpression
   * AddtiveExpression Additiveoprator Literal
   */

  AdditiveExpression() {
    return this._BinaryExpression("MultExpression", "Additive_Operator");
  }

  /**
   * MulExpression:
   *  PrimaryExpression
   * AddtiveExpression Additiveoprator Literal
   */

  MultExpression() {
    return this._BinaryExpression("PrimaryExpression", "Mult_Operator");
  }

  /**
   * Generic BinaryExpression
   */

  _BinaryExpression(builderName, operatorToken) {
    let left = this[builderName]();
    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;
      const right = this[builderName]();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }
    return left;
  }

  /**
   * PrimaryExpression
   *    Literal
   *    ParenthesExpression
   *    LeftHandSideExpression
   */
  PrimaryExpression() {
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal();
    }
    switch (this._lookahead.type) {
      case "(":
        return this.ParenthesExpression();
      default:
        return this.LeftHandSideExpression();
    }
  }

  _isLiteral(tokenType) {
    return tokenType === "NUMBER" || tokenType === "STRING";
  }

  /**
   * ParenthesExpression
   */

  ParenthesExpression() {
    this._eat("(");
    const expression = this.Expression();
    this._eat(")");
    return expression;
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
