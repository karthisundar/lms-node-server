interface IEnvironment {
	port: number;
	// secretKey: string;
	applyEncryption: boolean;
	db: {
		'host': string,
		'port': number,
		'database': string,
		'password': string,
		'name': string,
		'user': string,
	};

}

export default IEnvironment;
