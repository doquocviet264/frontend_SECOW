import Header from "./Header";
import Footer from "./Footer";

type Props = {
  children: React.ReactNode;
};

export default function PageLayout({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex flex-col items-center w-full">{children}</main>
      <Footer />
    </div>
  );
}
