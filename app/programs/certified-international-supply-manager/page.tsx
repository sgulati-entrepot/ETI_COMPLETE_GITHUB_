import {BrochureCoursePage} from "../../components";
import programData from "../program-data.json";
const course=programData.find(program=>program.slug==="certified-international-supply-manager")!;
export default function Page(){return <BrochureCoursePage course={course}/>}
