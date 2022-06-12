export enum UserStatus
{
    online = 'online',
    offline = 'offline',
    playing = 'playing',
}

export enum UserLevel
{
    beginner = 'beginner',
    advanced = 'advanced',
    pro = 'pro',
    expert = 'expert',
}

export class User
{
    constructor(
        public id: number,
        public username: string,
        public socketId: string,
        public picture: string,
        public status: UserStatus,
        public level: UserLevel,
        public wins: number,
        public losses: number,
        public rank: number,
    ) {}
}