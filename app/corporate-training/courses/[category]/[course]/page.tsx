import type {Metadata} from "next";
import {notFound} from "next/navigation";
import courseData from "../../../course-data.json";
import {CorporateCoursePage} from "../../../course-page";

type RouteParams={category:string;course:string};
type PageProps={params:Promise<RouteParams>};

export function generateStaticParams(){return courseData.map(course=>({category:course.categorySlug,course:course.slug}))}

export async function generateMetadata({params}:PageProps):Promise<Metadata>{const route=await params;const course=courseData.find(item=>item.categorySlug===route.category&&item.slug===route.course);if(!course)return {title:"Course Not Found | Entrepôt Training Institute"};return {title:`${course.title} | Corporate Training | ETI`,description:course.overview.slice(0,158),alternates:{canonical:`/corporate-training/courses/${course.categorySlug}/${course.slug}`}}}

export default async function CorporateCourse({params}:PageProps){const route=await params;const course=courseData.find(item=>item.categorySlug===route.category&&item.slug===route.course);if(!course)notFound();return <CorporateCoursePage course={course}/>}
