import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  InputNumber,
  Row,
  Select,
  Spin,
  Typography,
  message,
  Space,
} from "antd";
import { SwapOutlined, ReloadOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import { fetchTokenList } from "../apis/getAllToken";
import { TokenData, TokenListFields } from "../models/token.models";
import { getExchangeRate } from "../utils/getExchangeRate";

const { Option } = Select;
const { Title, Text } = Typography;

const CurrencySwapForm: FC = () => {
  const [form] = Form.useForm();
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCalculate, setLoadingCalculate] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const from = Form.useWatch("from", form);
  const to = Form.useWatch("to", form);

  const fromData = useMemo(() => {
    try {
      return from ? (JSON.parse(from) as TokenData) : null;
    } catch {
      return null;
    }
  }, [from]);

  const toData = useMemo(() => {
    try {
      return to ? (JSON.parse(to) as TokenData) : null;
    } catch {
      return null;
    }
  }, [to]);

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchTokenList();
      setTokenList(data);
    } catch (err) {
      const errorMessage = "Failed to fetch token list. Please try again.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleExchangeRate = useCallback(
    debounce((_: unknown, values: TokenListFields) => {
      if (!values.from || !values.to || !values.fromAmount) {
        setExchangeRate(0);
        return;
      }

      setLoadingCalculate(true);
      setError("");

      setTimeout(() => {
        try {
          const exchangeRateData = getExchangeRate(
            values.from,
            values.to
          ) as number;
          setExchangeRate(exchangeRateData);

          form.setFieldValue(
            "toAmount",
            (values.fromAmount * exchangeRateData).toFixed(5)
          );
        } catch (err) {
          setError("Failed to calculate exchange rate");
          message.error("Failed to calculate exchange rate");
        } finally {
          setLoadingCalculate(false);
        }
      }, 1000);
    }, 500),
    [form]
  );

  const handleSwapExchange = useCallback(() => {
    const currentFromAmount = form.getFieldValue("fromAmount");
    const currentToAmount = form.getFieldValue("toAmount");
    const currentFrom = form.getFieldValue("from");
    const currentTo = form.getFieldValue("to");

    if (!currentFrom || !currentTo) {
      message.warning("Please select both currencies first");
      return;
    }

    try {
      const exchangeRateData = getExchangeRate(
        currentTo,
        currentFrom
      ) as number;

      form.setFieldsValue({
        to: currentFrom,
        from: currentTo,
        fromAmount: currentToAmount,
        toAmount: currentFromAmount,
      });

      setExchangeRate(exchangeRateData);
    } catch (err) {
      message.error("Failed to swap currencies");
    }
  }, [form]);

  const FALLBACK_ICON =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSI1IiB5PSI1IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik01IDJMMTAgN0w1IDEyTDAgN0w1IDJaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo8L3N2Zz4K";

  const TOKEN_ICON_STYLES = {
    width: 20,
    height: 20,
    borderRadius: "50%",
  };

  const PRICE_TEXT_STYLES = {
    fontSize: "12px",
  };

  const CURRENCY_TEXT_STYLES = {
    fontWeight: 500,
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_ICON;
  };

  const generateTokenKey = (token: TokenData, index: number): string =>
    `${token.currency}-${token.date}-${index}`;

  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

  const renderTokenOption = useCallback((token: TokenData, index: number) => {
    const tokenKey = generateTokenKey(token, index);
    const formattedPrice = formatPrice(token.price);

    return (
      <Option key={tokenKey} value={JSON.stringify(token)}>
        <Flex align="center" gap={8}>
          <img
            src={token.icon}
            alt={token.currency}
            style={TOKEN_ICON_STYLES}
            onError={handleImageError}
          />
          <span style={CURRENCY_TEXT_STYLES}>{token.currency}</span>
          <Text type="secondary" style={PRICE_TEXT_STYLES}>
            {formattedPrice}
          </Text>
        </Flex>
      </Option>
    );
  }, []);

  return (
    <Card
      style={{
        maxWidth: 600,
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: 16,
        border: "none",
      }}
      bodyStyle={{ padding: 24 }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
            Currency Swap
          </Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchTokens}
            loading={loading}
            size="small"
            type="text"
          >
            Update Price List
          </Button>
        </Flex>

        {error && (
          <div
            style={{
              padding: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        <Form
          form={form}
          onValuesChange={handleExchangeRate}
          layout="vertical"
          size="large"
        >
          <Card
            size="small"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text
                type="secondary"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                From
              </Text>
              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item
                    name="from"
                    rules={[
                      { required: true, message: "Please select a token" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      loading={loading}
                      showSearch
                      placeholder="Select token"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children
                          ?.toString()
                          .toLowerCase()
                          .includes(input.toLowerCase()) ?? false
                      }
                      style={{ width: "100%" }}
                    >
                      {tokenList.map(renderTokenOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    name="fromAmount"
                    rules={[
                      { required: true, message: "Please enter amount" },
                      {
                        type: "number",
                        min: 0,
                        message: "Amount must be positive",
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="0.00"
                      min={0}
                      precision={8}
                      controls={false}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          </Card>

          <Flex justify="center" style={{ margin: "8px 0" }}>
            <Button
              onClick={handleSwapExchange}
              shape="circle"
              size="large"
              icon={<SwapOutlined style={{ fontSize: "18px" }} />}
              style={{
                background: "#3b82f6",
                borderColor: "#3b82f6",
                color: "white",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2563eb";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3b82f6";
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          </Flex>

          <Card
            size="small"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text
                type="secondary"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                To
              </Text>
              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item
                    name="to"
                    rules={[
                      { required: true, message: "Please select a token" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      loading={loading}
                      showSearch
                      placeholder="Select token"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children
                          ?.toString()
                          .toLowerCase()
                          .includes(input.toLowerCase()) ?? false
                      }
                      style={{ width: "100%" }}
                    >
                      {tokenList.map(renderTokenOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Spin spinning={loadingCalculate} tip="Calculating...">
                    <Form.Item name="toAmount" style={{ marginBottom: 0 }}>
                      <InputNumber
                        disabled
                        style={{ width: "100%" }}
                        placeholder="0.00"
                        precision={8}
                        controls={false}
                      />
                    </Form.Item>
                  </Spin>
                </Col>
              </Row>
            </Space>
          </Card>

          {exchangeRate > 0 && fromData && toData && (
            <Card
              size="small"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: 12,
                color: "white",
                marginTop: 20,
              }}
              bodyStyle={{ padding: 16 }}
            >
              <Flex justify="space-between " align="center">
                <Text style={{ color: "white", fontWeight: 500 }}>
                  Exchange Rate
                </Text>
                <Text
                  style={{ color: "white", fontSize: "16px", fontWeight: 600 }}
                >
                  1 {fromData.currency} = {exchangeRate} {toData.currency}
                </Text>
              </Flex>
            </Card>
          )}
        </Form>
      </Space>
    </Card>
  );
};

export default memo(CurrencySwapForm);
