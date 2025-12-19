import {
  SignedIn,
  SignInButton,
  SignUpButton,
  SignedOut,
  UserButton,
  SignOutButton,
} from "@clerk/nextjs";
import Header from "./_components/Header";
import Footer from "@/src/components/Footer";
import EditorPanel from "./_components/EditorPanel";
import OutputPanel from "./_components/OutputPanel";
export default function Home() {
  return (
    <div>
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <EditorPanel />
        <OutputPanel />
      </div>
      
    </div>
  );
}
