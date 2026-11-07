import Link from "next/link";
export default function NotFound(){return <main className="empty-state" style={{maxWidth:640,margin:"15vh auto",padding:48}}><h1 style={{fontSize:36,lineHeight:"40px"}}>ページが見つかりません。</h1><p>リンク先を確認するか、ホームから場所を探してみてください。</p><Link className="primary-button" href="/">場所を探す</Link></main>;}
