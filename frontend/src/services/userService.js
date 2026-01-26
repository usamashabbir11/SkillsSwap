import { registerUserApi, loginUserApi } from "../api/userApi";

const registerUser = async (data) => {
  return await registerUserApi(data);
};

const loginUser = async (data) => {
  const result = await loginUserApi(data);

  localStorage.setItem("token", result.data.token);
  localStorage.setItem("user", JSON.stringify(result.data.user));

  return result;
};

export default {
  registerUser,
  loginUser
};
