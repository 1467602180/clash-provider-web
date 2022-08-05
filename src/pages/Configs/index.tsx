import { useAntdTable, useBoolean, useRequest } from "ahooks";
import client, { baseUrl, useAuthModel } from "../../utils/client";
import { Button, message, Popconfirm, Space, Table } from "antd";
import moment from "moment";
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  FormDialog,
  FormDrawer,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
  Switch,
} from "@formily/antd";
import { ArrayField, Field, ObjectField } from "@formily/react";
import Monaco from "../../components/Monaco";
import config from "../../assets/yaml/config.yaml?raw";
import { FC } from "react";
import { nanoid } from "nanoid";
import clipboardCopy from "clipboard-copy";
import { parse, stringify } from "yaml";

const Configs = () => {
  const authModel = useAuthModel();
  const [deleteLoading, deleteLoadingAction] = useBoolean(false);

  const { tableProps, search, run, pagination } = useAntdTable(
    async ({ current, pageSize }) => {
      try {
        const { items, totalItems } = await client.Records.getList(
          "configs",
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
        <FormDialog.Portal id={"add-config"}>
          <Button
            type={"primary"}
            icon={<PlusOutlined />}
            onClick={() => {
              FormDialog(
                {
                  title: "添加配置",
                  keyboard: false,
                  maskClosable: false,
                  centered: true,
                  width: 800,
                },
                "add-config",
                () => {
                  return <AddOrEditOrDetailForm />;
                }
              )
                .forConfirm(async (payload, next) => {
                  const { title, config } = payload.values;
                  await client.Records.create("configs", {
                    title,
                    config,
                    user: authModel.id,
                  });
                  next(payload);
                  search.submit();
                })
                .forOpen((payload, next) => {
                  next({
                    initialValues: {
                      config,
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
        scroll={{ x: "max-content" }}
        size={"small"}
        bordered
        rowKey={"id"}
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
                  <FormDialog.Portal id={`config-edit-${record.id}`}>
                    <Button
                      type={"link"}
                      size={"small"}
                      onClick={() => {
                        FormDialog(
                          {
                            title: "编辑配置",
                            keyboard: false,
                            maskClosable: false,
                            centered: true,
                            width: 800,
                          },
                          `config-edit-${record.id}`,
                          () => {
                            return <AddOrEditOrDetailForm />;
                          }
                        )
                          .forOpen(async (payload, next) => {
                            const { id, title, config } =
                              await client.Records.getOne("configs", record.id);
                            next({
                              initialValues: {
                                id,
                                title,
                                config,
                              },
                            });
                          })
                          .forConfirm(async (payload, next) => {
                            const { id, title, config } = payload.values;
                            await client.Records.update("configs", id, {
                              title,
                              config,
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
                        await client.Records.delete("configs", record.id);
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
                        await client.Records.update("configs", record.id, {
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
                            `${baseUrl}api/configs/getConfig?token=${record.token}`
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
                  <FormDialog.Portal id={`config-proxy-${record.id}`}>
                    <Button
                      type={"link"}
                      size={"small"}
                      className={"!text-lime-500"}
                      onClick={() => {
                        FormDialog(
                          {
                            title: "配置代理",
                            keyboard: false,
                            maskClosable: false,
                            centered: true,
                          },
                          `config-proxy-${record.id}`,
                          () => {
                            const { runAsync } = useRequest(
                              async (title?: string) => {
                                try {
                                  const res = await client.Records.getList(
                                    "proxys",
                                    1,
                                    20,
                                    {
                                      filter: `title ~ '${
                                        title || ""
                                      }'&&token!=''`,
                                    }
                                  );
                                  return res.items.map((item) => ({
                                    label: item.title,
                                    value: item.token,
                                  }));
                                } catch (e) {}
                                return [];
                              },
                              {
                                manual: true,
                                debounceWait: 300,
                              }
                            );

                            return (
                              <FormLayout layout={"vertical"}>
                                <ArrayField
                                  name={"proxy-providers"}
                                  required
                                  title={"代理组"}
                                  decorator={[FormItem]}
                                >
                                  {(field) => {
                                    return (
                                      <div className={"space-y-2"}>
                                        <div className={"space-y-2"}>
                                          {field.value.map((item, index) => {
                                            return (
                                              <div
                                                className={
                                                  "p-2 bg-gray-100 rounded"
                                                }
                                              >
                                                <div
                                                  className={
                                                    "flex items-center space-x-2"
                                                  }
                                                >
                                                  <div className={"flex-1"} />
                                                  <Button
                                                    size={"small"}
                                                    type={"text"}
                                                    icon={<DeleteOutlined />}
                                                    onClick={async () => {
                                                      await field.remove(index);
                                                    }}
                                                  />
                                                </div>
                                                <ObjectField
                                                  name={index}
                                                  key={index}
                                                >
                                                  {() => {
                                                    return (
                                                      <div>
                                                        <FormLayout
                                                          layout={"vertical"}
                                                        >
                                                          <Field
                                                            name={"proxy"}
                                                            title={"代理"}
                                                            required
                                                            decorator={[
                                                              FormItem,
                                                            ]}
                                                            component={[
                                                              Select,
                                                              {
                                                                showSearch:
                                                                  true,
                                                                allowClear:
                                                                  true,
                                                                filterOption:
                                                                  false,
                                                              },
                                                            ]}
                                                            reactions={[
                                                              async ({
                                                                mounted,
                                                                setDataSource,
                                                                componentProps,
                                                              }) => {
                                                                if (mounted) {
                                                                  setDataSource(
                                                                    await runAsync()
                                                                  );
                                                                  componentProps.onSearch =
                                                                    async (
                                                                      value: string
                                                                    ) => {
                                                                      setDataSource(
                                                                        await runAsync(
                                                                          value
                                                                        )
                                                                      );
                                                                    };
                                                                  componentProps.onClear =
                                                                    async () => {
                                                                      setDataSource(
                                                                        await runAsync()
                                                                      );
                                                                    };
                                                                }
                                                              },
                                                            ]}
                                                          />
                                                          <Field
                                                            name={"name"}
                                                            initialValue={nanoid()}
                                                          />
                                                          <Field
                                                            name={"interval"}
                                                            title={"轮询(秒)"}
                                                            initialValue={3600}
                                                            required
                                                            decorator={[
                                                              FormItem,
                                                            ]}
                                                            component={[
                                                              NumberPicker,
                                                            ]}
                                                            validator={[
                                                              {
                                                                min: 1,
                                                              },
                                                            ]}
                                                          />
                                                          <ObjectField
                                                            title={"健康检查"}
                                                            name={
                                                              "health-check"
                                                            }
                                                            decorator={[
                                                              FormItem,
                                                            ]}
                                                          >
                                                            {() => {
                                                              return (
                                                                <div>
                                                                  <FormLayout
                                                                    layout={
                                                                      "vertical"
                                                                    }
                                                                  >
                                                                    <Field
                                                                      name={
                                                                        "enable"
                                                                      }
                                                                      component={[
                                                                        Switch,
                                                                      ]}
                                                                    />
                                                                    <Field
                                                                      title={
                                                                        "检查地址"
                                                                      }
                                                                      initialValue={
                                                                        "http://www.google.com"
                                                                      }
                                                                      name={
                                                                        "url"
                                                                      }
                                                                      required
                                                                      decorator={[
                                                                        FormItem,
                                                                      ]}
                                                                      component={[
                                                                        Input,
                                                                      ]}
                                                                      validator={[
                                                                        {
                                                                          format:
                                                                            "url",
                                                                        },
                                                                      ]}
                                                                      reactions={[
                                                                        ({
                                                                          query,
                                                                          setState,
                                                                        }) => {
                                                                          const enable =
                                                                            query(
                                                                              ".enable"
                                                                            ).value();
                                                                          if (
                                                                            enable
                                                                          ) {
                                                                            setState(
                                                                              {
                                                                                visible:
                                                                                  true,
                                                                              }
                                                                            );
                                                                            return;
                                                                          }
                                                                          setState(
                                                                            {
                                                                              visible:
                                                                                false,
                                                                            }
                                                                          );
                                                                        },
                                                                      ]}
                                                                    />
                                                                    <Field
                                                                      title={
                                                                        "检查轮询(秒)"
                                                                      }
                                                                      name={
                                                                        "interval"
                                                                      }
                                                                      initialValue={
                                                                        600
                                                                      }
                                                                      required
                                                                      decorator={[
                                                                        FormItem,
                                                                      ]}
                                                                      component={[
                                                                        NumberPicker,
                                                                      ]}
                                                                      validator={[
                                                                        {
                                                                          min: 1,
                                                                        },
                                                                      ]}
                                                                      reactions={[
                                                                        ({
                                                                          query,
                                                                          setState,
                                                                        }) => {
                                                                          const enable =
                                                                            query(
                                                                              ".enable"
                                                                            ).value();
                                                                          if (
                                                                            enable
                                                                          ) {
                                                                            setState(
                                                                              {
                                                                                visible:
                                                                                  true,
                                                                              }
                                                                            );
                                                                            return;
                                                                          }
                                                                          setState(
                                                                            {
                                                                              visible:
                                                                                false,
                                                                            }
                                                                          );
                                                                        },
                                                                      ]}
                                                                    />
                                                                  </FormLayout>
                                                                </div>
                                                              );
                                                            }}
                                                          </ObjectField>
                                                        </FormLayout>
                                                      </div>
                                                    );
                                                  }}
                                                </ObjectField>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        <Button
                                          block
                                          size={"small"}
                                          onClick={async () => {
                                            await field.push({});
                                          }}
                                          icon={<PlusOutlined />}
                                        >
                                          添加代理
                                        </Button>
                                      </div>
                                    );
                                  }}
                                </ArrayField>
                              </FormLayout>
                            );
                          }
                        )
                          .forOpen(async (payload, next) => {
                            const res = await client.Records.getOne(
                              "configs",
                              record.id
                            );
                            const configObject = parse(res.config);
                            let result: any;
                            if (configObject["proxy-providers"]) {
                              result = Object.entries(
                                configObject["proxy-providers"]
                              ).map(([key, value]: any) => {
                                return {
                                  proxy: value?.url?.split("?token=")?.[1],
                                  name: key,
                                  interval: value?.interval,
                                  "health-check": value?.["health-check"],
                                };
                              });
                            }
                            next({
                              initialValues: {
                                "proxy-providers": result || [{}],
                              },
                            });
                          })
                          .forConfirm(async (payload, next) => {
                            const data = payload.values["proxy-providers"];
                            const genConfig: any = {};
                            data.forEach((item: any) => {
                              const { name, proxy, interval } = item;
                              const result: any = {};
                              if (item["health-check"]?.enable) {
                                result["health-check"] = {
                                  enable: true,
                                  url: item["health-check"].url,
                                  interval: item["health-check"].interval,
                                };
                              }
                              genConfig[name] = {
                                type: "http",
                                url: `${baseUrl}api/proxys/getConfig?token=${proxy}`,
                                interval,
                                path: `./${name}.yaml`,
                                ...result,
                              };
                            });
                            const res = await client.Records.getOne(
                              "configs",
                              record.id
                            );
                            const configObject = parse(res.config);
                            configObject["proxy-providers"] = genConfig;
                            configObject["proxy-groups"] = [
                              {
                                name: "PROXY",
                                type: "select",
                                use: Object.keys(genConfig),
                              },
                            ];
                            await client.Records.update("configs", record.id, {
                              config: stringify(configObject),
                            });
                            message.success("配置代理成功");
                            next(payload);
                          })
                          .open()
                          .then();
                      }}
                    >
                      配置代理
                    </Button>
                  </FormDialog.Portal>
                  <FormDrawer.Portal id={`config-detail-${record.id}`}>
                    <Button
                      type={"link"}
                      size={"small"}
                      onClick={() => {
                        FormDrawer(
                          {
                            title: "配置详情",
                          },
                          `config-detail-${record.id}`,
                          () => {
                            return <AddOrEditOrDetailForm readOnly />;
                          }
                        )
                          .forOpen(async (payload, next) => {
                            const res = await client.Records.getOne(
                              "configs",
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
        title={"配置"}
        name={"config"}
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

export default Configs;
