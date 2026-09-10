import Storefront from '@/components/storefront';
import type { Metadata } from 'next';
export const metadata: Metadata = {title:'Tenute Santangelo — A taste of Sicilian sunshine',description:'Discover Sicilian citrus, extra virgin olive oil and specialities from Tenute Santangelo.'};
export default function Page(){ return <Storefront lang="en"/>; }
