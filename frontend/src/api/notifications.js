import API from "./index";

export const fetchNotifications = () => API.get("/notifications/");
export const markNotificationsAsRead = () => API.patch("/notifications/mark-read/");
export const deleteNotification = (id) => API.delete(`/notifications/${id}/delete/`); 