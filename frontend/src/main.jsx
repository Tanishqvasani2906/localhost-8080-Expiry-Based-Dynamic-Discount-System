import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SnackbarProvider } from "notistack";
import LandingPage from "./components/LandingPage.jsx";
import AddProduct from "./product/AddProduct.jsx";

const withSnackbar = (Component) => (
  <SnackbarProvider maxSnack={3}>
    <Component />
  </SnackbarProvider>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: withSnackbar(App),
    children: [
      {
        index: true,
        element: withSnackbar(LandingPage),
      },
      {
        path: "addProduct",
        element: withSnackbar(AddProduct),
      },
    ],
  },
  {
    path: "*",
    element: <></>,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
