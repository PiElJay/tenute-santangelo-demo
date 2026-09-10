import type { Metadata } from 'next';
import { imagePath, logo } from '@/lib/catalog';
import './globals.css';
export const metadata:Metadata={title:'Tenute Santangelo — Il sole, a casa tua',description:'Agrumi, olio extravergine di oliva e specialità siciliane. Scopri il mondo di Tenute Santangelo, a Sciacca.',robots:{index:false,follow:false},icons:{icon:imagePath(logo)}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="it"><body>{children}</body></html>}
