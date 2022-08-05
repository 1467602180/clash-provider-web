import { Outlet, useNavigate } from "react-router-dom";
import { useRequest } from "ahooks";
import client from "../../utils/client";

const AuthLayout = () => {
  const navigate = useNavigate();

  useRequest(async () => {
    if (client.AuthStore.isValid) {
      try {
        await client.Users.refresh();
        return;
      } catch (e) {}
    }
    navigate("/login", { replace: true });
  });

  return <Outlet />;
};

export default AuthLayout;
