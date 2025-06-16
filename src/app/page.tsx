
import HeaderBar from "@/app/components/header-bar";

export default function Home() {
    return (
        <>
            <main className="flex flex-col items-center h-screen p-[1rem] 
            gap-y-5 justify-center">
                <h1 className="text-4xl text-pretty text-center">
                    Web Tools by Forkbomb Studio 
                </h1>
                <div className="flex flex-row gap-x-4">
                    <a href="/home" className="block border border-gray-300
                    rounded-md px-4 py-2 text-gray-700 hover:bg-green-500 
                    bg-green-400">
                        Browse Tools
                    </a>
                    <a href="/about" className="block border border-gray-300 
                    rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100">
                        About
                    </a>
                </div>
            </main>
            <footer className="fixed bottom-0 left-0 right-0 min-h-[2rem]">

            </footer>
        </>
    );
}
