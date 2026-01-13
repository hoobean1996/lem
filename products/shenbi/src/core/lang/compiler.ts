/**
 * Mini Python Compiler
 *
 * Compiles AST to linear IR instructions.
 */

import type {
  Program,
  Statement,
  Expression,
  ExpressionStatement,
  Assignment,
  AugmentedAssignment,
  IndexedAssignment,
  MemberAssignment,
  IfStatement,
  RepeatStatement,
  WhileStatement,
  ForStatement,
  ForEachStatement,
  BreakStatement,
  ContinueStatement,
  FunctionDef,
  ClassDef,
  ReturnStatement,
  BinaryOp,
  UnaryOp,
  CallExpression,
} from './ast';
import { Instruction, CompiledProgram, IR } from './ir';

export class Compiler {
  private instructions: Instruction[] = [];
  private functions: Map<string, number> = new Map();
  private userFunctions: Map<string, FunctionDef> = new Map();
  private userClasses: Map<string, ClassDef> = new Map();
  // Track loop contexts for break/continue
  private loopContextStack: {
    breakTargets: number[];
    continueTargets: number[];
    continueAddress: number;
  }[] = [];

  compile(program: Program): CompiledProgram {
    this.instructions = [];
    this.functions = new Map();
    this.loopContextStack = [];
    this.userFunctions = new Map();
    this.userClasses = new Map();

    // First pass: collect function and class definitions
    for (const stmt of program.body) {
      if (stmt.type === 'FunctionDef') {
        this.userFunctions.set(stmt.name, stmt);
      } else if (stmt.type === 'ClassDef') {
        this.userClasses.set(stmt.name, stmt);
      }
    }

    // Second pass: emit CLASS_DEF for each class (must happen before main body)
    for (const [className, classDef] of this.userClasses) {
      this.emit(IR.classDef(className, classDef.loc?.line));
    }

    // Third pass: compile main body (skip function and class definitions)
    for (const stmt of program.body) {
      if (stmt.type !== 'FunctionDef' && stmt.type !== 'ClassDef') {
        this.compileStatement(stmt);
      }
    }

    // Add HALT at end of main
    this.emit(IR.halt());

    // Fourth pass: compile function bodies
    for (const [, funcDef] of this.userFunctions) {
      this.compileFunction(funcDef);
    }

    // Fifth pass: compile class method bodies
    for (const [, classDef] of this.userClasses) {
      this.compileClass(classDef);
    }

    // Build source map
    const sourceMap = new Map<number, number>();
    for (let i = 0; i < this.instructions.length; i++) {
      const line = this.instructions[i].sourceLine;
      if (line !== undefined) {
        sourceMap.set(i, line);
      }
    }

    return {
      instructions: this.instructions,
      functions: this.functions,
      sourceMap,
    };
  }

  private emit(inst: Instruction): number {
    const index = this.instructions.length;
    this.instructions.push(inst);
    return index;
  }

  private currentAddress(): number {
    return this.instructions.length;
  }

  private patch(address: number, target: number): void {
    this.instructions[address].arg = target;
  }

  // ============ Statement Compilation ============

  private compileStatement(stmt: Statement): void {
    switch (stmt.type) {
      case 'ExpressionStatement':
        this.compileExpressionStatement(stmt);
        break;
      case 'Assignment':
        this.compileAssignment(stmt);
        break;
      case 'AugmentedAssignment':
        this.compileAugmentedAssignment(stmt);
        break;
      case 'IndexedAssignment':
        this.compileIndexedAssignment(stmt);
        break;
      case 'MemberAssignment':
        this.compileMemberAssignment(stmt);
        break;
      case 'IfStatement':
        this.compileIfStatement(stmt);
        break;
      case 'RepeatStatement':
        this.compileRepeatStatement(stmt);
        break;
      case 'WhileStatement':
        this.compileWhileStatement(stmt);
        break;
      case 'ForStatement':
        this.compileForStatement(stmt);
        break;
      case 'ForEachStatement':
        this.compileForEachStatement(stmt);
        break;
      case 'BreakStatement':
        this.compileBreakStatement(stmt);
        break;
      case 'ContinueStatement':
        this.compileContinueStatement(stmt);
        break;
      case 'PassStatement':
        // Pass compiles to NOP - do nothing
        this.emit(IR.nop(stmt.loc?.line));
        break;
      case 'ReturnStatement':
        this.compileReturnStatement(stmt);
        break;
      case 'FunctionDef':
        // Skip - handled separately
        break;
      case 'ClassDef':
        // Skip - handled separately
        break;
    }
  }

