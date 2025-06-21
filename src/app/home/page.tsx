"use client"

import HeaderBar from "../components/header-bar"
import Link from "next/link"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ToolMetadata = {
    id: string
    name: string
    category: string
    description: string
    path: string
    iconPath: string
}

function ToolCard({ tool }: { tool: ToolMetadata }) {

    return (
        <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="border border-gray-300 rounded-md align-middle">
            <Link
            className="flex flex-row items-center pl-2 pr-2 gap-1"
            href={ `/tool?category=${tool.category}&toolName=${tool.id}` }>
                <img
                    src={tool.iconPath}
                    alt={`${tool.name} icon`} 
                    className="w-12 h-12"
                />
                <div className="flex flex-col  
                p-3 w-30 h-20 justify-between">
                    <h3
                        className="text-lg font-semibold text-gray-800"
                    >
                        { tool.name }
                    </h3>
                    <p>
                        { tool.description }
                    </p>
                </div>
            </Link>
        </motion.div>
    )
}

function ToolList({title, tools}: {title: string | null, tools: ToolMetadata[]}) {

    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col">
            {
                title && 
                (
                    <h2 className="text-2xl font-bold mb-4">
                        { title }
                    </h2>
                )
            }
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
            gap-3">
                {
                    tools.map((tool, index) => (
                        <ToolCard key={`${title}-${index}`} tool={tool} />
                    ))
                }
            </div>
        </motion.div>
    )
}

export default function HomePage() {

    const [tools, setTools] = useState<Map<string, ToolMetadata[]>>(new Map())

    useEffect(() => {
        fetch("/tools/list.json").then(
        res => {
            res.json().then(
                data => {
                    const toolMap = new Map<string, ToolMetadata[]>();
                    for (const tool in data) {
                        toolMap.set(data[tool].title, data[tool].tools);
                    }
                    setTools(toolMap);
                }
            )
        }
    )
    }, []);

    

    return (
        <>
            <HeaderBar />
            <main className="flex flex-col p-[1rem] pt-[4rem] 
            justify-start gap-5 mb-3">
                {
                    Array.from(tools.entries()).map(([category, toolList]) => (
                        <ToolList key={category} title={category} tools={toolList} />
                    ))
                }
            </main>
            <footer className="h-[3rem] p-1 text-center">
                Created by Forkbomb Studio © 2025
            </footer>
        </>
    )
}