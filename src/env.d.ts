declare namespace App {
  interface Locals {
    user?: {
      userId: string;
      email: string;
      fullName: string;
    };
  }
}

declare namespace Astro {
  interface Locals extends App.Locals { }
}
