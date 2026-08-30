import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/session";
import { errorResponse } from "@/lib/api";
import { generateBic, generateIban, generateUniqueAccountNumber } from "@/lib/references";
import { RLS_SERVICE, setRlsContext, withRls } from "@/lib/rls";

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username is too long.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores.")
    .toLowerCase(),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
  securityQuestion: z
    .string()
    .trim()
    .min(1, "Please choose a security question."),
  securityAnswer: z
    .string()
    .trim()
    .min(2, "Security answer must be at least 2 characters.")
    .max(200, "Security answer is too long."),
});

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const { username, name, email, password, securityQuestion, securityAnswer } = parsed.data;

    const { existing, accountNumber } = await withRls(RLS_SERVICE, async (tx) => {
      const existing = await tx.user.findFirst({
        where: { OR: [{ email: email.toLowerCase() }, { username }] },
      });
      if (existing) {
        return { existing, accountNumber: null as string | null };
      }
      const accountNumber = await generateUniqueAccountNumber(tx);
      return { existing: null, accountNumber };
    });
    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_TAKEN", message: "An account with this email or username already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);
    const iban = generateIban("USD", accountNumber!);
    const bic = generateBic("USD");

    const result = await prisma.$transaction(async (tx) => {
      await setRlsContext(tx, RLS_SERVICE);
      const user = await tx.user.create({
        data: {
          username,
          name,
          email,
          passwordHash,
          securityQuestion,
          securityAnswerHash,
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });

      const account = await tx.account.create({
        data: {
          userId: user.id,
          accountNumber,
          iban,
          bic,
          type: "CHECKING",
          status: "ACTIVE",
        },
      });

      return { user, account };
    });

    return NextResponse.json({
      user: {
        id: result.user.id,
        username: result.user.username,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      account: {
        id: result.account.id,
        accountNumber: result.account.accountNumber,
        type: result.account.type,
      },
    }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