  private compileExpressionStatement(stmt: ExpressionStatement): void {
    this.compileExpression(stmt.expression);
    // Discard result if not used
    this.emit(IR.pop(stmt.loc?.line));
  }

  private compileAssignment(stmt: Assignment): void {
    const line = stmt.loc?.line;
    this.compileExpression(stmt.value);
    this.emit(IR.store(stmt.target, line));
  }

  private compileAugmentedAssignment(stmt: AugmentedAssignment): void {
    const line = stmt.loc?.line;
    // Load current value
    this.emit(IR.load(stmt.target, line));
    // Compile the operand
    this.compileExpression(stmt.value);
    // Apply the operator
    switch (stmt.operator) {
      case '+=':
        this.emit(IR.add(line));
        break;
      case '-=':
        this.emit(IR.sub(line));
        break;
      case '*=':
        this.emit(IR.mul(line));
        break;
      case '/=':
        this.emit(IR.div(line));
        break;
    }
    // Store result back
    this.emit(IR.store(stmt.target, line));
  }

  private compileIndexedAssignment(stmt: IndexedAssignment): void {
    const line = stmt.loc?.line;
    // Push object/array, index, value onto stack
    this.compileExpression(stmt.object);
    this.compileExpression(stmt.index);
    this.compileExpression(stmt.value);
    // Use ARRAY_SET which works for both arrays and objects
    this.emit(IR.arraySet(line));
  }

  private compileMemberAssignment(stmt: MemberAssignment): void {
    const line = stmt.loc?.line;
    // Push object, property name, value onto stack
    this.compileExpression(stmt.object);
    this.emit(IR.push(stmt.property, line));
    this.compileExpression(stmt.value);
    // Use MEMBER_SET
    this.emit(IR.memberSet(line));
  }

  private compileIfStatement(stmt: IfStatement): void {
    const line = stmt.loc?.line;
    const jumpToEndPatches: number[] = [];

    // Compile condition
    this.compileExpression(stmt.condition);

    // Jump to next branch if condition is false
    const jumpToNext = this.emit(IR.jumpIfNot(-1, line));

    // Compile consequent (then branch)
    for (const s of stmt.consequent) {
      this.compileStatement(s);
    }

    // Check if there are elif or else branches
    const hasElif = stmt.elifBranches && stmt.elifBranches.length > 0;
    const hasElse = stmt.alternate && stmt.alternate.length > 0;

    if (hasElif || hasElse) {
      // Jump to end after consequent
      jumpToEndPatches.push(this.emit(IR.jump(-1, line)));
    }

    // Patch jump to next (first elif or else or end)
    this.patch(jumpToNext, this.currentAddress());

    // Compile elif branches
    if (hasElif) {
      for (let i = 0; i < stmt.elifBranches!.length; i++) {
        const elif = stmt.elifBranches![i];
        const elifLine = elif.condition.loc?.line;

        // Compile elif condition
        this.compileExpression(elif.condition);

        // Jump to next elif/else/end if condition is false
        const jumpToNextElif = this.emit(IR.jumpIfNot(-1, elifLine));

        // Compile elif consequent
        for (const s of elif.consequent) {
          this.compileStatement(s);
        }

        // Jump to end after this elif
        const isLast = i === stmt.elifBranches!.length - 1;
        if (!isLast || hasElse) {
          jumpToEndPatches.push(this.emit(IR.jump(-1, elifLine)));
        }

        // Patch jump to next
        this.patch(jumpToNextElif, this.currentAddress());
      }
    }

    // Compile else branch
    if (hasElse) {
      for (const s of stmt.alternate!) {
        this.compileStatement(s);
      }
    }

    // Patch all jumps to end
    const endAddress = this.currentAddress();
    for (const patchAddr of jumpToEndPatches) {
      this.patch(patchAddr, endAddress);
    }
  }

