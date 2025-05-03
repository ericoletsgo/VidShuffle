import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./store";

const basename = import.meta.env.DEV ? '/VidShuffle/' : '/';

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={basename}>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
