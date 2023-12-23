declare module 'PrincessScript' {

  type location = {
    row: number;
    column: number;
  }

  export type PrincessState = {
    filename: string;
    location: location;
  }
}