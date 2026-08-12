import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {BrochureCoursePage} from "../../components";
import programData from "../program-data.json";

type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return programData.filter(program=>program.slug!=="certified-international-supply-manager").map(program=>({slug:program.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const program=programData.find(item=>item.slug===slug);if(!program)return {title:"Programme Not Found | Entrepôt Training Institute"};return {title:`${program.title} | Entrepôt Training Institute`,description:program.summary.slice(0,158),alternates:{canonical:`/programs/${program.slug}`}}}
export default async function ProgrammePage({params}:Props){const {slug}=await params;const program=programData.find(item=>item.slug===slug);if(!program)notFound();return <BrochureCoursePage course={program}/>}
