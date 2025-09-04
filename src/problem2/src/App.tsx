import "./App.css";
import { ConfigProvider, Typography } from "antd";
import CurrencySwapForm from "./components/CurrencySwapForm";

const { Title } = Typography;

function App() {
  return (
    <ConfigProvider>
      <div>
        <Title
          level={1}
          style={{
            color: "Black",
            textAlign: "center",
            marginBottom: 40,
            fontSize: "2.5rem",
            fontWeight: 700,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Token Swap Exchange
        </Title>
        <CurrencySwapForm />
      </div>
    </ConfigProvider>
  );
}

export default App;
