import { HasPhoneNumber, HasEmail } from "./1-basics";

// == CLASSES == //

/**
 * (1) Classes work similarly to what you're used to seeing in JS
 * -   They can "implement" interfaces
 */

export class Contact implements HasEmail {
  email: string;
  name: string;
  constructor(name: string, email: string) {
    this.email = email;
    this.name = name;
  }
}

/**
 * (2) This looks a little verbose -- we have to specify the words "name" and "email" 3x.
 * -   Typescript has a shortcut: PARAMETER PROPERTIES
 */

/**
 * (3) Access modifier keywords - "who can access this thing"
 *
 * - public - everyone
 * - protected - me and subclasses
 * - private - only me
 */

// by adding access modifier keywords to the constructor params, you do the
// same thing as above on ln 10, w/o all the multiple type declarations
class ParamPropContact implements HasEmail {
  constructor(public name: string, public email: string = "no email") {
    // nothing needed
  }
}
const x = new ParamPropContact('a', 'b');
// do `x.` and hover and see that intellesense lets you use name or email
// change email to `protected`
// see you get an error with HasEmail b/c email is now not able to be seen/used everywhere so it isn't a HasEmail
// then do `x.` and hover and you'll see that you only have name as an intellesense option

/**
 * (4) Class fields can have initializers (defaults)
 */
class OtherContact implements HasEmail, HasPhoneNumber {
  protected age: number = 0;
  // `!` is the definite assignment operator: ie - trust me TS, i will make sure this gets initialized properly and don't cause an error here
  // private password!: string;
  private passwordVal: string | undefined;
  constructor(public name: string, public email: string, public phone: number) {
    // () password must either be initialized like this, or have a default value
    // this.password = Math.round(Math.random() * 1e14).toString(32);
  }

  // a trick for lazy loading / lazily instantiating a value that may start out undefined:
  get password(): string {
    if (!this.passwordVal) {
      this.passwordVal = Math.round(Math.random() * 1e14).toString(32);
    }
    return this.passwordVal;
  }
}

// one other access modifier is `readonly` - this is only for linting purposes and does NOT prevent consumers of the lib from coming in and modifying the value. it's a prompt. mike uses them occasionally, but not as a guard.

/**
 * (5) TypeScript even allows for abstract classes, which have a partial implementation
 * they serve as base classes and can't be instantiated directly w/ a new keyword
 * think of it as 1/2 class, 1/2 interface
 */

abstract class AbstractContact implements HasEmail, HasPhoneNumber {
  public abstract phone: number; // must be implemented by non-abstract subclasses

  constructor(
    public name: string,
    public email: string // must be public to satisfy HasEmail
  ) {}

  abstract sendEmail(): void; // must be implemented by non-abstract subclasses
}

/**
 * (6) implementors must "fill in" any abstract methods or properties
 */
class ConcreteContact extends AbstractContact {
  constructor(
    public phone: number, // must happen before non property-parameter arguments
    name: string,
    email: string
  ) {
    super(name, email);
  }

  // if you were to comment out this function, TS would yell at you about having the required sendEmail abstract method required by base abstract class
  sendEmail() {
    // mandatory!
    console.log("sending an email");
  }
}
