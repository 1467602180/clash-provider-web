import client, { useAuthModel } from "../../utils/client";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useBoolean } from "ahooks";
import { Button, Popover } from "antd";

const menuMap = [
  {
    path: "/",
    name: "首页",
  },
  {
    path: "/configs",
    name: "配置",
  },
  {
    path: "/proxys",
    name: "代理",
  },
];

const MenuLayout = () => {
  const location = useLocation();
  const authModel = useAuthModel();
  const navigate = useNavigate();
  const [logoutLoading, logoutLoadingAction] = useBoolean(false);

  return (
    <div className={"w-[80%] mx-auto <md:w-full bg-gray-100 h-full flex"}>
      <div className={"w-50 <md:w-20 border-r flex flex-col"}>
        <div className={"flex-1 overflow-y-auto space-y-2 p-2 hscrollbar"}>
          {menuMap.map((item) => {
            return (
              <div
                key={item.path}
                className={`p-2 cursor-pointer rounded transition ${
                  location.pathname === item.path
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                }`}
                onClick={() => {
                  navigate(item.path, { replace: true });
                }}
              >
                {item.name}
              </div>
            );
          })}
        </div>
        <div className={"p-4 border-t"}>
          <Popover
            content={
              <div>
                <Button
                  size={"small"}
                  type={"text"}
                  onClick={async () => {
                    logoutLoadingAction.toggle();
                    try {
                      await client.AuthStore.clear();
                      navigate("/login", { replace: true });
                    } catch (e) {}
                    logoutLoadingAction.toggle();
                  }}
                  loading={logoutLoading}
                >
                  退出登录
                </Button>
              </div>
            }
            placement={"right"}
          >
            <Button type={"text"} className={"!bg-white"}>
              {authModel.email}
            </Button>
          </Popover>
        </div>
      </div>
      <div className={"flex-1 w-0 p-4"}>
        <Outlet />
      </div>
    </div>
  );
};

export default MenuLayout;
