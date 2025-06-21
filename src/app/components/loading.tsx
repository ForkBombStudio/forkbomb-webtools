
import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center
            gap-4 text-center"
        >
            <motion.div
                className="w-24 h-24 rounded-full border-8 border-t-black"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear"
                }}
            />
            <h2
                className="text-3xl font-bold"
            >
                Loading...
            </h2>
        </div>
    );
}