export interface IStandardResponse {
	success: boolean;
}

export const returnSuccess = (statusCode: number, code: any, data = {}) => ({
    statusCode,
    response: {
        code,
        data,
    },
});