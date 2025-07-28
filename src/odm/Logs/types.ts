/* NOTE - I added the undefined type
Because zod parsing the body that way and the TS screams at me
If I had more time I would definitely fix this
*/
export interface LogSearchQuery {
  serviceName?: string | undefined;
  message?: string | undefined;
  logLevel?: string | undefined;
  startDate: Date;
  endDate?: Date | undefined;
}