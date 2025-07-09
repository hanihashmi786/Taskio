import API from "./index";
export function getLabels() {
  return API.get("/labels/");
}
