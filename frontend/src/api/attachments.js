import API, { uploadFile } from "./index";

// List attachments for a card
export function getAttachments(cardId) {
  return API.get(`attachments/?card=${cardId}`);
}

// Upload an attachment to a card
export function uploadAttachment(cardId, file) {
  const formData = new FormData();
  formData.append("card", cardId);
  formData.append("file", file);
  return uploadFile("attachments/", formData);
}

// Delete an attachment by id
export function deleteAttachment(attachmentId) {
  return API.delete("attachments/", { data: { id: attachmentId } });
} 