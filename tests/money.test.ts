import { describe, expect, it } from "vitest";
import { parseAmountToCents } from "../src/lib/money";
import { generateReference, generateAccountNumber } from "../src/lib/references";
import { InvalidAmountError } from "../src/lib/ledger/ledger.errors";

describe("money parsing (integer minor units, never floats)", () => {
  it("parses whole dollars", () => {
    expect(parseAmountToCents("100")).toBe(10000n);
  });

  it("parses dollars and cents", () => {
    expect(parseAmountToCents("100.25")).toBe(10025n);
    expect(parseAmountToCents("0.01")).toBe(1n);
    expect(parseAmountToCents("0.5")).toBe(50n);
  });

  it("rejects negatives, zero, malformed and over-precise amounts", () => {
    for (const bad of ["-5", "-5.00", "0", "0.00", "1.234", "abc", "1,000", "1.2.3", "", "  ", "1e3", "Infinity", "NaN"]) {
      expect(() => parseAmountToCents(bad), `should reject ${JSON.stringify(bad)}`).toThrow(InvalidAmountError);
    }
  });

  it("rejects amounts above the maximum", () => {
    expect(() => parseAmountToCents("1000000000000000")).toThrow(InvalidAmountError);
  });

  it("accepts whitespace-wrapped valid amounts", () => {
    expect(parseAmountToCents("  42.10  ")).toBe(4210n);
  });
});

describe("transaction references", () => {
  it("generates TX-YYYYMMDD-XXXXXX shaped references", () => {
    const ref = generateReference("TX");
    expect(ref).toMatch(/^TX-\d{8}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
  });

  it("generates unique references in bulk", () => {
    const refs = new Set(Array.from({ length: 2000 }, () => generateReference("TX")));
    expect(refs.size).toBe(2000);
  });

  it("generates clearly simulated account numbers", () => {
    for (let i = 0; i < 100; i++) {
      const num = generateAccountNumber();
      expect(num).toMatch(/^\d{10}$/);
    }
  });
});