  private compileRepeatStatement(stmt: RepeatStatement): void {
    const line = stmt.loc?.line;

    // Initialize counter: push 0
    this.emit(IR.push(0, line));

    // Loop start: check condition
    const loopStart = this.currentAddress();

    // Push loop context for break/continue
    const loopContext = {
      breakTargets: [] as number[],
      continueTargets: [] as number[],
      continueAddress: -1,
    };
    this.loopContextStack.push(loopContext);

    // Duplicate counter for comparison (keep original for increment)
    this.emit(IR.dup(line));

    // Push limit
    this.compileExpression(stmt.count);

    // Compare: counter >= limit
    this.emit(IR.gte(line));

    // Jump to end if counter >= limit
    const jumpToEnd = this.emit(IR.jumpIf(-1, line));

    // Compile loop body
    for (const s of stmt.body) {
      this.compileStatement(s);
    }

    // Continue target: increment and jump back
    loopContext.continueAddress = this.currentAddress();

    // Patch all continue targets
    for (const continueTarget of loopContext.continueTargets) {
      this.patch(continueTarget, loopContext.continueAddress);
    }

    // Increment counter: counter = counter + 1
    this.emit(IR.push(1, line));
    this.emit(IR.add(line));

    // Jump back to loop start
    this.emit(IR.jump(loopStart, line));

    // End of loop
    this.patch(jumpToEnd, this.currentAddress());

    // Patch all break targets
    const loopEnd = this.currentAddress();
    for (const breakTarget of loopContext.breakTargets) {
      this.patch(breakTarget, loopEnd);
    }

    // Pop loop context
    this.loopContextStack.pop();

    // Pop the counter off the stack
    this.emit(IR.pop(line));
  }

  private compileWhileStatement(stmt: WhileStatement): void {
    const line = stmt.loc?.line;

    // Loop start: check condition
    const loopStart = this.currentAddress();

    // Push loop context for break/continue
    // For while loops, continue goes back to the loop start (condition check)
    const loopContext = {
      breakTargets: [] as number[],
      continueTargets: [] as number[],
      continueAddress: loopStart,
    };
    this.loopContextStack.push(loopContext);

    // Compile condition
    this.compileExpression(stmt.condition);

    // Jump to end if condition is false
    const jumpToEnd = this.emit(IR.jumpIfNot(-1, line));

    // Compile loop body
    for (const s of stmt.body) {
      this.compileStatement(s);
    }

    // Jump back to condition check
    this.emit(IR.jump(loopStart, line));

    // End of loop
    this.patch(jumpToEnd, this.currentAddress());

    // Patch all break targets
    const loopEnd = this.currentAddress();
    for (const breakTarget of loopContext.breakTargets) {
      this.patch(breakTarget, loopEnd);
    }

    // Patch all continue targets (for while loops, continue targets are already known)
    for (const continueTarget of loopContext.continueTargets) {
      this.patch(continueTarget, loopContext.continueAddress);
    }

    // Pop loop context
    this.loopContextStack.pop();
  }

