// export interface User {
//   username: string ;
//   password: string ;
//   token?: string;
// }

import { Rol } from "./rol.interface";

export interface User {
  userId?: number;
  fullname?: string;
  username: string;
  password?: string;
  roles?: Rol[];
  token?: string;
}
