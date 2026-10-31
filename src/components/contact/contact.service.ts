import * as dal from "../../db/dal/contacts";

export async function createEnquiry(data: dal.CreateEnquiryInput) {
  return await dal.createContactEnquiry(data);
}

export async function listEnquiries(params: dal.ListEnquiriesParams) {
  return await dal.getAllContactEnquiries(params);
}

export async function getEnquiryById(id: number) {
  return await dal.getContactEnquiryById(id);
}

export async function updateEnquiryStatus(id: number, status: string) {
  return await dal.updateContactEnquiryStatus(id, status);
}

export async function retryEmailNotification(id: number) {
  return await dal.retryEnquiryEmail(id);
}

export async function recoverPending() {
  return await dal.recoverPendingEnquiries();
}
