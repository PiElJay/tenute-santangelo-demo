import Admin from '@/components/admin';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Studio Santangelo — Amministrazione demo',robots:{index:false,follow:false}};
export default function Page(){return <Admin/>}
