import { useRoutes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MenuLayout from "./layouts/MenuLayout";
import Configs from "./pages/Configs";
import Proxys from "./pages/Proxys";

const App = () => {
  return useRoutes([
    {
      element: <AuthLayout />,
      children: [
        {
          element: <MenuLayout />,
          children: [
            {
              index: true,
              element: <Home />,
            },
            {
              path: "configs",
              element: <Configs />,
            },
            {
              path: "proxys",
              element: <Proxys />,
            },
          ],
        },
        {
          path: "login",
          element: <Login />,
        },
      ],
    },
  ]);
};

export default App;
