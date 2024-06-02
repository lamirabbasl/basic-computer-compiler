import { Tokenizer } from "./tokenizer.js";

export class Parser {
  constructor() {
    this._string = "";
    this._tokenizer = new Tokenizer();
  }

  parse(string) {
    this._string = string;
    this._tokenizer.initial(string);
    this._lookahead = this._tokenizer.getNextToken();
    return this.program();
  }

  program() {
    return {
      type: "pro",
      body: this.StatementList(),
    };
  }

  StatementList(stopLookahead) {
    const statementList = [this.Statement()];
    while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement());
    }

    return statementList;
  }

  Statement() {
    switch (this._lookahead.type) {
      case "{":
        return this.BlockStatement();
      case ";":
        return this.EmptyStatement();
      case "int":
        return this.VariableStatement();
      case "if":
        return this.IfStatement();
      case "while":
      case "do":
      case "for":
        return this.IterationStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  IterationStatement() {
    switch (this._lookahead.type) {
      case "while":
        return this.WhileStatement();
      case "do":
        return this.DoWhileStatement();
      case "for":
        return this.ForStatement();
    }
  }

  WhileStatement() {
    this._eat("while");
    this._eat("(");
    const test = this.Expression();
    this._eat(")");
    this._eat("{");
    const consequent = this.Statement();
    this._eat("}");
    return {
      type: "WhileStatement",
      test,
      consequent,
    };
  }

  DoWhileStatement() {
    this._eat("do");
    this._eat("{");
    const body = this.Statement();
    this._eat("}");
    this._eat("while");
    this._eat("(");
    const test = this.Expression();
    this._eat(")");

    return {
      type: "DoWhileStatement",
      body,
      test,
    };
  }

  ForStatement() {
    this._eat("for");
    this._eat("(");
    const inital =
      this._lookahead.type !== ";" ? this.ForStatementInitial() : null;
    this._eat(";");

    const test = this._lookahead.type !== ";" ? this.Expression() : null;
    this._eat(";");
    const update = this._lookahead.type !== ";" ? this.Expression() : null;
    this._eat(")");
    this._eat("{");
    const body = this.Statement();
    this._eat("}");
    return {
      type: "ForStatement",
      inital,
      test,
      update,
      body,
    };
  }

  ForStatementInitial() {
    if (this._lookahead.type === "int") {
      return this.VariableStatementInitial();
    }
    return this.Expression();
  }

  IfStatement() {
    this._eat("if");
    this._eat("(");
    const test = this.Expression();
    this._eat(")");
    this._eat("{");
    const consequent = this.Statement();
    this._eat("}");
    let alternate;
    if (this._lookahead != null && this._lookahead.type === "else") {
      this._eat("else");
      this._eat("{");
      alternate = this.Statement();
      this._eat("}");
    } else {
      alternate = null;
    }

    return {
      type: "IfStatement",
      test,
      consequent,
      alternate,
    };
  }

  VariableStatementInitial() {
    this._eat("int");
    const declarations = this.VariableDeclarationList();
    return {
      type: "VariableStatement",
      declarations,
    };
  }

  VariableStatement() {
    const varibalestatement = this.VariableStatementInitial();
    this._eat(";");
    return varibalestatement;
  }

  VariableDeclarationList() {
    const declarations = [];
    do {
      declarations.push(this.VariableDeclaration());
    } while (this._lookahead.type === "," && this._eat(","));
    return declarations;
  }

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

  VariableDeclaratializer() {
    this._eat("Simple_Assignment");
    return this.AssignmentExpression();
  }

  EmptyStatement() {
    this._eat(";");
    return {
      type: "Emptystatement",
    };
  }

  BlockStatement() {
    this._eat("{");
    const body = this._lookahead != "}" ? this.StatementList("}") : [];
    this._eat("}");
    return {
      type: "BlockStatement",
      body,
    };
  }

  ExpressionStatement() {
    const expression = this.Expression();
    this._eat(";");
    return {
      type: "ExpressionStatement",
      expression,
    };
  }

  Expression() {
    return this.AssignmentExpression();
  }

  AssignmentExpression() {
    const left = this.LogicalORExpression();
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

  RelationalExpression() {
    return this._BinaryExpression("AdditiveExpression", "Relational_Operator");
  }

  Identifier() {
    const name = this._eat("IDENTIFIER").value;
    return {
      type: "Identifier",
      name,
    };
  }

  _checkValidAddignmentTarget(node) {
    if (node.type === "Identifier") {
      return node;
    }
    throw new SyntaxError("Invalid left hand side in assignment expression");
  }

  _isAssignmentOperator(tokenType) {
    return (
      tokenType === "Simple_Assignment" || tokenType === "Complex_Assignment"
    );
  }

  AssignmentOperator() {
    if (this._lookahead.type === "Simple_Assignment") {
      return this._eat("Simple_Assignment");
    }
    return this._eat("Complex_Assignment");
  }

  LogicalANDExpression() {
    return this._LogicalExpression("EqualityExpression", "Logical_AND");
  }

  LogicalORExpression() {
    return this._LogicalExpression("LogicalANDExpression", "Logical_OR");
  }

  _LogicalExpression(builderName, operatorToken) {
    let left = this[builderName]();
    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;
      const right = this[builderName]();
      left = {
        type: "LogicalExpression",
        operator,
        left,
        right,
      };
    }
    return left;
  }

  EqualityExpression() {
    return this._BinaryExpression("RelationalExpression", "Equality_Operator");
  }

  AdditiveExpression() {
    return this._BinaryExpression("MultExpression", "Additive_Operator");
  }

  MultExpression() {
    return this._BinaryExpression("UnaryExpression", "Mult_Operator");
  }

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

  UnaryExpression() {
    let operator;
    switch (this._lookahead.type) {
      case "Additive_Operator":
        operator = this._eat("Additive_Operator").value;
        break;
      case "Logical_NOT":
        operator = this._eat("Logical_NOT").value;
        break;
    }

    if (operator != null) {
      return {
        type: "UnaryExpression",
        operator,
        arguments: this.UnaryExpression(),
      };
    }
    return this.LeftHandSideExpression();
  }

  LeftHandSideExpression() {
    return this.PrimaryExpression();
  }

  PrimaryExpression() {
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal();
    }
    switch (this._lookahead.type) {
      case "(":
        return this.ParenthesExpression();
      case "IDENTIFIER":
        return this.Identifier();
      default:
        return this.LeftHandSideExpression();
    }
  }

  _isLiteral(tokenType) {
    return (
      tokenType === "NUMBER" ||
      tokenType === "STRING" ||
      tokenType === "true" ||
      tokenType === "flase" ||
      tokenType === "null"
    );
  }

  ParenthesExpression() {
    this._eat("(");
    const expression = this.Expression();
    this._eat(")");
    return expression;
  }

  Literal() {
    switch (this._lookahead.type) {
      case "NUMBER":
        return this.NumericLiteral();
      case "STRING":
        return this.StringLiteral();
      case "true":
        return this.BooleanLiteral(true);
      case "false":
        return this.BooleanLiteral(false);
      case "null":
        return this.NullLiteral();
    }
    throw new SyntaxError(`Literal : unexpected literal production`);
  }

  BooleanLiteral(value) {
    this._eat(value ? "true" : "false");
    return {
      type: "BooleanLiteral",
      value,
    };
  }

  NullLiteral() {
    this._eat("null");
    return {
      type: "BooleanLiteral",
      value: null,
    };
  }

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
