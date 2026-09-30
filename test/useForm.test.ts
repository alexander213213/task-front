import { describe, expect, it } from "vitest";
import { z } from "zod";
import { issuesToFieldErrors, useForm } from "@/composables/useForm";
import { ApiError } from "@/services/api";

const schema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z.string().min(8, "Minimum of 8 characters"),
});

describe("useForm", () => {
  it("validates all fields at once", () => {
    const form = useForm(schema, { email: "", password: "" });

    const bad = form.validateAll();
    expect(bad.ok).toBe(false);
    expect(form.getError("email")).toBe("Must be a valid email");
    expect(form.getError("password")).toBe("Minimum of 8 characters");

    form.values.email = "alex@test.com";
    form.values.password = "Password123!";
    const good = form.validateAll();
    expect(good.ok).toBe(true);
    expect(form.getError("email")).toBeUndefined();
  });

  it("validates a single field on touch", () => {
    const form = useForm(schema, { email: "bad", password: "Password123!" });

    form.touch("email");
    expect(form.getError("email")).toBe("Must be a valid email");
    expect(form.touched.email).toBe(true);

    form.values.email = "ok@test.com";
    form.touch("email");
    expect(form.getError("email")).toBeUndefined();
  });

  it("merges server issues by field path", () => {
    const form = useForm(schema, { email: "alex@test.com", password: "Password123!" });
    const err = new ApiError(400, {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Bad",
      issues: [
        { path: ["email"], message: "Email already exists", code: "custom" },
        { path: [], message: "Form invalid", code: "custom" },
      ],
    });

    form.applyServerError(err);
    expect(form.getError("email")).toBe("Email already exists");
    expect(issuesToFieldErrors(err.issues)).toEqual({ email: "Email already exists" });
  });

  it("resets to initial values", () => {
    const form = useForm(schema, { email: "", password: "" });
    form.values.email = "x@y.com";
    form.touch("email");
    form.reset();
    expect(form.values.email).toBe("");
    expect(form.getError("email")).toBeUndefined();
  });
});
