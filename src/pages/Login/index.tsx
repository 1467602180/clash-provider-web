import { useMemo } from "react";
import { createForm } from "@formily/core";
import { message, Typography } from "antd";
import { Field } from "@formily/react";
import { Form, FormButtonGroup, FormItem, Input, Submit } from "@formily/antd";
import client from "../../utils/client";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const form = useMemo(() => createForm(), []);
  const navigate = useNavigate();

  return (
    <div className={"center h-full"}>
      <div className={"p-4 rounded shadow w-100"}>
        <Typography.Title level={3}>Clash Provider</Typography.Title>
        <Form
          form={form}
          layout={"vertical"}
          onAutoSubmit={async (values) => {
            try {
              await client.Users.authViaEmail(values.email, values.password);
              message.success("登录成功");
              navigate("/", { replace: true });
            } catch (e) {
              message.error("登录失败");
            }
          }}
        >
          <Field
            name={"email"}
            title={"邮箱"}
            required
            decorator={[FormItem]}
            component={[Input]}
            validator={[
              {
                format: "email",
              },
            ]}
          />
          <Field
            name={"password"}
            title={"密码"}
            required
            decorator={[FormItem]}
            component={[
              Input,
              {
                type: "password",
              },
            ]}
          />
          <FormButtonGroup align={"right"}>
            <Submit>登录</Submit>
          </FormButtonGroup>
        </Form>
      </div>
    </div>
  );
};

export default Login;
