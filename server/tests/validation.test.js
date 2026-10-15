import { test } from "node:test";
import assert from "node:assert/strict";
import * as s from "../src/validators/schemas.js";
test("registration restricts roles and password length; normalizes email", () => {
  assert.equal(
    s.register.parse({
      email: "User@Example.com",
      password: "abcdefghij",
      role: "candidate",
    }).email,
    "user@example.com",
  );
  assert.equal(
    s.register.safeParse({
      email: "a@b.com",
      password: "short",
      role: "candidate",
    }).success,
    false,
  );
  assert.equal(
    s.register.safeParse({
      email: "a@b.com",
      password: "abcdefghij",
      role: "admin",
    }).success,
    false,
  );
});
test("rejects invalid pagination and quantities", () => {
  for (const page of ["0", "-1", "x", "1.5"])
    assert.equal(s.search.safeParse({ page }).success, false);
  assert.equal(s.search.safeParse({ limit: 10000 }).success, false);
  assert.equal(s.search.safeParse({ days: "999" }).success, false);
  assert.equal(s.id.safeParse("1 OR 1=1").success, false);
});
test("rejects withdrawn as recruiter status and excessive profile skills", () => {
  assert.equal(
    s.applicationStatus.safeParse({ status: "withdrawn" }).success,
    false,
  );
  assert.equal(
    s.profile.safeParse({
      first_name: "A",
      last_name: "B",
      city: "",
      state: "",
      country: "",
      company: "",
      certificate: "",
      experience: "",
      skills: Array(31).fill({ name: "JS", level: "Advance", years: 2 }),
    }).success,
    false,
  );
});
