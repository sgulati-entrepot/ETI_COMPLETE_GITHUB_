"use client";

import {usePathname} from "next/navigation";
import Script from "next/script";

const ZOHO_SALESIQ_WIDGET="https://salesiq.zohopublic.in/widget?wc=siq575bcf63317e6897cf385d77a97ed68f06ea585966d085a30022929035fea5e3bdc27d7bb244c497498f653c230c3f0d";

export default function ZohoSalesIQ(){
  const pathname=usePathname();
  if(pathname==="/customised-corporate-training")return null;
  return <>
    <Script id="zoho-salesiq-init" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:"window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};"}}/>
    <Script id="zsiqscript" src={ZOHO_SALESIQ_WIDGET} strategy="afterInteractive"/>
  </>;
}
