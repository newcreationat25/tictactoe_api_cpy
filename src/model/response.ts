export class reponse {
    status!: boolean;
    message!: string;
    data!: any;
    error!: error;
    timestamp: Date = new Date(new Date().toISOString());
} 

export class error {
    code!: number;
    details!: string;
}