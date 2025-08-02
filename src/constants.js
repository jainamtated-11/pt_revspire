/* eslint-disable camelcase */
// global variables

import canvaImage from "./assets/canva.svg";
import Cookies from "js-cookie";
import {
  disconnectCanva,
  handleCanvaAuthorization,
} from "./utils/integrationHandlers";

const userData = JSON.parse(Cookies.get("userData") || "{}");
export const base_url = `https://${userData?.organisation?.tenant_api_name}.revspire.io`;

export const text_field_types = ["char", "varchar", "enum", "picklist", "text"];

export const text_field_type_conditions = [
  { name: "Null" },
  { name: "Not Equals" },
  { name: "Not Null" },
  { name: "Does Not Contain" },
  { name: "Contains" },
  { name: "Equals" },
];

export const int_field_types = ["int", "tinyint", "float"];
export const int_field_type_conditions = [
  { name: "Null" },
  { name: "Greater Than" },
  { name: "Not Equals" },
  { name: "Lesser Than Or Equals" },
  { name: "Greter Than Or Equals" },
  { name: "Lesser Than" },
  { name: "Not Null" },
  { name: "Equals" },
];

export const date_field_types = ["datetime", "timestamp"];
export const date_field_types_conditions = [
  { name: "Null" },
  { name: "Greater Than" },
  { name: "Not Equals" },
  { name: "Lesser Than Or Equals" },
  { name: "Greter Than Or Equals" },
  { name: "Lesser Than" },
  { name: "Not Null" },
  { name: "Equals" },
];

// global function for returning the date in the format of DD/MM/YYYY
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month starts from 0
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  // return "";
};

// integrations
export const integrations = [
  {
    id: "canva",
    text: "Canva",
    iconURL: canvaImage,
    iconAlt: "Canva logo",
    handler: handleCanvaAuthorization,
    desc: "Easy-to-use online design tool for creating graphics, presentations, and visual content.",
    isConnected: false,
    disconnect: disconnectCanva,
  },
];
