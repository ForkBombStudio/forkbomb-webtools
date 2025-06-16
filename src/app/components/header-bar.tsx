
import { NavContext } from "@/app/assets/scripts/nav-context";

/* Breadcrumbs Handling */


/* Compoenents */

function HeaderBranding() {
    return (
        <div className="pl-[1rem]">
            <h1>Forkbomb Tools</h1>
        </div>
    );
}

function HeaderNavigation() {
    return (
        <nav className="pr-[2rem]">
            <ul className="flex list-none">
                <li><a>File Tools</a></li>
            </ul>
        </nav>
    );
}

export default function HeaderBar() {
    return (
        <header className="flex h-[3rem] bg-[#63a46c] text-white 
            justify-between items-center fixed w-screen top-0">
            <HeaderBranding />
            <HeaderNavigation />
        </header>
    );
}