export function evaluateLogic(expression, maxNumber) {
    // Tokenizes the input expression into individual components
    function tokenizeExpression(expr) {
        return expr.match(/\S+/g);
    }

    // Validates the tokenized expression
    function validateExpression(tokens) {
        let stack = [];
        let lastToken = null;
        let lastOperator = null; // To track the last operator type
        let hasDigit = false;
        let encounteredNumbers = new Set();
        let currentOperator = null; // Tracks the current operator being processed

        // Helper function to check if the expression is properly enclosed in parentheses
        function checkInitialBrackets() {
            return tokens[0] === "(" && tokens[tokens.length - 1] === ")";
        }

        // Tracks the operators at each level of parentheses
        let operatorStack = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.match(/^\d+$/)) { // Number
                const number = parseInt(token);
                if (number < 1 || number > maxNumber) {
                    return { status: 'failure', message: `Number "${token}" is out of range (1 to ${maxNumber}) at token ${i}` };
                }
                encounteredNumbers.add(number);
                hasDigit = true;
                lastToken = 'number';
            } 
            else if (token === '(') { // Opening parenthesis
                stack.push(token);
                operatorStack.push(null); // New level, no operator yet
                lastToken = 'parenthesis';
            } 
            else if (token === ')') { // Closing parenthesis
                if (stack.length === 0 || stack[stack.length - 1] !== '(') {
                    return { status: 'failure', message: `Unmatched closing parenthesis at token ${i}` };
                }
                stack.pop();
                operatorStack.pop(); // Pop the operator stack when closing a parenthesis
                lastToken = 'parenthesis';
            } 
            else if (token === 'AND' || token === 'OR') { // Logical operator
                currentOperator = token;

                // If we have consecutive operators, throw an error
                if (lastToken === 'operator') {
                    return { status: 'failure', message: `Consecutive operators at token ${i}` };
                }

                // Check for heterogeneous operations at the current level
                const previousOperator = operatorStack[operatorStack.length - 1];
                if (previousOperator && previousOperator !== currentOperator) {
                    return { status: 'failure', message: `Heterogeneous operations (AND/OR) must be enclosed in parentheses at token ${i}` };
                }

                // Update the operator stack with the current operator
                operatorStack[operatorStack.length - 1] = currentOperator;

                lastOperator = currentOperator; // Track the last operator type
                lastToken = 'operator';
            } 
            else {
                return { status: 'failure', message: `Invalid token "${token}" at token ${i}` };
            }
        }

        // Ensure all parentheses are closed
        if (stack.length !== 0) {
            return { status: 'failure', message: "Unmatched opening parenthesis" };
        }

        // Step 1: Ensure all numbers from 1 to maxNumber are present
        for (let i = 1; i <= maxNumber; i++) {
            if (!encounteredNumbers.has(i)) {
                return { status: 'failure', message: `Number "${i}" is missing from the expression` };
            }
        }

        // Step 2: Ensure the expression contains initial enclosing parentheses
        if (!checkInitialBrackets()) {
            return { status: 'failure', message: "Expression must be enclosed in parentheses" };
        }

        return { status: 'success', message: "Valid expression" };
    }

    // Tokenize the expression
    const tokens = tokenizeExpression(expression);

    if (!tokens || tokens.length === 0) {
        return { status: 'failure', message: "Invalid or empty expression" };
    }

    // Validate the tokenized expression
    return validateExpression(tokens);
}
