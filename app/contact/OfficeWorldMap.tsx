"use client";
import { useState } from "react";

const offices={
  dubai:{city:"Dubai",country:"United Arab Emirates",phone:"+971 54 417 7480",lat:25.276987,lng:55.296249,href:"https://www.google.com/maps/search/?api=1&query=Al%20Bannai%20Building%20Al%20Nahda%20First%20Dubai"},
  mumbai:{city:"Mumbai",country:"India",phone:"+91 99206 56666",lat:19.1299,lng:72.8545,href:"https://www.google.com/maps/search/?api=1&query=Hubtown%20Viva%20Jogeshwari%20East%20Mumbai%20400060"}
} as const;
type OfficeKey=keyof typeof offices;

const mapUrl=(key:OfficeKey)=>{const o=offices[key];const span=key==="dubai"?.12:.11;const bbox=[o.lng-span,o.lat-span,o.lng+span,o.lat+span].join("%2C");return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${o.lat}%2C${o.lng}`};

export default function OfficeWorldMap(){const[active,setActive]=useState<OfficeKey>("dubai");const office=offices[active];return <section className="office-world section-pad" aria-labelledby="global-presence-title"><div className="office-world-head"><div><span>Our global presence</span><h2 id="global-presence-title">Two offices.<br/>One connected institute.</h2></div><p>Explore our locations on the map, zoom into the neighbourhood and select either office for details.</p></div><div className="real-map-shell"><div className="real-map-tabs" role="tablist" aria-label="Choose an Entrepôt office">{(Object.keys(offices) as OfficeKey[]).map((key,index)=><button type="button" role="tab" aria-selected={active===key} key={key} className={active===key?"active":""} onClick={()=>setActive(key)}><span>0{index+1}</span>{offices[key].city}<i>↗</i></button>)}</div><div className="real-map-frame"><iframe key={active} title={`Interactive map of the Entrepôt ${office.city} office`} src={mapUrl(active)} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><div className="map-location-badge"><i/><span>Entrepôt Training Institute</span><strong>{office.city}</strong></div></div><aside className="real-map-office" aria-live="polite"><span>ETI Office · {active==="dubai"?"01":"02"}</span><h3>{office.city}</h3><p>{office.country}</p><a href={`tel:${office.phone.replace(/\s/g,"")}`}>{office.phone}</a><a className="map-office-link" href={office.href} target="_blank" rel="noreferrer">Open full directions ↗</a><small>Map data © OpenStreetMap contributors</small></aside></div></section>}
