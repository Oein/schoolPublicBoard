import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

const variants = {
  fadeIn: {
    x: 100,
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  inactive: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  fadeOut: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

/*
 * Read the blog post here:
 * https://letsbuildui.dev/articles/animated-page-transitions-in-nextjs
 */
const TransitionEffect2 = ({ children }: React.PropsWithChildren) => {
  const { asPath } = useRouter();

  return (
    <div className="transition">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={asPath}
          variants={variants}
          initial="fadeIn"
          animate="inactive"
          exit="fadeOut"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TransitionEffect2;