  private compileForStatement(stmt: ForStatement): void {
    const line = stmt.loc?.line;
    const varName = stmt.variable;

    // Initialize loop variable: var = start
    this.compileExpression(stmt.start);
    this.emit(IR.store(varName, line));

    // Store end value in a temp (we'll recompute it each time for simplicity)
    // Loop start
    const loopStart = this.currentAddress();

    // Push loop context for break/continue
    const loopContext = {
      breakTargets: [] as number[],
      continueTargets: [] as number[],
      continueAddress: -1,
    };
    this.loopContextStack.push(loopContext);

    // Check condition: var < end (for positive step)
    this.emit(IR.load(varName, line));
    this.compileExpression(stmt.end);

    // For now, assume positive step (var < end)
    // TODO: handle negative step
    this.emit(IR.lt(line));

    // Jump to end if condition is false
    const jumpToEnd = this.emit(IR.jumpIfNot(-1, line));

    // Compile loop body
    for (const s of stmt.body) {
      this.compileStatement(s);
    }

    // Continue target: increment and jump back
    loopContext.continueAddress = this.currentAddress();

    // Patch all continue targets
    for (const continueTarget of loopContext.continueTargets) {
      this.patch(continueTarget, loopContext.continueAddress);
    }

    // Increment: var = var + step (default step is 1)
    this.emit(IR.load(varName, line));
    if (stmt.step) {
      this.compileExpression(stmt.step);
    } else {
      this.emit(IR.push(1, line));
    }
    this.emit(IR.add(line));
    this.emit(IR.store(varName, line));

    // Jump back to loop start
    this.emit(IR.jump(loopStart, line));

    // End of loop
    this.patch(jumpToEnd, this.currentAddress());

    // Patch all break targets
    const loopEnd = this.currentAddress();
    for (const breakTarget of loopContext.breakTargets) {
      this.patch(breakTarget, loopEnd);
    }

    // Pop loop context
    this.loopContextStack.pop();
  }

  private compileForEachStatement(stmt: ForEachStatement): void {
    const line = stmt.loc?.line;
    const varName = stmt.variable;

    // Generate unique temp variable names for this loop
    const tempIterable = `__foreach_arr_${this.currentAddress()}`;
    const tempLen = `__foreach_len_${this.currentAddress()}`;
    const tempIdx = `__foreach_idx_${this.currentAddress()}`;

    // Evaluate iterable and store in temp
    this.compileExpression(stmt.iterable);
    this.emit(IR.store(tempIterable, line));

    // Get length and store in temp
    this.emit(IR.load(tempIterable, line));
    this.emit(IR.call('len', 1, line));
    this.emit(IR.store(tempLen, line));

    // Initialize index to 0
    this.emit(IR.push(0, line));
    this.emit(IR.store(tempIdx, line));

    // Loop start
    const loopStart = this.currentAddress();

    // Push loop context for break/continue
    const loopContext = {
      breakTargets: [] as number[],
      continueTargets: [] as number[],
      continueAddress: -1,
    };
    this.loopContextStack.push(loopContext);

    // Check condition: idx < len
    this.emit(IR.load(tempIdx, line));
    this.emit(IR.load(tempLen, line));
    this.emit(IR.lt(line));

    // Jump to end if condition is false
    const jumpToEnd = this.emit(IR.jumpIfNot(-1, line));

    // Get current element: arr[idx]
    this.emit(IR.load(tempIterable, line));
    this.emit(IR.load(tempIdx, line));
    this.emit(IR.arrayGet(line));

    // Store in user's variable
    this.emit(IR.store(varName, line));

    // Compile loop body
    for (const s of stmt.body) {
      this.compileStatement(s);
    }

    // Continue target: increment and jump back
    loopContext.continueAddress = this.currentAddress();

    // Patch all continue targets
    for (const continueTarget of loopContext.continueTargets) {
      this.patch(continueTarget, loopContext.continueAddress);
    }

    // Increment: idx = idx + 1
    this.emit(IR.load(tempIdx, line));
    this.emit(IR.push(1, line));
    this.emit(IR.add(line));
    this.emit(IR.store(tempIdx, line));

    // Jump back to loop start
    this.emit(IR.jump(loopStart, line));

    // End of loop
    this.patch(jumpToEnd, this.currentAddress());

    // Patch all break targets
    const loopEnd = this.currentAddress();
    for (const breakTarget of loopContext.breakTargets) {
      this.patch(breakTarget, loopEnd);
    }

    // Pop loop context
    this.loopContextStack.pop();
  }

  private compileBreakStatement(stmt: BreakStatement): void {
    const line = stmt.loc?.line;

    if (this.loopContextStack.length === 0) {
      throw new Error('break 只能在循环内使用');
    }

    // Jump to end of loop (will be patched later)
    const jumpToEnd = this.emit(IR.jump(-1, line));

    // Record this jump for patching
    const loopContext = this.loopContextStack[this.loopContextStack.length - 1];
    loopContext.breakTargets.push(jumpToEnd);
  }

