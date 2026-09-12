"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationService = void 0;
const paginationService = async (data, pageNumber, limit) => {
    const pageCount = Math.ceil(data.length / limit);
    const pages = pageNumber == null ? 1 : pageNumber;
    const pagenumbers = pageCount - pageCount % 1;
    const sliceData = data.slice(pages * limit - limit, pages * limit);
    const dataSet = [];
    dataSet.push({ totalItem: data.length, totalPage: pagenumbers, row: sliceData, currentPage: pageNumber });
    return dataSet;
};
exports.paginationService = paginationService;
//# sourceMappingURL=pagination.js.map