"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnquiry = createEnquiry;
exports.listEnquiries = listEnquiries;
exports.getEnquiryById = getEnquiryById;
exports.updateEnquiryStatus = updateEnquiryStatus;
exports.retryEmailNotification = retryEmailNotification;
exports.recoverPending = recoverPending;
const dal = __importStar(require("../../db/dal/contacts"));
async function createEnquiry(data) {
    return await dal.createContactEnquiry(data);
}
async function listEnquiries(params) {
    return await dal.getAllContactEnquiries(params);
}
async function getEnquiryById(id) {
    return await dal.getContactEnquiryById(id);
}
async function updateEnquiryStatus(id, status) {
    return await dal.updateContactEnquiryStatus(id, status);
}
async function retryEmailNotification(id) {
    return await dal.retryEnquiryEmail(id);
}
async function recoverPending() {
    return await dal.recoverPendingEnquiries();
}
//# sourceMappingURL=contact.service.js.map