  private compileContinueStatement(stmt: ContinueStatement): void {
    const line = stmt.loc?.line;

    if (this.loopContextStack.length === 0) {
      throw new Error('continue 只能在循环内使用');
    }

    const loopContext = this.loopContextStack[this.loopContextStack.length - 1];

    // If continue address is already known (e.g., while loop), jump directly
    // Otherwise, record for later patching
    if (loopContext.continueAddress !== -1) {
      this.emit(IR.jump(loopContext.continueAddress, line));
    } else {
      // Jump to continue target (will be patched later)
      const jumpAddr = this.emit(IR.jump(-1, line));
      loopContext.continueTargets.push(jumpAddr);
    }
  }

  private compileReturnStatement(stmt: ReturnStatement): void {
    const line = stmt.loc?.line;

    if (stmt.value) {
      this.compileExpression(stmt.value);
    } else {
      this.emit(IR.push(null, line));
    }

    this.emit(IR.return(line));
  }

  private compileFunction(funcDef: FunctionDef): void {
    const line = funcDef.loc?.line;

    // Record function start address
    this.functions.set(funcDef.name, this.currentAddress());

    // Function body
    // Parameters are already on the stack, store them in reverse order
    for (let i = funcDef.params.length - 1; i >= 0; i--) {
      this.emit(IR.store(funcDef.params[i], line));
    }

    // Compile function body
    for (const stmt of funcDef.body) {
      this.compileStatement(stmt);
    }

    // Default return null if no explicit return
    this.emit(IR.push(null, line));
    this.emit(IR.return(line));
  }

  private compileClass(classDef: ClassDef): void {
    const className = classDef.name;

    // CLASS_DEF was already emitted in the second pass
    // Compile each method as a function with qualified name (ClassName.methodName)
    for (const method of classDef.methods) {
      const qualifiedName = `${className}.${method.name}`;
      this.functions.set(qualifiedName, this.currentAddress());

      // Method parameters are already on stack, store in reverse order
      // For methods, 'self' is the first parameter
      for (let i = method.params.length - 1; i >= 0; i--) {
        this.emit(IR.store(method.params[i], method.loc?.line));
      }

      // Compile method body
      for (const stmt of method.body) {
        this.compileStatement(stmt);
      }

      // Default return null if no explicit return
      this.emit(IR.push(null, method.loc?.line));
      this.emit(IR.return(method.loc?.line));
    }
  }

  // ============ Expression Compilation ============

  private compileExpression(expr: Expression): void {
    switch (expr.type) {
      case 'NumberLiteral':
        this.emit(IR.push(expr.value, expr.loc?.line));
        break;

      case 'StringLiteral':
        this.emit(IR.push(expr.value, expr.loc?.line));
        break;

      case 'BooleanLiteral':
        this.emit(IR.push(expr.value, expr.loc?.line));
        break;

      case 'Identifier':
        this.emit(IR.load(expr.name, expr.loc?.line));
        break;

      case 'BinaryOp':
        this.compileBinaryOp(expr);
        break;

      case 'UnaryOp':
        this.compileUnaryOp(expr);
        break;

      case 'CallExpression':
        this.compileCallExpression(expr);
        break;

      case 'ArrayLiteral': {
        // Push all elements onto stack, then create array
        for (const element of expr.elements) {
          this.compileExpression(element);
        }
        this.emit(IR.arrayCreate(expr.elements.length, expr.loc?.line));
        break;
      }

      case 'IndexAccess': {
        // Push array/object, push index, then get element
        this.compileExpression(expr.object);
        this.compileExpression(expr.index);
        this.emit(IR.arrayGet(expr.loc?.line));
        break;
      }

      case 'SliceAccess': {
        // Push object, push start (or null), push end (or null), then slice
        this.compileExpression(expr.object);
        if (expr.start) {
          this.compileExpression(expr.start);
        } else {
          this.emit(IR.push(null, expr.loc?.line));
        }
        if (expr.end) {
          this.compileExpression(expr.end);
        } else {
          this.emit(IR.push(null, expr.loc?.line));
        }
        this.emit(IR.slice(expr.loc?.line));
        break;
      }

      case 'ObjectLiteral': {
        // Push all key-value pairs onto stack, then create object
        for (const prop of expr.properties) {
          this.emit(IR.push(prop.key, expr.loc?.line));
          this.compileExpression(prop.value);
        }
        this.emit(IR.objectCreate(expr.properties.length, expr.loc?.line));
        break;
      }

      case 'MemberAccess': {
        // Push object, push property name, then get member
        this.compileExpression(expr.object);
        this.emit(IR.push(expr.property, expr.loc?.line));
        this.emit(IR.memberGet(expr.loc?.line));
        break;
      }

      case 'MethodCall': {
        // Push object (will become 'self'), then push arguments, then call method
        this.compileExpression(expr.object);
        for (const arg of expr.arguments) {
          this.compileExpression(arg);
        }
        // argCount includes self, so it's arguments.length + 1
        this.emit(IR.methodCall(expr.method, expr.arguments.length + 1, expr.loc?.line));
        break;
      }

      case 'NewExpression': {
        // Push arguments, then create new instance
        for (const arg of expr.arguments) {
          this.compileExpression(arg);
        }
        this.emit(IR.new_(expr.className, expr.arguments.length, expr.loc?.line));
        break;
      }
    }
  }

