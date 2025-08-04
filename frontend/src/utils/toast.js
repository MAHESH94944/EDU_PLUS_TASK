import { toast } from "react-toastify";

export const showApiError = (error) => {
  const msg =
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred.";
  toast.error(msg, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
