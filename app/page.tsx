import Image from "next/image";
import styles from "./styles/page.module.css";
import splash from "@/public/images/splash.jpeg";

export default function Home() {
  return (
    <div className={styles.page}>
      <Image
        src={splash}
        alt="splash-image"
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}
