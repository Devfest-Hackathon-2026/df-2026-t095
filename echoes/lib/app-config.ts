export type FirebaseConfig={apiKey:string;authDomain:string;projectId:string;appId:string;messagingSenderId?:string;storageBucket?:string;measurementId?:string};
export type AppConfig={projectId:string;mapsKey:string;liveSearch:boolean;places:boolean;routes:boolean;translation:boolean;firebase:FirebaseConfig|null;googleSignIn:boolean;};
