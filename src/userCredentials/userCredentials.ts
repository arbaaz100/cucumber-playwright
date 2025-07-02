export enum UserType {
  ARBAAZ = 'Arbaaz',
  ARBAAZ_LIVE = 'Arbaaz_Live'
}

export interface UserCredentials {
  email: string;
  password: string;
  displayName: string;
}

export const USER_CREDENTIALS: Record<UserType, UserCredentials> = {
  [UserType.ARBAAZ]: {
    email: 'arbaaz100@gmail.com',
    password: 'Arbaaz@786',
    displayName: 'Arbaaz'
  },
  [UserType.ARBAAZ_LIVE]: {
    email: 'arbaaz100@live.com',
    password: 'Arbaaz@786',
    displayName: 'Arbaaz'
  }
} as const;


// Alternative helper using enum value
export function getUserCredentials(userType: UserType): UserCredentials {
  return USER_CREDENTIALS[userType];
}