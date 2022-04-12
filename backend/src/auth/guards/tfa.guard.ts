import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class TfaGuard extends AuthGuard('jwt-tfa') {}