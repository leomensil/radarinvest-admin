import { api, setAccessToken } from "./client";

export async function adminLogin(email: string, password: string) {
  const { data, error, response } = await api.POST("/auth/login", {
    body: { email, password },
  });
  if (!response.ok || !data) {
    throw new Error(error?.message ?? "Login failed");
  }
  setAccessToken(data.accessToken);
  const me = await api.GET("/me");
  if (!me.data || me.data.role !== "SUPER_ADMIN") {
    setAccessToken(null);
    throw new Error("Acesso restrito a SUPER_ADMIN");
  }
  return me.data;
}