  private compileBinaryOp(expr: BinaryOp): void {
    const line = expr.loc?.line;

    // Short-circuit evaluation for AND/OR
    if (expr.operator === 'and') {
      this.compileExpression(expr.left);
      this.emit(IR.dup(line));
      const jumpToEnd = this.emit(IR.jumpIfNot(-1, line));
      this.emit(IR.pop(line));
      this.compileExpression(expr.right);
      this.patch(jumpToEnd, this.currentAddress());
      return;
    }

    if (expr.operator === 'or') {
      this.compileExpression(expr.left);
      this.emit(IR.dup(line));
      const jumpToEnd = this.emit(IR.jumpIf(-1, line));
      this.emit(IR.pop(line));
      this.compileExpression(expr.right);
      this.patch(jumpToEnd, this.currentAddress());
      return;
    }

    // Normal binary operators: evaluate both sides
    this.compileExpression(expr.left);
    this.compileExpression(expr.right);

    switch (expr.operator) {
      case '+':
        this.emit(IR.add(line));
        break;
      case '-':
        this.emit(IR.sub(line));
        break;
      case '*':
        this.emit(IR.mul(line));
        break;
      case '/':
        this.emit(IR.div(line));
        break;
      case '%':
        this.emit(IR.mod(line));
        break;
      case '//':
        this.emit(IR.floorDiv(line));
        break;
      case '**':
        this.emit(IR.pow(line));
        break;
      case '==':
        this.emit(IR.eq(line));
        break;
      case '!=':
        this.emit(IR.neq(line));
        break;
      case '<':
        this.emit(IR.lt(line));
        break;
      case '>':
        this.emit(IR.gt(line));
        break;
      case '<=':
        this.emit(IR.lte(line));
        break;
      case '>=':
        this.emit(IR.gte(line));
        break;
      case 'in':
        this.emit(IR.in_(line));
        break;
    }
  }

  private compileUnaryOp(expr: UnaryOp): void {
    const line = expr.loc?.line;

    this.compileExpression(expr.operand);

    switch (expr.operator) {
      case '-':
        this.emit(IR.neg(line));
        break;
      case 'not':
        this.emit(IR.not(line));
        break;
    }
  }

  private compileCallExpression(expr: CallExpression): void {
    const line = expr.loc?.line;
    const name = expr.callee;
    const argCount = expr.arguments.length;

    // Push arguments onto stack
    for (const arg of expr.arguments) {
      this.compileExpression(arg);
    }

    // Check if it's a class instantiation
    if (this.userClasses.has(name)) {
      this.emit(IR.new_(name, argCount, line));
    } else if (this.userFunctions.has(name)) {
      // User-defined function
      this.emit(IR.callUser(name, argCount, line));
    } else {
      // Built-in command or sensor
      this.emit(IR.call(name, argCount, line));
    }
  }
}

export function compileToIR(program: Program): CompiledProgram {
  const compiler = new Compiler();
  return compiler.compile(program);
}
