import * as path from "path";
// getting everything from the ts module
import * as ts from "typescript";

function isDefined<T>(x: T | undefined): x is T {
  return typeof x !== "undefined";
}

// (1) Create the program
const program = ts.createProgram({
  options: {
    target: ts.ScriptTarget.ESNext
  },
  rootNames: [
    // path to ../examples/hello-ts/src/index.ts
    path.join(__dirname, "..", "examples", "hello-ts", "src", "index.ts")
  ]
});

// (2) Get the non-declaration (.d.ts) source files (.ts)
const nonDeclFiles = program
  .getSourceFiles()
  // only get the .ts files and not the d.ts files!
  // if this works, then you should only get 1 source file...everything else is d.ts!
  .filter(sf => !sf.isDeclarationFile);

// for fun, can uncomment this and see what all the files ts gives you
// will need to run the code to see what's being logged
// const files = program.getSourceFiles();
// console.log(files.map(f => `FILE: ${f.fileName}`));

// (3) get the type-checker
const checker = program.getTypeChecker();
// TypeChecker (part of the compile): in the compile, takes the AST and all the
// types and interfaces you create and it binds them together and identifies what
// is going to actually type check, what is going to work / make sure everything
// is type equivalent.
// AST -> in memory representation of your code (fns, arguments, etc..)

/**
 * (4) use the type checker to obtain the
 * -   appropriate ts.Symbol for each SourceFile
 * -   a symbol can have a value, type, namespace
 * -   a symbol can be imported or exported
 */
const sfSymbols = nonDeclFiles
  .map(f => checker.getSymbolAtLocation(f))
  .filter(isDefined); // here's the type guard to filter out undefined

// (5) for each SourceFile Symbol
sfSymbols.forEach(sfSymbol => {
  const { exports: fileExports } = sfSymbol;
  console.log(sfSymbol.name);
  if (fileExports) {
    // - if there are exports
    console.log("== Exports ==");
    fileExports.forEach((value, key) => {
      // - for each export
      console.log(
        key, // - log its name

        // - and its type (stringified)
        checker.typeToString(checker.getTypeAtLocation(value.valueDeclaration))
      );
      const jsDocTags = value.getJsDocTags();
      if (jsDocTags.length > 0) {
        // - if there are JSDoc comment tags
        console.log(
          // - log them out as key-value pairs
          jsDocTags.map(tag => `\t${tag.name}: ${tag.text}`).join("\n")
        );
      }
    });
  }
});
