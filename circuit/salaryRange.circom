pragma circom 2.0.0;

template SalaryRangeProof() {
    // Private inputs
    signal private input salary;
    signal private input salt; // For privacy/nonce
    
    // Public inputs
    signal input minSalary;
    signal input maxSalary;
    signal input commitment; // Hash commitment to salary + salt
    
    // Output
    signal output isValid;
    
    // Components
    component hasher = Poseidon(2);
    component geq = GreaterEqThan(64);
    component leq = LessEqThan(64);
    
    // Check if salary is within range
    geq.in[0] <== salary;
    geq.in[1] <== minSalary;
    
    leq.in[0] <== salary;
    leq.in[1] <== maxSalary;
    
    // Verify commitment
    hasher.inputs[0] <== salary;
    hasher.inputs[1] <== salt;
    commitment === hasher.out;
    
    // Output is valid if salary is in range
    isValid <== geq.out * leq.out;
}

template GreaterEqThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n+1);
    lt.in[0] <== in[1];
    lt.in[1] <== in[0] + 1;
    out <== lt.out;
}

template LessEqThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n+1);
    lt.in[0] <== in[0];
    lt.in[1] <== in[1] + 1;
    out <== lt.out;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component num2Bits = Num2Bits(n);
    num2Bits.in <== in[0] + (1<<n) - in[1];
    out <== 1 - num2Bits.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;
    
    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }
    
    lc1 === in;
}

template Poseidon(nInputs) {
    signal input inputs[nInputs];
    signal output out;
    
    // Simplified Poseidon hash for demo
    // In production, use the proper Poseidon implementation
    var sum = 0;
    for (var i = 0; i < nInputs; i++) {
        sum += inputs[i] * (i + 1);
    }
    out <== sum;
}

component main = SalaryRangeProof(); 