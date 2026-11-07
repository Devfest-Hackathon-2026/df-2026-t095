import Link from "next/link";
export default function NotFound(){return <main className="empty-state" style={{maxWidth:640,margin:"15vh auto",padding:48}}><h1 style={{fontSize:36,lineHeight:"40px"}}>A little too far elsewhere.</h1><p>This place doesn’t exist in our little corner of the web.</p><Link className="primary-button" href="/">Back to discovering</Link></main>;}
