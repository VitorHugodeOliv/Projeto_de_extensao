import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authStore } from "../store/authStore";

vi.mock("axios");

const mockedPost = vi.mocked(axios.post);

describe("authStore", () => {
  beforeEach(() => {
    localStorage.clear();
    authStore.setTokens({ accessToken: null, refreshToken: null });
    authStore.setUser(null);
    mockedPost.mockReset();
  });

  it("should persist tokens when setTokens is called", () => {
    authStore.setTokens({ accessToken: "abc", refreshToken: "def" });

    expect(authStore.getState().accessToken).toBe("abc");
    expect(authStore.getState().refreshToken).toBe("def");
    expect(localStorage.getItem("token")).toBe("abc");
    expect(localStorage.getItem("refreshToken")).toBe("def");
  });

  it("should clear auth data on logout", () => {
    authStore.setTokens({ accessToken: "abc", refreshToken: "def" });
    authStore.setUser({ nome: "Test" });

    authStore.logout();

    expect(authStore.getState().accessToken).toBeNull();
    expect(authStore.getState().refreshToken).toBeNull();
    expect(authStore.getState().user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("should refresh tokens from API", async () => {
    authStore.setTokens({ accessToken: "old", refreshToken: "refresh" });
    mockedPost.mockResolvedValueOnce({
      data: { access_token: "new", refresh_token: "newRefresh" },
    });

    const result = await authStore.refreshTokens();

    expect(result).toBe("new");
    expect(authStore.getState().accessToken).toBe("new");
    expect(authStore.getState().refreshToken).toBe("newRefresh");
  });

  it("should logout if refresh token is missing", async () => {
    const result = await authStore.refreshTokens();

    expect(result).toBeNull();
    expect(authStore.getState().accessToken).toBeNull();
  });
});
