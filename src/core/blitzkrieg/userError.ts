/**
 * Discriminator for user caused errors to not report in logs
 */
export class UserError {
  constructor(
    public message: string,
    public cause: string,
  ) {}
}
