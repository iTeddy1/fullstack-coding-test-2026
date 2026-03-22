import ChatContainer from "@/features/chat/components/ChatContainer";
import { lazy } from "react";

const ReactQueryDevtools =
  import.meta.env.MODE === "development"
    ? lazy(() =>
        import("@tanstack/react-query-devtools").then((module) => ({
          default: module.ReactQueryDevtools,
        })),
      )
    : () => null;

function App() {
  return (
    <>
      <ChatContainer />
      <ReactQueryDevtools />
    </>
  );
}

export default App;
