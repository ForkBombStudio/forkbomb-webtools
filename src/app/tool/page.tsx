"use client";

import HeaderBar from "../components/header-bar"
import Loading from "../components/loading"
import { Suspense } from "react";
import { useSearchParams } from "next/navigation"
import { JSX } from "react"
import dynamic from "next/dynamic";

{ /* Lazy tool loading */ }
const Zip = dynamic(() => import("../assets/tools/file-compression/zip"), {
    loading: () => <Loading />,
    ssr: false,
});

const toolsMap: Map<string, JSX.Element> = new Map([
    ["file-compression-zip", <Zip key={0} />],
    // Add more tools here as needed 
]);

function Tool() {
    const params = useSearchParams()
    const category = params.get("category") as string
    const toolName = params.get("toolName") as string

    console.log(params)

    let content : JSX.Element = (
        <p>No Content</p>
    )

    content = toolsMap.get(`${category}-${toolName}`) || content


    return (
        <>
            <HeaderBar />
            <main className="p-[1rem] pt-[4rem] flex gap-2 flex-col h-screen">
                <h1 className="text-4xl font-bold">
                    { toolName }
                </h1>
                { content }
            </main>
        </>
    );
}

export default function ToolPage() {
    return (
        <Suspense>
            <Tool />
        </Suspense>
    )
}