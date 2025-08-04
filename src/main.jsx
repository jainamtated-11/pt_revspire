import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GlobalState } from "./context/GlobalState.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { CookiesProvider } from "react-cookie";
import { AuthProvider } from "./Authentication/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <Provider store={store}>
        <GlobalState>
          <AuthProvider>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </AuthProvider>
        </GlobalState>
      </Provider>
    </CookiesProvider>
  </Router>
);
