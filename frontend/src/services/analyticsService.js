import API from "./api";

export async function getDistrictAnalytics() {
  const response = await API.get("/api/analytics/district");
  return response.data;
}
