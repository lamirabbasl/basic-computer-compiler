export function test() {
  test(`42`, {
    type: "pro",
    body: {
      type: "NumericLiteral",
      value: 42,
    },
  });

  test(`"hello"`, {
    type: "pro",
    body: {
      type: "Stringliteral",
      value: "hello",
    },
  });

  test(`'hello'`, {
    type: "pro",
    body: {
      type: "Stringliteral",
      value: "hello",
    },
  });
}
