import { useAntdTable, useBoolean } from "ahooks";
import client, { baseUrl, useAuthModel } from "../../utils/client";
import { Button, message, Popconfirm, Space, Table } from "antd";
import moment from "moment";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  FormDialog,
  FormDrawer,
  FormItem,
  FormLayout,
  Input,
} from "@formily/antd";
import { Field } from "@formily/react";
import Monaco from "../../components/Monaco";
import proxy from "../../assets/yaml/proxy.yaml?raw";
import { FC } from "react";
import { nanoid } from "nanoid";
import clipboardCopy from "clipboard-copy";

const Proxys = () => {
  const authModel = useAuthModel();
  const [deleteLoading, deleteLoadingAction] = useBoolean(false);

  const { tableProps, search, run, pagination } = useAntdTable(
    async ({ current, pageSize }) => {
      try {
        const { items, totalItems } = await client.Records.getList(
          "proxys",
          current,
          pageSize
        );
        return {
          list: items,
          total: totalItems,
        };
      } catch (e) {}
      return {
        list: [],
        total: 0,
      };
    }
  );

  return (
    <div className={"space-y-2"}>
      <div className={"flex space-x-2"}>
        <div className={"flex-1"} />
        <FormDialog.Portal id={"add-proxy"}>
          <Button
            type={"primary"}
            icon={<PlusOutlined />}
            onClick={() => {
              FormDialog(
                {
                  title: "添加代理",
                  keyboard: false,
                  maskClosable: false,
                  centered: true,
                  width: 800,
                },
                "add-proxy",
                () => {
                  return <AddOrEditOrDetailForm />;
                }
              )
                .forConfirm(async (payload, next) => {
                  const { title, proxy } = payload.values;
                  await client.Records.create("proxys", {
                    title,
                    proxy,
                    user: authModel.id,
                  });
                  next(payload);
                  search.submit();
                })
                .forOpen((payload, next) => {
                  next({
                    initialValues: {
                      proxy,
                    },
                  });
                })
                .open()
                .then();
            }}
          >
            添加配置
          </Button>
        </FormDialog.Portal>
        <Button
          icon={<ReloadOutlined />}
          type={"link"}
          loading={tableProps.loading}
          onClick={() => {
            search.submit();
          }}
        >
          刷新
        </Button>
      </div>
      <Table
        {...tableProps}
        size={"small"}
        bordered
        rowKey={"id"}
        scroll={{ x: "max-content" }}
        columns={[
          {
            align: "center",
            title: "标题",
            width: 100,
            dataIndex: "title",
          },
          {
            align: "center",
            title: "创建时间",
            width: 100,
            dataIndex: "created",
            render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            align: "center",
            title: "更新时间",
            width: 100,
            dataIndex: "updated",
            render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            align: "center",
            title: "操作",
            width: 100,
            render: (text, record) => {
              return (
                <Space>
                  <FormDialog.Portal id={`proxy-edit-${record.id}`}>
                    <Button
                      type={"link"}
                      size={"small"}
                      onClick={() => {
                        FormDialog(
                          {
                            title: "编辑代理",
                            keyboard: false,
                            maskClosable: false,
                            centered: true,
                            width: 800,
                          },
                          `proxy-edit-${record.id}`,
                          () => {
                            return <AddOrEditOrDetailForm />;
                          }
                        )
                          .forOpen(async (payload, next) => {
                            const { id, title, proxy } =
                              await client.Records.getOne("proxys", record.id);
                            next({
                              initialValues: {
                                id,
                                title,
                                proxy,
                              },
                            });
                          })
                          .forConfirm(async (payload, next) => {
                            const { id, title, proxy } = payload.values;
                            await client.Records.update("proxys", id, {
                              title,
                              proxy,
                            });
                            next(payload);
                            run(pagination);
                          })
                          .open()
                          .then();
                      }}
                    >
                      编辑
                    </Button>
                  </FormDialog.Portal>
                  <Popconfirm
                    title={"确定删除这个配置吗"}
                    okButtonProps={{
                      loading: deleteLoading,
                    }}
                    onConfirm={async () => {
                      deleteLoadingAction.toggle();
                      try {
                        await client.Records.delete("proxys", record.id);
                        message.success("删除成功");
                        run(pagination);
                      } catch (e) {}
                      deleteLoadingAction.toggle();
                    }}
                  >
                    <Button type={"link"} size={"small"} danger>
                      删除
                    </Button>
                  </Popconfirm>
                  <Button
                    type={"link"}
                    size={"small"}
                    className={"!text-yellow-500"}
                    onClick={async () => {
                      const hide = message.loading("生成token中", 0);
                      try {
                        await client.Records.update("proxys", record.id, {
                          token: nanoid(32),
                        });
                        run(pagination);
                        message.success("生成token成功");
                      } catch (e) {}
                      hide();
                    }}
                  >
                    {record.token ? "刷新" : "生成"}token
                  </Button>
                  {record.token && (
                    <Button
                      type={"link"}
                      size={"small"}
                      className={"!text-green-500"}
                      onClick={async () => {
                        try {
                          await clipboardCopy(
                            `${baseUrl}api/proxys/getConfig?token=${record.token}`
                          );
                          message.success("复制成功");
                        } catch (e) {
                          console.error(e);
                          message.error("复制失败");
                        }
                      }}
                    >
                      复制分享链接
                    </Button>
                  )}
                  <FormDrawer.Portal id={`proxy-detail-${record.id}`}>
                    <Button
                      type={"link"}
                      size={"small"}
                      onClick={() => {
                        FormDrawer(
                          {
                            title: "配置详情",
                          },
                          `proxy-detail-${record.id}`,
                          () => {
                            return <AddOrEditOrDetailForm readOnly />;
                          }
                        )
                          .forOpen(async (payload, next) => {
                            const res = await client.Records.getOne(
                              "proxys",
                              record.id
                            );
                            next({
                              initialValues: {
                                ...res,
                              },
                            });
                          })
                          .open()
                          .then();
                      }}
                    >
                      详情
                    </Button>
                  </FormDrawer.Portal>
                </Space>
              );
            },
          },
        ]}
      />
    </div>
  );
};

const AddOrEditOrDetailForm: FC<{ readOnly?: boolean }> = ({ readOnly }) => {
  return (
    <FormLayout layout={"vertical"}>
      <Field
        readOnly={readOnly}
        required
        title={"标题"}
        name={"title"}
        decorator={[FormItem]}
        component={[Input]}
      />
      <Field
        required
        readOnly={readOnly}
        title={"代理"}
        name={"proxy"}
        decorator={[FormItem]}
        component={[
          Monaco,
          {
            className: readOnly ? "h-150" : "",
          },
        ]}
      />
    </FormLayout>
  );
};

export default Proxys;
