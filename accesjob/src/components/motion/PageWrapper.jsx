// components/PageWrapper.jsx
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 0 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: 0, transition: { duration: 0.3 } },
};

const PageWrapper = ({ children }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {children}
        </motion.div>
    );
};

export default PageWrapper;
