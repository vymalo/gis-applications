import { signIn } from "@app/server/auth";
import { LogIn } from "react-feather";

export function LoginToKeepTrack() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button className="btn btn-outline btn-primary" type="submit">
        <span>Sign in with Google</span>
        <LogIn />
      </button>
    </form>
  );
}
