export function literals(string: string, literals: string[]) {
  return literals.reduce((accumulator, literal, index) => {
    return accumulator.replace(`%s${index + 1}`, literal);
  }, string);
}
