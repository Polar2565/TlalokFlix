import { postJson } from "./api.service";

type AuthUser = {
  id: number;
  email: string;
  name: string | null;
};

type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

type RegisterResponse = {
  user: AuthUser;
  accessToken?: string;
};

function cleanEmail(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function cleanName(value?: string | null) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

function sanitizeUser(user: any): AuthUser {
  return {
    id: Number(user?.id),
    email: cleanEmail(user?.email),
    name: cleanName(user?.name),
  };
}

export async function loginApi(email: string, password: string) {
  const data = await postJson<LoginResponse>("/api/auth/login", {
    email: cleanEmail(email),
    password,
  });

  if (!data?.accessToken || !data?.user) {
    throw new Error("Respuesta inválida del servidor");
  }

  return {
    accessToken: data.accessToken,
    user: sanitizeUser(data.user),
  } as LoginResponse;
}

export async function registerApi(params: {
  email: string;
  password: string;
  name?: string | null;
}) {
  const payload: any = {
    email: cleanEmail(params.email),
    password: params.password,
  };

  const name = cleanName(params.name);
  if (name) {
    payload.name = name;
  }

  const data = await postJson<RegisterResponse>("/api/auth/register", payload);

  if (!data?.user) {
    throw new Error("Respuesta inválida del servidor");
  }

  return {
    ...data,
    user: sanitizeUser(data.user),
  };
}
