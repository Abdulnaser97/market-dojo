import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import "./styles/global.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {props.children}
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
