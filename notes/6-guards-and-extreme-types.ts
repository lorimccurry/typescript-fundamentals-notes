import { HasEmail } from "./1-basics";

//== TOP TYPES ==//

/**
 * (1) "Top types" are types that can hold any value. Typescript has two of them
 */

let myAny: any = 32;
let myUnknown: unknown = "hello, unknown";

// Note that we can do whatever we want with an any, but nothing with an unknown

myAny.foo.bar.baz;
myUnknown.foo;

/**
 * (2) When to use `any`
 * Anys are good for areas of our programs where we want maximum flexibility
 * Example: sometimes a Promise<any> is fine when we don't care at all about the resolved value
 */
async function logWhenResolved(p: Promise<any>) {
  const val = await p;
  console.log("Resolved to: ", val);
}

/**
 * (3) When to use `unknown`
 * Unknowns are good for "private" values that we don't want to expose through a public API.
 * They can still hold any value, we just must narrow the type before we're able to use it.
 *
 * We'll do htis with a type guard.
 */

myUnknown.split(", "); // 🚨 ERROR

/**
 * (4) Built-in type guards
 */
if (typeof myUnknown === "string") {
  // in here, myUnknown is of type string
  myUnknown.split(", "); // ✅ OK
}
if (myUnknown instanceof Promise) {
  // in here, myUnknown is of type Promise<any>
  myUnknown.then(x => console.log(x));
}

/**
 * (5) User-defined type guards
 * We can also create our own type guards, using functions that return booleans
 */

// 💡 Note return type
// we are saying the return will return a boolean
// AND that boolean will say to the TS compiler if `x` is of type HasEmail
// then see its usage below
function isHasEmail(x: any): x is HasEmail {
  return typeof x.name === "string" && typeof x.email === "string";
}

if (isHasEmail(myUnknown)) {
  // In here, myUnknown is of type HasEmail
  console.log(myUnknown.name, myUnknown.email);
}

// my most common guard
// see how this builds on the above logic of the return type being not only a boolean
// but also a true would be the type of the generic passed in
// ie: T !== "undefined" ? T : false;
function isDefined<T>(arg: T | undefined): arg is T {
  return typeof arg !== "undefined";
}
// example usage:
const list = ['a', 'b', 'c', undefined, 'd'];
const filtered = list.filter(isDefined);

// NEW TS 3.7: assertion-based type guards!
function assertIsStringArray(arr: any[]): asserts arr is string[] {
  if (!arr) throw new Error('not an array!');
  const strings = arr.filter(i => typeof i === 'string');
  if (strings.length !== arr.length) throw new Error('not an array of strings');
}

// correct case. comment it out to see false case.
// const arr: (string|number)[] = ['3', 12, '21'];

// uncomment the below and see the compiler highlighting the non-number vals
// asserts picks up on the error as a false case
const arr: (number)[] = ['3', 12, '21'];

assertIsStringArray(arr);
arr;

/**
 * (6) Dealing with multiple unknowns
 * -   We kind of lose some of the benefits of structural typing when using `unknown`.
 * -   Look how we can get mixed up below
 */

let aa: unknown = 41;
let bb: unknown = ["a", "string", "array"];
// can set any unknown value to another...ewww
bb = aa; // 🚨 yikes

/**
 * (7) Alternative to unknowns - branded types
 * -   One thing we can do to avoid this is to create types with structures that
 * -   are difficult to accidentally match. This involves unsafe casting, but it's ok
 * -   if we do things carefully
 */

/* two branded types, each with "brand" and "unbrand" functions */
interface BrandedA {
  __this_is_branded_with_a: "a";
}
function brandA(value: string): BrandedA {
  // notice how we have to transition this to an unknown (top type)
  // before we can make it a BrandedA
  return (value as unknown) as BrandedA;
}
function unbrandA(value: BrandedA): string {
  // same here...unknown first so compiler wont yell at you about
  // value and BrandedA not having any similarity/overlap to one another
  return (value as unknown) as string;
}

interface BrandedB {
  __this_is_branded_with_b: "b";
}
function brandB(value: { abc: string }): BrandedB {
  return (value as unknown) as BrandedB;
}
function unbrandB(value: BrandedB): { abc: string } {
  return (value as unknown) as { abc: string };
}

let secretA = brandA("This is a secret value");
let secretB = brandB({ abc: "This is a different secret value" });

secretA = secretB; // ✅ No chance of getting these mixed up
unbrandB(secretA);
unbrandA(secretB);

// Mike uses branding/unbranding in instances when he needs ultimate control over the values
// being returned, like in generating an `id`. He'd make branding/unbranding very controlled and
// private only happening in 1 place. We are discouraing devs from touching private parts of our
// library code to know we can trust our code for a clean release and not break other people depending
// on it.
// Using the type system as a way to hide the nature of the true value so we can work on it and keep
// other devs from trying to poke at it.

// We aren't doing this with private vars b/c that would require creating an instance of a class to get private.
// The class would then have to expose a way to get that private value out.

// back to our original values
let revealedA = unbrandA(secretA);
let revealedB = unbrandB(secretB);

// 💡 PROTIP - always brand/unbrand casting in exactly one place.
// would want to do branding/unbranding in same JS module

//== BOTTOM TYPE: never ==//

/**
 * (8) Bottom types can hold no values. TypeScript has one of these: `never`
 */
let n: never = 4;

/**
 * A common place where you'll end up with a never
 * is through narrowing exhaustively
 */

// casting so the compiler wont initialize as a string
let x = "abc" as string | number;

if (typeof x === "string") {
  // x is a string here
  x.split(", ");
} else if (typeof x === "number") {
  // x is a number here
  x.toFixed(2);
} else {
  // x is a never here
  // if you've done your type checking correctly, you should
  // not be able to get here.

  // you will not ever create a `never` type, but this would be
  // a way you would encounter it.
}

/**
 * (9) We can use this to our advantage to create exhaustive conditionals and switches
 */

class UnreachableError extends Error {
  constructor(val: never, message: string) {
    super(`TypeScript thought we could never end up here\n${message}`);
  }
}

// initial example
let y = 4 as string | number;

if (typeof y === "string") {
  // y is a string here
  y.split(", ");
} else if (typeof y === "number") {
  // y is a number here
  y.toFixed(2);
} else {
  throw new UnreachableError(y, "y should be a string or number");
}

// next iteration
let z = 4 as string | number | boolean;

if (typeof z === "string") {
  // z is a string here
  z.split(", ");
} else if (typeof z === "number") {
  // z is a number here
  z.toFixed(2);
} else if(typeof z === "boolean"){
  // this if clause fixes the type error that would come up if you had a
  // boolean type on z, and didn't hande the case
  // if you didn't handle it - ie: getting there by casting, that `never` else case (like a default switch)
  // would land you there and tell you you had an unhandled intersection type

  // typescript is a compile time only language, so you'd hit this by receiving a value of y,
  // if this was a lib, that a user passed in that wasn't handled by a type guard.
  // or if an engineer using your lib wasn't using typescript.
  // this only happens at compile time for a dev that's using ts.
  console.log(z, 'boolean case');
} else {
  throw new UnreachableError(z, "z should be a string or number");
}