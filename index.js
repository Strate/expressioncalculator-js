// const value = process.argv[2];

const value = '1 + 2 * (1 - 2) / 0.3';
console.log("calculating", value);
console.log("Result is", calc(value));

/*
<Expr> ::= <Val> {<Op1> <Val>}
<Val> ::= <Arg> {<Op2> <Arg>}
<Arg> ::= <UnaryOp><Arg> | <Number> | '('<Expr>')'
<Op2> ::= '*' | '/'
<Op1> ::= '+' | '-'
<Number> ::= <Digit> {<Digit>}
<Digit> ::= '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
 */

function safeCalc(value) {
  try {
    return calc(value)
  } catch (e) {
    return e.message;
  }
}

function calc(value) {
  let i = 0;
  const len = value.length;

  const skipSpaces = () => {
    while (i < len && value[i].match(/\s/)) {
      i++;
    }
  };
  const getCurrentToken = () => {
    skipSpaces();
    let current = value[i];
    if (i < len && current.match(/\d/)) {
      let buf = current;
      while (i + 1 < len && value[i+1].match(/\d/)) {
        i++;
        buf += value[i];
      }
      if (value[i+1] === '.') {
        i++;
        buf += value[i];
        while (i + 1 < len && value[i+1].match(/\d/)) {
          i++;
          buf += value[i];
        }
      }
      return {
        type: "number",
        value: parseFloat(buf)
      }
    } else if (i < len && current.match(/[-+*/]/)) {
      return {
        type: "operator",
        value: current
      }
    } else if (current === "(") {
      return {
        type: "leftParenthesis"
      }
    } else if (current === ")") {
      return {
        type: "rightParenthesis"
      }
    } else if (i < len) {
      throw new Error("Unexpected token at position " + i + ": " + current);
    }
  };
  const getNextToken = () => {
    let token = getCurrentToken();
    i++;
    return token;
  };
  const invalidToken = (token, expected) => {throw new Error("Invalid token " + (token && token.value) + ", expected: " + expected)};

  const expr = () => {
    let res = val();
    let op1 = getCurrentToken();
    while (op1 && op1.type === "operator" && (op1.value === '+' || op1.value === '-')) {
      i++;
      const v2 = val();
      if (op1.value === "+") {
        res = res + v2;
      } else {
        res = res - v2;
      }
      op1 = getCurrentToken();
    }
    return res;
  };

  const val = () => {
    let res = arg();
    let op2 = getCurrentToken();
    while (op2 && op2.type === "operator" && (op2.value === "*" || op2.value === "/")) {
      i++;
      const arg2 = arg();
      if (op2.value === "*") {
        res = res * arg2;
      } else {
        res = res / arg2;
      }
      op2 = getCurrentToken();
    }
    return res;
  };

  const arg = () => {
    let result;
    const token = getNextToken();
    if (token && token.type === "operator" && (token.value === "-" || token.value === "+")) {
      result = arg();
      if (token.value === "-") {
        result = -result;
      }
    } else if (token && token.type === "number") {
      result = token.value;
    } else if (token && token.type === "leftParenthesis") {
      result = expr();
      let closeParenthesis = getNextToken();
      if (!closeParenthesis || closeParenthesis.type !== "rightParenthesis") {
        invalidToken(closeParenthesis, ")");
      }
    } else {
      invalidToken(token, "number");
    }
    return result;
  };

  let res = expr();
  skipSpaces();
  if (i < len) {
    throw new Error("Invalid token: " + value[i] + " at " + i);
  }
  return res;
}

