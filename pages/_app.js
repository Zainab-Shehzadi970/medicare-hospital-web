import "../styles/globals.css";
import { useRouter } from "next/router";
import Layout from "../components/layout";

export default function App({ Component, pageProps }) {
  const router = useRouter();


  const withLayout = ["/"];

  if (!withLayout.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}