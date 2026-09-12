export interface IError {
	status: number;
	fields: {
		name: {
			message: string;
		};
	};
	message: string;
	name: string;
	errorMessageType:{
		message:string,
		type:string,
		resCode:string
	}
}

class ApiError extends Error implements IError {
	public status = 500;

	public success = false;

	public fields!: { name: { message: string } };

	public errorMessageType!: { message: string; type: string;resCode:string; };


	constructor(msg: string, statusCode: number, name: string = 'ApiError') {
		super();
		this.message = msg;
		this.status = statusCode;
		this.name = name;
	}
}

export default ApiError;
