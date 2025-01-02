declare namespace App {
  interface Locals {
    user?: {
      userId: number;
      orgId: number;
      email: string;
      fullName: string;
    };
  }
}

declare namespace Astro {
  interface Locals extends App.Locals { }
}
