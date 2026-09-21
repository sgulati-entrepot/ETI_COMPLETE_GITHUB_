"use client";

import {useEffect} from "react";
import {usePathname} from "next/navigation";
import Script from "next/script";

const ZOHO_SALESIQ_WIDGET="https://salesiq.zohopublic.in/widget?wc=siq575bcf63317e6897cf385d77a97ed68f06ea585966d085a30022929035fea5e3bdc27d7bb244c497498f653c230c3f0d";
const ZOHO_EXCLUDED_PATHS=new Set(["/customised-corporate-training","/customised-corporate-trainings-programmes"]);
const ZOHO_HIDDEN_STYLE_ID="zoho-salesiq-route-exclusion";

export default function ZohoSalesIQ(){
  const pathname=usePathname();
  const excluded=ZOHO_EXCLUDED_PATHS.has(pathname);
  useEffect(()=>{
    document.getElementById(ZOHO_HIDDEN_STYLE_ID)?.remove();
    if(!excluded)return;
    const style=document.createElement("style");
    style.id=ZOHO_HIDDEN_STYLE_ID;
    style.textContent="#zsiq_float,#zsiq_floatmain,.zsiq_floatmain,.zsiq_custommain,.zls-sptwndw{display:none!important;visibility:hidden!important}";
    document.head.appendChild(style);
    return()=>style.remove();
  },[excluded]);
  if(excluded)return null;
  return <>
    <Script id="zoho-salesiq-init" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:"window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};"}}/>
    <Script id="zsiqscript" src={ZOHO_SALESIQ_WIDGET} strategy="afterInteractive"/>
  </>;
}
