export enum ChannelStatus
{
    public = 'public',
    private = 'private',
    protected = 'protected',
}

export class Channel
{
    constructor(
        public id: number,
        public name: string,
        public status: ChannelStatus,
    ) {}
}